import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, Users } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      // For now, let's create a global game room
      // Later can extend to private rooms
      const { data: roomData } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("room_type", "game_public")
        .eq("name", "Global Chat")
        .single();

      let roomId = roomData?.id;

      // Create global room if doesn't exist
      if (!roomId) {
        const { data: newRoom, error: roomError } = await supabase
          .from("chat_rooms")
          .insert({
            name: "Global Chat",
            room_type: "game_public",
            created_by: user?.id,
          })
          .select()
          .single();

        if (roomError) throw roomError;
        roomId = newRoom.id;

        // Join room
        await supabase
          .from("chat_room_members")
          .insert({
            room_id: roomId,
            user_id: user?.id,
          });
      } else {
        // Check if user is member
        const { data: memberData } = await supabase
          .from("chat_room_members")
          .select("id")
          .eq("room_id", roomId)
          .eq("user_id", user?.id)
          .single();

        if (!memberData) {
          await supabase
            .from("chat_room_members")
            .insert({
              room_id: roomId,
              user_id: user?.id,
            });
        }
      }

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("chat_messages")
        .select("id, sender_id, message, created_at, profiles!chat_messages_sender_id_fkey(username)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      setMessages(messagesData || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast.error("Couldn't load chat 😢");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          // Fetch the complete message with user info
          supabase
            .from("chat_messages")
            .select("id, sender_id, message, created_at, profiles!chat_messages_sender_id_fkey(username)")
            .eq("id", payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setMessages((current) => [...current, data]);
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      // Get room ID
      const { data: roomData } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("room_type", "game_public")
        .eq("name", "Global Chat")
        .single();

      if (!roomData) {
        toast.error("Chat room not found!");
        return;
      }

      const { error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: roomData.id,
          sender_id: user?.id,
          message: newMessage.trim(),
        });

      if (error) throw error;

      // Update message count
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_messages")
        .eq("id", user?.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ total_messages: (profile.total_messages || 0) + 1 })
          .eq("id", user?.id);
      }

      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Couldn't send message 😢");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <MessageCircle className="w-16 h-16 text-primary animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-fredoka font-bold text-primary">
              Global Chat 💬
            </h1>
            <p className="text-xl text-muted-foreground font-comic max-w-2xl mx-auto">
              Chat with friends and other players! 🎮
            </p>
          </div>

          <Card className="border-4 border-primary/30 shadow-2xl h-[600px] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b-2 border-primary/20">
              <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Global Chat Room
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender_id === user?.id ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                        {msg.profiles.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${msg.sender_id === user?.id ? "items-end" : "items-start"}`}>
                      <p className="text-sm font-comic font-bold text-muted-foreground mb-1">
                        {msg.sender_id === user?.id ? "You" : msg.profiles.username}
                      </p>
                      <div
                        className={`px-4 py-3 rounded-2xl max-w-md ${
                          msg.sender_id === user?.id
                            ? "bg-gradient-to-r from-primary to-secondary text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p className="font-comic">{msg.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-comic">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message... 😊"
                  className="flex-1 font-comic text-lg border-2 border-primary/30 focus:border-primary"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="px-8 font-fredoka font-bold bg-gradient-to-r from-primary to-secondary"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm font-comic text-muted-foreground">
              💡 Be kind and respectful to everyone! Have fun chatting! 🌟
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
