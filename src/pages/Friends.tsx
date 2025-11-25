import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Search, MessageCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Friend {
  id: string;
  username: string;
  email: string;
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

export default function Friends() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id, profiles!friends_friend_id_fkey(id, username, email)")
        .eq("user_id", user?.id);

      if (error) throw error;

      const friendsList = data?.map((f: any) => ({
        id: f.profiles.id,
        username: f.profiles.username,
        email: f.profiles.email,
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Users className="w-16 h-16 text-primary animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-fredoka font-bold text-primary">
              My Friends 👥
            </h1>
            <p className="text-xl text-muted-foreground font-comic max-w-2xl mx-auto">
              Find friends to play with! 🎮
            </p>
          </div>

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
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="p-4 border-2 border-primary/20 rounded-2xl hover:border-primary transition-all hover:shadow-lg"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-xl">
                                {friend.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-fredoka font-bold text-lg">{friend.username}</p>
                              <p className="text-sm text-muted-foreground font-comic truncate">{friend.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full font-fredoka font-bold border-2 hover:bg-primary/10"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
