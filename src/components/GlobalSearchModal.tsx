import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, UserPlus, Check, Clock, MessageCircle, X, Wallet } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  username: string;
  avatar_url: string | null;
  wallet_address: string | null;
  leaderboard_score: number;
  friendStatus: "none" | "friends" | "pending_sent" | "pending_received";
  requestId?: string;
}

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !user) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Get friends list
      const { data: friends } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user.id);
      const friendIds = new Set(friends?.map(f => f.friend_id) || []);

      // Get pending sent requests
      const { data: sentRequests } = await supabase
        .from("friend_requests")
        .select("receiver_id, id")
        .eq("sender_id", user.id)
        .eq("status", "pending");
      const sentMap = new Map(sentRequests?.map(r => [r.receiver_id, r.id]) || []);

      // Get pending received requests
      const { data: receivedRequests } = await supabase
        .from("friend_requests")
        .select("sender_id, id")
        .eq("receiver_id", user.id)
        .eq("status", "pending");
      const receivedMap = new Map(receivedRequests?.map(r => [r.sender_id, r.id]) || []);

      // Search by username or wallet address
      const { data: users, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, wallet_address, leaderboard_score")
        .neq("id", user.id)
        .or(`username.ilike.%${searchQuery}%,wallet_address.ilike.%${searchQuery}%`)
        .order("leaderboard_score", { ascending: false })
        .limit(20);

      if (error) throw error;

      const resultsWithStatus: SearchResult[] = (users || []).map(u => {
        let friendStatus: SearchResult["friendStatus"] = "none";
        let requestId: string | undefined;

        if (friendIds.has(u.id)) {
          friendStatus = "friends";
        } else if (sentMap.has(u.id)) {
          friendStatus = "pending_sent";
          requestId = sentMap.get(u.id);
        } else if (receivedMap.has(u.id)) {
          friendStatus = "pending_received";
          requestId = receivedMap.get(u.id);
        }

        return { ...u, friendStatus, requestId };
      });

      setResults(resultsWithStatus);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    searchUsers(debouncedQuery);
  }, [debouncedQuery, searchUsers]);

  const sendFriendRequest = async (targetUser: SearchResult) => {
    setProcessingId(targetUser.id);
    try {
      const { error } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: user?.id,
          receiver_id: targetUser.id,
          status: "pending"
        });

      if (error) throw error;

      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      toast.success(`Đã gửi lời mời kết bạn đến ${targetUser.username}! 🎉`);
      
      setResults(prev => prev.map(r => 
        r.id === targetUser.id ? { ...r, friendStatus: "pending_sent" } : r
      ));
    } catch (error: any) {
      toast.error("Không thể gửi lời mời kết bạn");
    } finally {
      setProcessingId(null);
    }
  };

  const cancelRequest = async (targetUser: SearchResult) => {
    if (!targetUser.requestId) return;
    setProcessingId(targetUser.id);
    try {
      await supabase
        .from("friend_requests")
        .delete()
        .eq("id", targetUser.requestId);

      toast.info("Đã hủy lời mời kết bạn");
      setResults(prev => prev.map(r => 
        r.id === targetUser.id ? { ...r, friendStatus: "none", requestId: undefined } : r
      ));
    } catch (error) {
      toast.error("Không thể hủy lời mời");
    } finally {
      setProcessingId(null);
    }
  };

  const acceptRequest = async (targetUser: SearchResult) => {
    if (!targetUser.requestId) return;
    setProcessingId(targetUser.id);
    try {
      // Update request status
      await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", targetUser.requestId);

      // Create friendship (both directions)
      await supabase.from("friends").insert([
        { user_id: user?.id, friend_id: targetUser.id },
        { user_id: targetUser.id, friend_id: user?.id }
      ]);

      // Update friend counts
      const { data: userProfile } = await supabase.from("profiles").select("total_friends").eq("id", user?.id).single();
      const { data: targetProfile } = await supabase.from("profiles").select("total_friends").eq("id", targetUser.id).single();
      
      await supabase.from("profiles").update({ total_friends: (userProfile?.total_friends || 0) + 1 }).eq("id", user?.id);
      await supabase.from("profiles").update({ total_friends: (targetProfile?.total_friends || 0) + 1 }).eq("id", targetUser.id);

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      toast.success(`Bạn và ${targetUser.username} đã trở thành bạn bè! 🎊`);
      
      setResults(prev => prev.map(r => 
        r.id === targetUser.id ? { ...r, friendStatus: "friends", requestId: undefined } : r
      ));
    } catch (error) {
      toast.error("Không thể chấp nhận lời mời");
    } finally {
      setProcessingId(null);
    }
  };

  const rejectRequest = async (targetUser: SearchResult) => {
    if (!targetUser.requestId) return;
    setProcessingId(targetUser.id);
    try {
      await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", targetUser.requestId);

      toast.info("Đã từ chối lời mời kết bạn");
      setResults(prev => prev.map(r => 
        r.id === targetUser.id ? { ...r, friendStatus: "none", requestId: undefined } : r
      ));
    } catch (error) {
      toast.error("Không thể từ chối lời mời");
    } finally {
      setProcessingId(null);
    }
  };

  const openChat = (targetUser: SearchResult) => {
    onOpenChange(false);
    navigate(`/messages?with=${targetUser.id}`);
  };

  const viewProfile = (targetUser: SearchResult) => {
    onOpenChange(false);
    navigate(`/profile/${targetUser.id}`);
  };

  const truncateAddress = (address: string | null) => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Tìm kiếm người dùng
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tên hoặc địa chỉ ví (0x...)..."
              className="pl-10 h-12 text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="p-4 pt-0 space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Không tìm thấy người dùng nào</p>
              </div>
            )}

            {!loading && !query && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Tìm bạn bè bằng tên hoặc địa chỉ ví</p>
                <p className="text-xs mt-1">Nhấn "/" để mở nhanh tìm kiếm</p>
              </div>
            )}

            <AnimatePresence>
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => viewProfile(result)}
                >
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={result.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {result.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{result.username}</p>
                    {result.wallet_address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        {truncateAddress(result.wallet_address)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Score: {result.leaderboard_score.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {result.friendStatus === "friends" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-green-600 border-green-200"
                          disabled
                        >
                          <Check className="w-4 h-4" />
                          Bạn bè
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openChat(result)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {result.friendStatus === "pending_sent" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-yellow-600 border-yellow-200"
                        onClick={() => cancelRequest(result)}
                        disabled={processingId === result.id}
                      >
                        <Clock className="w-4 h-4" />
                        Đã gửi
                      </Button>
                    )}

                    {result.friendStatus === "pending_received" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          onClick={() => acceptRequest(result)}
                          disabled={processingId === result.id}
                        >
                          Đồng ý
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequest(result)}
                          disabled={processingId === result.id}
                        >
                          Từ chối
                        </Button>
                      </div>
                    )}

                    {result.friendStatus === "none" && (
                      <Button
                        size="sm"
                        className="gap-1 bg-gradient-to-r from-primary to-secondary"
                        onClick={() => sendFriendRequest(result)}
                        disabled={processingId === result.id}
                      >
                        {processingId === result.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Thêm bạn
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
