import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, Users, Home, Smile, Image, Mic, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string | null;
  };
}

interface TypingUser {
  userId: string;
  username: string;
  timestamp: number;
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    if (roomId && user) {
      const cleanup = subscribeToMessages();
      const presenceCleanup = subscribeToPresence();
      return () => {
        cleanup?.();
        presenceCleanup?.();
      };
    }
  }, [roomId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up old typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(t => Date.now() - t.timestamp < 3000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data: roomData } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("room_type", "game_public")
        .eq("name", "Global Chat")
        .single();

      let currentRoomId = roomData?.id;

      if (!currentRoomId) {
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
        currentRoomId = newRoom.id;

        await supabase
          .from("chat_room_members")
          .insert({
            room_id: currentRoomId,
            user_id: user?.id,
          });
      } else {
        const { data: memberData } = await supabase
          .from("chat_room_members")
          .select("id")
          .eq("room_id", currentRoomId)
          .eq("user_id", user?.id)
          .single();

        if (!memberData) {
          await supabase
            .from("chat_room_members")
            .insert({
              room_id: currentRoomId,
              user_id: user?.id,
            });
        }
      }

      setRoomId(currentRoomId);

      const { data: messagesData, error: messagesError } = await supabase
        .from("chat_messages")
        .select("id, sender_id, message, created_at, profiles!chat_messages_sender_id_fkey(username, avatar_url)")
        .eq("room_id", currentRoomId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast.error("Không thể tải chat 😢");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!roomId) return;
    
    const channel = supabase
      .channel(`chat_messages_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          supabase
            .from("chat_messages")
            .select("id, sender_id, message, created_at, profiles!chat_messages_sender_id_fkey(username, avatar_url)")
            .eq("id", payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setMessages((current) => [...current, data]);
                // Remove from typing
                setTypingUsers(prev => prev.filter(t => t.userId !== data.sender_id));
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToPresence = () => {
    if (!roomId || !user) return;

    const channel = supabase.channel(`presence_${roomId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers(prev => prev + 1);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setOnlineUsers(prev => Math.max(0, prev - 1));
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setTypingUsers(prev => {
            const existing = prev.find(t => t.userId === payload.userId);
            if (existing) {
              return prev.map(t => t.userId === payload.userId ? { ...t, timestamp: Date.now() } : t);
            }
            return [...prev, { userId: payload.userId, username: payload.username, timestamp: Date.now() }];
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTyping = () => {
    if (!roomId || !user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    supabase.channel(`presence_${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, username: user.email?.split('@')[0] || 'User' },
    });

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
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
      toast.error("Không thể gửi tin nhắn 😢");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <MessageCircle className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  const typingText = typingUsers.length > 0
    ? typingUsers.length === 1
      ? `${typingUsers[0].username} đang nhập...`
      : `${typingUsers.length} người đang nhập...`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <section className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Về Trang Chủ
            </Button>
            
            <Badge variant="outline" className="gap-2 px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {onlineUsers} online
            </Badge>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Phòng Chat Cộng Đồng 💬
            </h1>
            <p className="text-muted-foreground mt-2">
              Kết nối và trò chuyện cùng mọi người! 🌟
            </p>
          </motion.div>

          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b py-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-fredoka">
                  <Users className="w-5 h-5 text-primary" />
                  Global Chat
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex flex-col h-[500px] md:h-[550px] p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index < 10 ? index * 0.02 : 0 }}
                      className={`flex gap-3 ${msg.sender_id === user?.id ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={msg.profiles.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold">
                          {msg.profiles.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col max-w-[75%] ${msg.sender_id === user?.id ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-muted-foreground mb-1 px-1">
                          {msg.sender_id === user?.id ? "Bạn" : msg.profiles.username}
                        </span>
                        <div
                          className={`px-4 py-2.5 rounded-2xl ${
                            msg.sender_id === user?.id
                              ? "bg-gradient-to-r from-primary to-secondary text-white rounded-tr-sm"
                              : "bg-muted rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              <AnimatePresence>
                {typingText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    {typingText}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <form onSubmit={sendMessage} className="border-t p-3 flex gap-2 items-center bg-background/50">
                <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                  <Smile className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Nhập tin nhắn... 💬"
                  className="flex-1 border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim()}
                  className="flex-shrink-0 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-center text-sm text-muted-foreground"
          >
            💡 Hãy tử tế và tôn trọng mọi người! Chúc vui vẻ! 🌟
          </motion.p>
        </div>
      </section>
    </div>
  );
}
