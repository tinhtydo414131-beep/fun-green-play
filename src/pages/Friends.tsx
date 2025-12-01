import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Search, MessageCircle, CheckCircle, XCircle, Home, Send, Coins, Eye, History, Trophy, MoreVertical, UserMinus, Ban } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { JoyBot } from "@/components/JoyBot";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Friend {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  wallet_balance: number;
  total_plays: number;
  wallet_address: string | null;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  sender: {
    username: string;
    email: string;
  };
  status: string;
}

interface Transaction {
  id: string;
  amount: number;
  created_at: string;
  from_user_id: string | null;
  to_user_id: string | null;
  status: string;
  notes: string | null;
}

export default function Friends() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [sendAmount, setSendAmount] = useState("");
  const [parentApprovalOpen, setParentApprovalOpen] = useState(false);
  const [parentPassword, setParentPassword] = useState("");
  const [pendingTransfer, setPendingTransfer] = useState<{friend: Friend, amount: number} | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [viewingFriend, setViewingFriend] = useState<Friend | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();
      fetchTransactions();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id, profiles!friends_friend_id_fkey(id, username, email, avatar_url, wallet_balance, total_plays, wallet_address)")
        .eq("user_id", user?.id);

      if (error) throw error;

      const friendsList = data?.map((f: any) => ({
        id: f.profiles.id,
        username: f.profiles.username,
        email: f.profiles.email,
        avatar_url: f.profiles.avatar_url,
        wallet_balance: f.profiles.wallet_balance || 0,
        total_plays: f.profiles.total_plays || 0,
        wallet_address: f.profiles.wallet_address,
      })) || [];

      setFriends(friendsList);
    } catch (error: any) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("id, sender_id, status, profiles!friend_requests_sender_id_fkey(username, email)")
        .eq("receiver_id", user?.id)
        .eq("status", "pending");

      if (error) throw error;

      const requestsList = data?.map((r: any) => ({
        id: r.id,
        sender_id: r.sender_id,
        sender: {
          username: r.profiles.username,
          email: r.profiles.email,
        },
        status: r.status,
      })) || [];

      setRequests(requestsList);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select(`
          id,
          amount,
          created_at,
          from_user_id,
          to_user_id,
          status,
          notes
        `)
        .or(`from_user_id.eq.${user?.id},to_user_id.eq.${user?.id}`)
        .eq("token_type", "CAMLY")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
    }
  };

  const viewProfile = (friend: Friend) => {
    setViewingFriend(friend);
    setProfileDialogOpen(true);
  };

  const sendFriendRequest = async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email address!");
      return;
    }

    try {
      // Find user by email
      const { data: targetUser, error: findError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("email", searchEmail.trim())
        .single();

      if (findError || !targetUser) {
        toast.error("User not found! 😢");
        return;
      }

      if (targetUser.id === user?.id) {
        toast.error("You can't add yourself as a friend! 😄");
        return;
      }

      // Send friend request
      const { error: requestError } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: user?.id,
          receiver_id: targetUser.id,
          status: "pending",
        });

      if (requestError) {
        if (requestError.message.includes("duplicate")) {
          toast.error("Friend request already sent!");
        } else {
          throw requestError;
        }
        return;
      }

      toast.success(`Friend request sent to ${targetUser.username}! 🎉`);
      setSearchEmail("");
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast.error("Couldn't send friend request 😢");
    }
  };

  const acceptRequest = async (requestId: string, senderId: string) => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Create bidirectional friendship
      const { error: friendError } = await supabase
        .from("friends")
        .insert([
          { user_id: user?.id, friend_id: senderId },
          { user_id: senderId, friend_id: user?.id },
        ]);

      if (friendError) throw friendError;

      // Update total_friends count
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("total_friends")
        .eq("id", user?.id)
        .single();

      if (currentProfile) {
        await supabase
          .from("profiles")
          .update({ total_friends: (currentProfile.total_friends || 0) + 1 })
          .eq("id", user?.id);
      }

      toast.success("Friend request accepted! 🎊");
      fetchFriends();
      fetchRequests();
    } catch (error: any) {
      console.error("Error accepting request:", error);
      toast.error("Couldn't accept request 😢");
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Friend request rejected");
      fetchRequests();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error("Couldn't reject request 😢");
    }
  };

  const openSendDialog = (friend: Friend) => {
    setSelectedFriend(friend);
    setSendAmount("");
    setSendDialogOpen(true);
  };

  const handleSendCAMLY = async () => {
    if (!selectedFriend || !sendAmount) {
      toast.error("Please enter an amount!");
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    // Get current user's balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user?.id)
      .single();

    if (!profile || profile.wallet_balance < amount) {
      toast.error("Insufficient CAMLY balance! 😢");
      return;
    }

    // Check if parent approval needed (>500k)
    if (amount > 500000) {
      setPendingTransfer({ friend: selectedFriend, amount });
      setSendDialogOpen(false);
      setParentApprovalOpen(true);
    } else {
      await executeTransfer(selectedFriend, amount);
    }
  };

  const handleParentApproval = async () => {
    // Simple parent password check (in production, use proper auth)
    if (parentPassword !== "parent2026") {
      toast.error("Incorrect parent password! 👨‍👩‍👧");
      return;
    }

    if (pendingTransfer) {
      await executeTransfer(pendingTransfer.friend, pendingTransfer.amount);
      setParentApprovalOpen(false);
      setParentPassword("");
      setPendingTransfer(null);
    }
  };

  const executeTransfer = async (friend: Friend, amount: number) => {
    try {
      // Create transaction record
      const { error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          from_user_id: user?.id,
          to_user_id: friend.id,
          amount,
          token_type: "CAMLY",
          status: "completed",
          notes: `Sent to friend ${friend.username}`,
        });

      if (txError) throw txError;

      // Update sender balance
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user?.id)
        .single();

      if (senderProfile) {
        await supabase
          .from("profiles")
          .update({ wallet_balance: senderProfile.wallet_balance - amount })
          .eq("id", user?.id);
      }

      // Update receiver balance
      const { data: receiverProfile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", friend.id)
        .single();

      if (receiverProfile) {
        await supabase
          .from("profiles")
          .update({ wallet_balance: receiverProfile.wallet_balance + amount })
          .eq("id", friend.id);
      }

      toast.success(`Successfully sent ${amount.toLocaleString()} CAMLY to ${friend.username}! 🎉`);
      setSendDialogOpen(false);
      setSendAmount("");
      setSelectedFriend(null);
      fetchFriends();
      fetchTransactions();
    } catch (error: any) {
      console.error("Error sending CAMLY:", error);
      toast.error("Couldn't send CAMLY 😢");
    }
  };

  const handleUnfriend = async () => {
    if (!selectedFriend || !user) return;

    try {
      // Get current friend counts
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("total_friends")
        .eq("id", user.id)
        .single();

      const { data: friendProfile } = await supabase
        .from("profiles")
        .select("total_friends")
        .eq("id", selectedFriend.id)
        .single();

      // Delete both directions of friendship
      const { error: error1 } = await supabase
        .from("friends")
        .delete()
        .eq("user_id", user.id)
        .eq("friend_id", selectedFriend.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from("friends")
        .delete()
        .eq("user_id", selectedFriend.id)
        .eq("friend_id", user.id);

      if (error2) throw error2;

      // Update friend counts
      if (userProfile) {
        await supabase
          .from("profiles")
          .update({ total_friends: Math.max(0, (userProfile.total_friends || 0) - 1) })
          .eq("id", user.id);
      }

      if (friendProfile) {
        await supabase
          .from("profiles")
          .update({ total_friends: Math.max(0, (friendProfile.total_friends || 0) - 1) })
          .eq("id", selectedFriend.id);
      }

      toast.success(`Unfriended ${selectedFriend.username}`);
      setUnfriendDialogOpen(false);
      setSelectedFriend(null);
      await fetchFriends();
    } catch (error: any) {
      console.error("Unfriend error:", error);
      toast.error("Failed to unfriend user. Please try again.");
    }
  };

  const handleBlock = async () => {
    if (!selectedFriend || !user) return;

    try {
      // Get current friend counts
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("total_friends")
        .eq("id", user.id)
        .single();

      const { data: friendProfile } = await supabase
        .from("profiles")
        .select("total_friends")
        .eq("id", selectedFriend.id)
        .single();

      // Add to blocked list
      const { error: blockError } = await supabase
        .from("blocked_users")
        .insert({
          user_id: user.id,
          blocked_user_id: selectedFriend.id,
        });

      if (blockError) throw blockError;

      // Remove friendship (both directions)
      await supabase
        .from("friends")
        .delete()
        .eq("user_id", user.id)
        .eq("friend_id", selectedFriend.id);

      await supabase
        .from("friends")
        .delete()
        .eq("user_id", selectedFriend.id)
        .eq("friend_id", user.id);

      // Update friend counts
      if (userProfile) {
        await supabase
          .from("profiles")
          .update({ total_friends: Math.max(0, (userProfile.total_friends || 0) - 1) })
          .eq("id", user.id);
      }

      if (friendProfile) {
        await supabase
          .from("profiles")
          .update({ total_friends: Math.max(0, (friendProfile.total_friends || 0) - 1) })
          .eq("id", selectedFriend.id);
      }

      toast.success(`Blocked ${selectedFriend.username}`);
      setBlockDialogOpen(false);
      setSelectedFriend(null);
      await fetchFriends();
    } catch (error: any) {
      console.error("Block error:", error);
      toast.error("Failed to block user. Please try again.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Users className="w-16 h-16 text-primary animate-bounce" />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background-green"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back to Home Button */}
          <div className="mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="font-bold group"
            >
              <Home className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
              <span>Về Trang Chính</span>
            </Button>
          </div>

          <motion.div 
            className="text-center mb-12 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-fredoka font-bold text-primary">
              My Friends 👥
            </h1>
            <p className="text-xl text-muted-foreground font-comic max-w-2xl mx-auto">
              Find friends to play with! 🎮
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Friend */}
            <div className="lg:col-span-1">
              <Card className="border-4 border-primary/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-primary" />
                    Add Friend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="friend@email.com"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="font-comic border-2 border-primary/30"
                    />
                    <Button
                      onClick={sendFriendRequest}
                      className="w-full font-fredoka font-bold bg-gradient-to-r from-primary to-secondary"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Send Request
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Friend Requests */}
              {requests.length > 0 && (
                <Card className="mt-6 border-4 border-accent/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="font-fredoka text-xl">
                      Friend Requests ({requests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {requests.map((request) => (
                      <div key={request.id} className="p-4 bg-muted/30 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-accent to-secondary text-white font-bold">
                              {request.sender.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-fredoka font-bold">{request.sender.username}</p>
                            <p className="text-sm text-muted-foreground font-comic">{request.sender.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptRequest(request.id, request.sender_id)}
                            className="flex-1 bg-accent hover:bg-accent/90 font-fredoka font-bold"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectRequest(request.id)}
                            className="flex-1 font-fredoka font-bold"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Friends List */}
            <div className="lg:col-span-2">
              <Card className="border-4 border-primary/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="font-fredoka text-2xl">
                    All Friends ({friends.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {friends.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-fredoka text-muted-foreground">No friends yet! 😢</p>
                      <p className="text-sm font-comic text-muted-foreground mt-2">Add friends to play together!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {friends.map((friend, index) => (
                        <motion.div
                          key={friend.id}
                          className="p-5 border-2 border-primary/20 rounded-2xl hover:border-primary transition-all hover:shadow-lg bg-gradient-to-br from-white to-primary-light/10"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-16 h-16 border-4 border-primary/20">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-2xl">
                                {friend.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-fredoka font-bold text-xl text-foreground">{friend.username}</p>
                              <p className="text-sm text-muted-foreground font-comic truncate">{friend.email}</p>
                            </div>
                          </div>
                          
                          {/* Friend Stats */}
                          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-white/50 rounded-xl">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Coins className="w-4 h-4 text-primary" />
                                <p className="font-bold text-2xl text-foreground">{friend.wallet_balance.toLocaleString()}</p>
                              </div>
                              <p className="text-xs text-muted-foreground font-comic">CAMLY</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-2xl text-foreground">{friend.total_plays}</p>
                              <p className="text-xs text-muted-foreground font-comic">Games Played</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewProfile(friend)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate("/chat")}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openSendDialog(friend)}
                            >
                              CAMLY
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFriend(friend);
                                    setUnfriendDialogOpen(true);
                                  }}
                                  className="text-orange-600 cursor-pointer"
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Unfriend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFriend(friend);
                                    setBlockDialogOpen(true);
                                  }}
                                  className="text-red-600 cursor-pointer"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Block
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Transaction History */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-4 border-primary/30 shadow-xl">
              <CardHeader>
                <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                  <History className="w-6 h-6 text-primary" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-fredoka text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => {
                      const isSent = tx.from_user_id === user?.id;
                      const otherUser = friends.find((friend) =>
                        isSent ? friend.id === tx.to_user_id : friend.id === tx.from_user_id
                      );
                      return (
                        <motion.div
                          key={tx.id}
                          className={`p-4 rounded-xl border-2 ${
                            isSent 
                              ? 'bg-red-50 border-red-200' 
                              : 'bg-green-50 border-green-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-fredoka font-bold text-foreground">
                                {isSent ? '📤 Sent to' : '📥 Received from'} {otherUser?.username}
                              </p>
                              <p className="text-xs text-muted-foreground font-comic">
                                {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString()}
                              </p>
                              {tx.notes && (
                                <p className="text-xs text-muted-foreground font-comic mt-1">{tx.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-2xl ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                                {isSent ? '-' : '+'}{tx.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground font-comic">CAMLY</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Send CAMLY Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-2xl flex items-center gap-2">
              <Coins className="w-6 h-6 text-primary" />
              Send CAMLY
            </DialogTitle>
            <DialogDescription className="font-comic">
              Send CAMLY to {selectedFriend?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-fredoka font-bold">
                Amount (CAMLY)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount..."
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="font-comic text-lg border-2 border-primary/30"
              />
              <p className="text-xs text-muted-foreground font-comic">
                Transfers over 500,000 CAMLY require parent approval
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSendCAMLY}
              className="w-full font-fredoka font-bold bg-gradient-to-r from-primary to-secondary"
            >
              <Send className="mr-2 h-4 w-4" />
              Send CAMLY
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parent Approval Dialog */}
      <Dialog open={parentApprovalOpen} onOpenChange={setParentApprovalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-2xl flex items-center gap-2">
              👨‍👩‍👧 Parent Approval Required
            </DialogTitle>
            <DialogDescription className="font-comic">
              This transfer is over 500,000 CAMLY and requires parent approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-primary/10 rounded-xl space-y-2">
              <p className="font-fredoka font-bold text-lg text-foreground">Transfer Details:</p>
              <p className="font-comic text-foreground">To: {pendingTransfer?.friend.username}</p>
              <p className="font-comic text-2xl font-bold text-primary">
                {pendingTransfer?.amount.toLocaleString()} CAMLY
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-password" className="font-fredoka font-bold">
                Parent Password
              </Label>
              <Input
                id="parent-password"
                type="password"
                placeholder="Enter parent password..."
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
                className="font-comic border-2 border-primary/30"
              />
              <p className="text-xs text-muted-foreground font-comic">
                Demo password: "parent2026"
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setParentApprovalOpen(false);
                setParentPassword("");
                setPendingTransfer(null);
              }}
              className="font-fredoka font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleParentApproval}
              className="font-fredoka font-bold bg-gradient-to-r from-primary to-secondary"
            >
              Approve Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile View Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-3xl flex items-center gap-2">
              <Trophy className="w-8 h-8 text-primary" />
              Friend Profile
            </DialogTitle>
          </DialogHeader>
          {viewingFriend && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24 border-4 border-primary">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-4xl">
                    {viewingFriend.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-fredoka font-bold text-3xl text-foreground">{viewingFriend.username}</h3>
                  <p className="text-sm text-muted-foreground font-comic">{viewingFriend.email}</p>
                </div>
              </div>

              <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stats" className="font-fredoka font-bold">Stats</TabsTrigger>
                  <TabsTrigger value="wallet" className="font-fredoka font-bold">Wallet</TabsTrigger>
                </TabsList>
                <TabsContent value="stats" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-center">
                      <p className="text-4xl font-bold text-primary">{viewingFriend.total_plays}</p>
                      <p className="text-sm font-comic text-muted-foreground mt-2">Games Played</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl text-center">
                      <p className="text-4xl font-bold text-accent">{friends.length}</p>
                      <p className="text-sm font-comic text-muted-foreground mt-2">Total Friends</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="wallet" className="space-y-4 mt-4">
                  <div className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Coins className="w-8 h-8 text-secondary" />
                      <p className="text-5xl font-bold text-secondary">{viewingFriend.wallet_balance.toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-comic text-muted-foreground">CAMLY Balance</p>
                  </div>
                  {viewingFriend.wallet_address && (
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <p className="text-xs font-comic text-muted-foreground mb-1">Wallet Address:</p>
                      <p className="text-xs font-mono text-foreground break-all">{viewingFriend.wallet_address}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/chat")}
                  className="flex-1 font-fredoka font-bold"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </Button>
                <Button
                  onClick={() => {
                    setProfileDialogOpen(false);
                    openSendDialog(viewingFriend);
                  }}
                  className="flex-1 font-fredoka font-bold bg-gradient-to-r from-primary to-secondary"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send CAMLY
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Unfriend Confirmation Dialog */}
      <AlertDialog open={unfriendDialogOpen} onOpenChange={setUnfriendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-fredoka text-2xl">Unfriend {selectedFriend?.username}?</AlertDialogTitle>
            <AlertDialogDescription className="font-comic">
              Are you sure you want to remove {selectedFriend?.username} from your friends list? 
              You can always send them a friend request again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-fredoka font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnfriend} 
              className="font-fredoka font-bold bg-orange-600 hover:bg-orange-700"
            >
              Unfriend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-fredoka text-2xl">Block {selectedFriend?.username}?</AlertDialogTitle>
            <AlertDialogDescription className="font-comic">
              Are you sure you want to block {selectedFriend?.username}? They will be removed from your 
              friends list and won't be able to send you friend requests or messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-fredoka font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlock} 
              className="font-fredoka font-bold bg-red-600 hover:bg-red-700"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <JoyBot position="bottom-left" />
    </motion.div>
  );
}
