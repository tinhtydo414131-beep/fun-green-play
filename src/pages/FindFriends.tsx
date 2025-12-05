import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus, Users, Home, Trophy, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Stories } from "@/components/Stories";

interface UserResult {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  total_plays: number;
  leaderboard_score: number;
  wallet_address: string | null;
  isFriend: boolean;
  isPending: boolean;
}

export default function FindFriends() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [dailyRequestCount, setDailyRequestCount] = useState(0);
  const MAX_DAILY_REQUESTS = 20;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSuggestedUsers();
      checkDailyRequestCount();
    }
  }, [user]);

  const checkDailyRequestCount = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("friend_requests")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", user?.id)
      .gte("created_at", `${today}T00:00:00`);
    
    setDailyRequestCount(count || 0);
  };

  const fetchSuggestedUsers = async () => {
    setLoading(true);
    try {
      // Get current friends
      const { data: friends } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user?.id);

      const friendIds = friends?.map(f => f.friend_id) || [];

      // Get pending requests
      const { data: pendingRequests } = await supabase
        .from("friend_requests")
        .select("receiver_id")
        .eq("sender_id", user?.id)
        .eq("status", "pending");

      const pendingIds = pendingRequests?.map(r => r.receiver_id) || [];

      // Get top users who are not friends
      const { data: users, error } = await supabase
        .from("profiles")
        .select("id, username, email, avatar_url, total_plays, leaderboard_score, wallet_address")
        .neq("id", user?.id)
        .order("leaderboard_score", { ascending: false })
        .limit(20);

      if (error) throw error;

      const usersWithStatus = users?.map(u => ({
        ...u,
        isFriend: friendIds.includes(u.id),
        isPending: pendingIds.includes(u.id)
      })).filter(u => !u.isFriend) || [];

      setSuggestedUsers(usersWithStatus);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Get current friends
      const { data: friends } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user?.id);

      const friendIds = friends?.map(f => f.friend_id) || [];

      // Get pending requests
      const { data: pendingRequests } = await supabase
        .from("friend_requests")
        .select("receiver_id")
        .eq("sender_id", user?.id)
        .eq("status", "pending");

      const pendingIds = pendingRequests?.map(r => r.receiver_id) || [];

      // Search by username, email, or wallet address
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, email, avatar_url, total_plays, leaderboard_score, wallet_address")
        .neq("id", user?.id)
        .or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,wallet_address.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      const usersWithStatus = data?.map(u => ({
        ...u,
        isFriend: friendIds.includes(u.id),
        isPending: pendingIds.includes(u.id)
      })) || [];

      setSearchResults(usersWithStatus);
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const sendFriendRequest = async (targetUser: UserResult) => {
    if (dailyRequestCount >= MAX_DAILY_REQUESTS) {
      toast.error(`Daily limit reached! You can only send ${MAX_DAILY_REQUESTS} requests per day 🛡️`);
      return;
    }

    setSendingRequest(targetUser.id);
    try {
      const { error } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: user?.id,
          receiver_id: targetUser.id,
          status: "pending"
        });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast.error("Request already sent!");
        } else {
          throw error;
        }
        return;
      }

      // Trigger confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      toast.success(`Friend request sent to ${targetUser.username}! 🎉`);
      setDailyRequestCount(prev => prev + 1);

      // Update local state
      setSuggestedUsers(prev => 
        prev.map(u => u.id === targetUser.id ? { ...u, isPending: true } : u)
      );
      setSearchResults(prev => 
        prev.map(u => u.id === targetUser.id ? { ...u, isPending: true } : u)
      );
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast.error("Couldn't send request");
    } finally {
      setSendingRequest(null);
    }
  };

  const UserCard = ({ user: targetUser, index }: { user: UserResult; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-primary/30">
              <AvatarImage src={targetUser.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-fredoka font-bold text-lg">
                {targetUser.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-fredoka font-bold text-lg truncate">{targetUser.username}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Score: {targetUser.leaderboard_score.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              {targetUser.isFriend ? (
                <Button variant="outline" disabled className="gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Friends
                </Button>
              ) : targetUser.isPending ? (
                <Button variant="outline" disabled className="gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Pending
                </Button>
              ) : (
                <Button
                  onClick={() => sendFriendRequest(targetUser)}
                  disabled={sendingRequest === targetUser.id}
                  className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                >
                  {sendingRequest === targetUser.id ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Add Friend
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Users className="w-16 h-16 text-primary animate-bounce mx-auto" />
          <p className="text-2xl font-fredoka text-primary">Finding friends... ⏳</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navigation />
      
      <section className="pt-24 md:pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Stories Section */}
          <Stories />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="font-bold group"
            >
              <Home className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
              Back
            </Button>
            <div className="text-sm text-muted-foreground">
              Requests today: {dailyRequestCount}/{MAX_DAILY_REQUESTS}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Find Friends 👋
            </h1>
            <p className="text-muted-foreground">Search by name, email, or wallet address</p>
          </div>

          {/* Search */}
          <Card className="mb-8 border-2 border-primary/30">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search users..."
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={searchLoading}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  {searchLoading ? "🔍" : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-fredoka font-bold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Search Results ({searchResults.length})
              </h2>
              <div className="space-y-3">
                {searchResults.map((u, i) => (
                  <UserCard key={u.id} user={u} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Suggested Users */}
          <div>
            <h2 className="text-xl font-fredoka font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Suggested Friends
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-14 bg-muted rounded-lg" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : suggestedUsers.length > 0 ? (
              <div className="space-y-3">
                {suggestedUsers.map((u, i) => (
                  <UserCard key={u.id} user={u} index={i} />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-muted">
                <CardContent className="p-8 text-center">
                  <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No suggestions available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
