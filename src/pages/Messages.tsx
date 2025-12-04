import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, Home, ArrowLeft, Smile, Users, Circle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  isOnline?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  friendId: string;
  friend: Friend;
  lastMessage?: Message;
  unreadCount: number;
  roomId: string;
}

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFriendId = searchParams.get("with");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (initialFriendId && conversations.length > 0) {
      const conv = conversations.find(c => c.friendId === initialFriendId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [initialFriendId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.roomId);
      subscribeToMessages(selectedConversation.roomId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      // Get all friends
      const { data: friends, error: friendsError } = await supabase
        .from("friends")
        .select("friend_id, profiles!friends_friend_id_fkey(id, username, avatar_url)")
        .eq("user_id", user?.id);

      if (friendsError) throw friendsError;

      // Get or create chat rooms for each friend
      const convs: Conversation[] = [];
      
      for (const friend of friends || []) {
        const friendProfile = friend.profiles as any;
        
        // Check for existing private room
        const { data: existingRoom } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("room_type", "private")
          .or(`name.eq.${user?.id}_${friendProfile.id},name.eq.${friendProfile.id}_${user?.id}`)
          .single();

        let roomId = existingRoom?.id;

        if (!roomId) {
          // Create private room
          const { data: newRoom, error: roomError } = await supabase
            .from("chat_rooms")
            .insert({
              room_type: "private",
              name: `${user?.id}_${friendProfile.id}`,
              created_by: user?.id
            })
            .select("id")
            .single();

          if (roomError) continue;
          roomId = newRoom.id;

          // Add both users to room
          await supabase.from("chat_room_members").insert([
            { room_id: roomId, user_id: user?.id },
            { room_id: roomId, user_id: friendProfile.id }
          ]);
        }

        // Get last message
        const { data: lastMsg } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        convs.push({
          friendId: friendProfile.id,
          friend: {
            id: friendProfile.id,
            username: friendProfile.username,
            avatar_url: friendProfile.avatar_url
          },
          lastMessage: lastMsg || undefined,
          unreadCount: 0,
          roomId
        });
      }

      // Sort by last message time
      convs.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
      });

      setConversations(convs);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          id,
          sender_id,
          message,
          created_at,
          profiles!chat_messages_sender_id_fkey(username, avatar_url)
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMessages = data?.map((m: any) => ({
        id: m.id,
        sender_id: m.sender_id,
        message: m.message,
        created_at: m.created_at,
        sender: m.profiles
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const subscribeToMessages = (roomId: string) => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // Fetch sender info
          const { data: sender } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();

          const newMsg: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            message: payload.new.message,
            created_at: payload.new.created_at,
            sender: sender || undefined
          };

          setMessages(prev => [...prev, newMsg]);

          // Play notification sound if not from current user
          if (payload.new.sender_id !== user?.id) {
            const audio = new Audio("/audio/coin-reward.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: selectedConversation.roomId,
          sender_id: user?.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");

      // Update profile messages count
      await supabase
        .from("profiles")
        .update({ total_messages: (await supabase.from("profiles").select("total_messages").eq("id", user?.id).single()).data?.total_messages + 1 || 1 })
        .eq("id", user?.id);

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Couldn't send message");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <MessageCircle className="w-16 h-16 text-primary animate-bounce mx-auto" />
          <p className="text-2xl font-fredoka text-primary">Loading messages... ⏳</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navigation />
      
      <section className="pt-24 md:pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Messages 💬
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="border-2 border-primary/20 overflow-hidden">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-lg font-fredoka flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Friends
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-60px)]">
                {conversations.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {conversations.map((conv) => (
                      <button
                        key={conv.friendId}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                          selectedConversation?.friendId === conv.friendId
                            ? "bg-primary/10 border-2 border-primary/30"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12 border-2 border-primary/20">
                            <AvatarImage src={conv.friend.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                              {conv.friend.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-green-500" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-fredoka font-bold truncate">{conv.friend.username}</p>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage.message}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No friends yet</p>
                    <Button
                      onClick={() => navigate("/find-friends")}
                      variant="link"
                      className="mt-2"
                    >
                      Find Friends
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className="md:col-span-2 border-2 border-primary/20 flex flex-col overflow-hidden">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="py-3 border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={selectedConversation.friend.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {selectedConversation.friend.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-fredoka font-bold">{selectedConversation.friend.username}</p>
                        <p className="text-xs text-green-500">Online</p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <AnimatePresence>
                        {messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[70%] ${msg.sender_id === user?.id ? "order-2" : "order-1"}`}>
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  msg.sender_id === user?.id
                                    ? "bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm"
                                    : "bg-muted rounded-bl-sm"
                                }`}
                              >
                                <p className="text-sm">{msg.message}</p>
                              </div>
                              <p className={`text-xs text-muted-foreground mt-1 ${
                                msg.sender_id === user?.id ? "text-right" : "text-left"
                              }`}>
                                {format(new Date(msg.created_at), "HH:mm")}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t flex-shrink-0">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <Smile className="w-5 h-5" />
                      </Button>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="flex-shrink-0 bg-gradient-to-r from-primary to-secondary"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-comic">Select a friend to start chatting!</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
