import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, ArrowLeft, Smile, Users, Circle, Coins, Bell, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { ChatTransferModal } from "@/components/ChatTransferModal";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { EmojiPicker, AddReactionButton, MessageReactions } from "@/components/EmojiPicker";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ReadReceipt } from "@/components/ReadReceipt";
import { useReadReceipts, useReadReceiptSubscription } from "@/hooks/useReadReceipts";
import { CreateGroupChatModal } from "@/components/CreateGroupChatModal";
import { MessageSearchModal } from "@/components/MessageSearchModal";
import { MessageActionsMenu, MessageEditInput } from "@/components/MessageActions";
import { useMessageActions } from "@/hooks/useMessageActions";
import { ChatFileUpload, ChatAttachment } from "@/components/ChatFileUpload";
import { ForwardMessageModal } from "@/components/ForwardMessageModal";
import { ReplyPreview, QuotedMessage } from "@/components/ReplyPreview";
import { PinnedMessagesBar } from "@/components/PinnedMessages";

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  isOnline?: boolean;
}

interface MessageReaction {
  emoji: string;
  userId: string;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  reply_to_message_id?: string | null;
  is_pinned?: boolean;
  pinned_at?: string | null;
  pinned_by?: string | null;
  reply_to_message?: {
    id: string;
    message: string;
    sender?: {
      username: string;
    };
  } | null;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
  reactions?: MessageReaction[];
}

interface GroupMember {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Conversation {
  friendId?: string;
  friend?: Friend;
  isGroup: boolean;
  groupName?: string;
  groupMembers?: GroupMember[];
  lastMessage?: Message;
  unreadCount: number;
  roomId: string;
}

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFriendId = searchParams.get("with");
  const { isOnline } = useOnlinePresence();
  const { permission, requestPermission, notifyNewMessage } = usePushNotifications();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageReactions, setMessageReactions] = useState<Record<string, MessageReaction[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Message edit/delete actions
  const {
    editingMessageId,
    editContent,
    setEditContent,
    startEditing,
    cancelEditing,
    saveEdit,
    deleteMessage,
  } = useMessageActions(user?.id);

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(
    selectedConversation?.roomId || null
  );

  // Read receipts
  const { markMessagesAsRead } = useReadReceipts(
    selectedConversation?.roomId || null,
    user?.id || null
  );

  // Subscribe to read receipt updates
  const handleReadUpdate = useCallback((messageIds: string[]) => {
    setMessages(prev => 
      prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
      )
    );
  }, []);

  useReadReceiptSubscription(selectedConversation?.roomId || null, handleReadUpdate);

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
      // Mark messages as read when selecting a conversation
      markMessagesAsRead();
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
      // Get all rooms the user is a member of
      const { data: memberships, error: membershipsError } = await supabase
        .from("chat_room_members")
        .select("room_id")
        .eq("user_id", user?.id);

      if (membershipsError) throw membershipsError;

      const roomIds = memberships?.map(m => m.room_id) || [];
      
      if (roomIds.length === 0) {
        // Fallback: Get all friends and create/get rooms for them
        await fetchPrivateConversations();
        return;
      }

      // Get room details
      const { data: rooms, error: roomsError } = await supabase
        .from("chat_rooms")
        .select("*")
        .in("id", roomIds);

      if (roomsError) throw roomsError;

      const convs: Conversation[] = [];

      for (const room of rooms || []) {
        const isGroupRoom = room.room_type === "group";
        if (isGroupRoom) {
          // Group chat
          const { data: members } = await supabase
            .from("chat_room_members")
            .select("user_id, profiles!chat_room_members_user_id_fkey(id, username, avatar_url)")
            .eq("room_id", room.id);

          const groupMembers = members?.map((m: any) => ({
            id: m.profiles.id,
            username: m.profiles.username,
            avatar_url: m.profiles.avatar_url,
          })).filter(m => m.id !== user?.id) || [];

          const { data: lastMsg } = await supabase
            .from("chat_messages")
            .select("*, profiles!chat_messages_sender_id_fkey(username, avatar_url)")
            .eq("room_id", room.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          convs.push({
            isGroup: true,
            groupName: room.name || "Group Chat",
            groupMembers,
            lastMessage: lastMsg ? {
              ...lastMsg,
              sender: lastMsg.profiles
            } : undefined,
            unreadCount: 0,
            roomId: room.id,
          });
        } else {
          // Private chat - extract friend from room name
          const [id1, id2] = room.name?.split("_") || [];
          const friendId = id1 === user?.id ? id2 : id1;

          if (friendId) {
            const { data: friendProfile } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", friendId)
              .single();

            if (friendProfile) {
              const { data: lastMsg } = await supabase
                .from("chat_messages")
                .select("*, profiles!chat_messages_sender_id_fkey(username, avatar_url)")
                .eq("room_id", room.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

              convs.push({
                friendId: friendProfile.id,
                friend: {
                  id: friendProfile.id,
                  username: friendProfile.username,
                  avatar_url: friendProfile.avatar_url,
                },
                isGroup: false,
                lastMessage: lastMsg ? {
                  ...lastMsg,
                  sender: lastMsg.profiles
                } : undefined,
                unreadCount: 0,
                roomId: room.id,
              });
            }
          }
        }
      }

      // Also fetch private conversations for friends without rooms
      await fetchPrivateConversations(convs);

    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
    }
  };

  const fetchPrivateConversations = async (existingConvs: Conversation[] = []) => {
    try {
      const { data: friends, error: friendsError } = await supabase
        .from("friends")
        .select("friend_id, profiles!friends_friend_id_fkey(id, username, avatar_url)")
        .eq("user_id", user?.id);

      if (friendsError) throw friendsError;

      const convs = [...existingConvs];
      const existingFriendIds = convs.filter(c => !c.isGroup).map(c => c.friendId);

      for (const friend of friends || []) {
        const friendProfile = friend.profiles as any;
        
        if (existingFriendIds.includes(friendProfile.id)) continue;

        // Check for existing private room
        const { data: existingRoom } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("room_type", "private")
          .or(`name.eq.${user?.id}_${friendProfile.id},name.eq.${friendProfile.id}_${user?.id}`)
          .single();

        let roomId = existingRoom?.id;

        if (!roomId) {
          const { data: newRoom, error: roomError } = await supabase
            .from("chat_rooms")
            .insert({
              room_type: "private",
              name: `${user?.id}_${friendProfile.id}`,
              created_by: user?.id,
              is_group: false,
            })
            .select("id")
            .single();

          if (roomError) continue;
          roomId = newRoom.id;

          await supabase.from("chat_room_members").insert([
            { room_id: roomId, user_id: user?.id },
            { room_id: roomId, user_id: friendProfile.id }
          ]);
        }

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
          isGroup: false,
          lastMessage: lastMsg || undefined,
          unreadCount: 0,
          roomId
        });
      }

      convs.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
      });

      setConversations(convs);
    } catch (error) {
      console.error("Error fetching private conversations:", error);
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
          is_read,
          attachment_url,
          attachment_type,
          attachment_name,
          reply_to_message_id,
          is_pinned,
          pinned_at,
          pinned_by,
          profiles!chat_messages_sender_id_fkey(username, avatar_url)
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Fetch reply messages
      const replyIds = data?.filter(m => m.reply_to_message_id).map(m => m.reply_to_message_id) || [];
      let replyMessagesMap: Record<string, any> = {};
      
      if (replyIds.length > 0) {
        const { data: replyMessages } = await supabase
          .from("chat_messages")
          .select(`
            id,
            message,
            profiles!chat_messages_sender_id_fkey(username)
          `)
          .in("id", replyIds);
        
        replyMessages?.forEach((rm: any) => {
          replyMessagesMap[rm.id] = {
            id: rm.id,
            message: rm.message,
            sender: rm.profiles
          };
        });
      }

      const formattedMessages = data?.map((m: any) => ({
        id: m.id,
        sender_id: m.sender_id,
        message: m.message,
        created_at: m.created_at,
        is_read: m.is_read || false,
        attachment_url: m.attachment_url,
        attachment_type: m.attachment_type,
        attachment_name: m.attachment_name,
        reply_to_message_id: m.reply_to_message_id,
        is_pinned: m.is_pinned || false,
        pinned_at: m.pinned_at,
        pinned_by: m.pinned_by,
        reply_to_message: m.reply_to_message_id ? replyMessagesMap[m.reply_to_message_id] : null,
        sender: m.profiles
      })) || [];

      setMessages(formattedMessages);
      
      // Mark messages as read after fetching
      markMessagesAsRead();
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
            is_read: payload.new.is_read || false,
            attachment_url: payload.new.attachment_url,
            attachment_type: payload.new.attachment_type,
            attachment_name: payload.new.attachment_name,
            sender: sender || undefined
          };

          setMessages(prev => [...prev, newMsg]);

          // Mark as read if not from current user
          if (payload.new.sender_id !== user?.id) {
            const audio = new Audio("/audio/coin-reward.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => {});
            
            notifyNewMessage(
              sender?.username || "Someone",
              payload.new.message
            );
            
            // Mark message as read
            markMessagesAsRead();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          // Update message content and read status in real-time
          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id 
                ? { ...msg, message: payload.new.message, is_read: payload.new.is_read } 
                : msg
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          // Remove deleted message in real-time
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    if (!user) return;
    
    setMessageReactions(prev => {
      const msgReactions = prev[messageId] || [];
      const existingIndex = msgReactions.findIndex(
        r => r.userId === user.id && r.emoji === emoji
      );
      
      if (existingIndex >= 0) {
        return {
          ...prev,
          [messageId]: msgReactions.filter((_, i) => i !== existingIndex)
        };
      } else {
        return {
          ...prev,
          [messageId]: [...msgReactions, { emoji, userId: user.id }]
        };
      }
    });
  }, [user]);

  const getMessageReactions = useCallback((messageId: string) => {
    const reactions = messageReactions[messageId] || [];
    const grouped: Record<string, { count: number; hasReacted: boolean }> = {};
    
    reactions.forEach(r => {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { count: 0, hasReacted: false };
      }
      grouped[r.emoji].count++;
      if (r.userId === user?.id) {
        grouped[r.emoji].hasReacted = true;
      }
    });
    
    return Object.entries(grouped).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      hasReacted: data.hasReacted
    }));
  }, [messageReactions, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    startTyping();
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const sendMessage = async (attachment?: { url: string; type: string; name: string }) => {
    if (!newMessage.trim() && !attachment) return;
    if (!selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: selectedConversation.roomId,
          sender_id: user?.id,
          message: newMessage.trim() || (attachment ? `📎 ${attachment.name}` : ""),
          is_read: false,
          attachment_url: attachment?.url || null,
          attachment_type: attachment?.type || null,
          attachment_name: attachment?.name || null,
          reply_to_message_id: replyingTo?.id || null,
        });

      if (error) throw error;

      setNewMessage("");
      setReplyingTo(null);

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

  const handleFileUploaded = (fileData: { url: string; type: string; name: string }) => {
    sendMessage(fileData);
  };

  const handleGroupCreated = (roomId: string) => {
    fetchConversations();
  };

  const handleSearchResult = (roomId: string) => {
    const conv = conversations.find(c => c.roomId === roomId);
    if (conv) {
      setSelectedConversation(conv);
    }
  };

  const handleEditMessage = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      startEditing(messageId, msg.message);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const success = await deleteMessage(messageId);
    if (success) {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    }
  };

  const handleForwardMessage = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      setMessageToForward(msg);
      setShowForwardModal(true);
    }
  };

  const handleReplyMessage = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      setReplyingTo(msg);
    }
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-primary/20");
      setTimeout(() => element.classList.remove("bg-primary/20"), 2000);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    const isPinned = msg.is_pinned;
    
    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({
          is_pinned: !isPinned,
          pinned_at: isPinned ? null : new Date().toISOString(),
          pinned_by: isPinned ? null : user?.id,
        })
        .eq("id", messageId);

      if (error) throw error;

      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, is_pinned: !isPinned, pinned_at: isPinned ? null : new Date().toISOString(), pinned_by: isPinned ? null : user?.id }
            : m
        )
      );

      toast.success(isPinned ? "Message unpinned" : "Message pinned");
    } catch (error) {
      console.error("Error pinning message:", error);
      toast.error("Couldn't pin message");
    }
  };

  const getPinnedMessages = () => {
    return messages
      .filter(m => m.is_pinned)
      .sort((a, b) => new Date(b.pinned_at || 0).getTime() - new Date(a.pinned_at || 0).getTime())
      .map(m => ({
        id: m.id,
        message: m.message,
        senderName: m.sender?.username,
        pinnedAt: m.pinned_at || undefined,
      }));
  };

  const getForwardConversations = () => {
    return conversations.map(conv => ({
      roomId: conv.roomId,
      name: conv.isGroup ? (conv.groupName || "Group Chat") : (conv.friend?.username || "Unknown"),
      avatarUrl: conv.isGroup ? null : conv.friend?.avatar_url,
      isGroup: conv.isGroup,
    }));
  };

  const getConversationDisplayName = (conv: Conversation) => {
    if (conv.isGroup) {
      return conv.groupName || "Group Chat";
    }
    return conv.friend?.username || "Unknown";
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.isGroup) {
      return null; // Will use group icon
    }
    return conv.friend?.avatar_url;
  };

  const getOnlineMembers = (conv: Conversation) => {
    if (!conv.isGroup || !conv.groupMembers) return 0;
    return conv.groupMembers.filter(m => isOnline(m.id)).length;
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowSearchModal(true)}
                variant="outline"
                size="icon"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowCreateGroupModal(true)}
                className="gap-2 bg-gradient-to-r from-primary to-secondary"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Group</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="border-2 border-primary/20 overflow-hidden">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-lg font-fredoka flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Chats
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-60px)]">
                {conversations.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {conversations.map((conv) => (
                      <button
                        key={conv.roomId}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                          selectedConversation?.roomId === conv.roomId
                            ? "bg-primary/10 border-2 border-primary/30"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="relative">
                          {conv.isGroup ? (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                          ) : (
                            <Avatar className="w-12 h-12 border-2 border-primary/20">
                              <AvatarImage src={getConversationAvatar(conv) || undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                {getConversationDisplayName(conv)[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!conv.isGroup && conv.friend && (
                            <Circle 
                              className={`absolute bottom-0 right-0 w-3 h-3 ${
                                isOnline(conv.friend.id) 
                                  ? "text-green-500 fill-green-500" 
                                  : "text-gray-400 fill-gray-400"
                              }`} 
                            />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-fredoka font-bold truncate">
                            {getConversationDisplayName(conv)}
                          </p>
                          {conv.isGroup && conv.groupMembers && (
                            <p className="text-xs text-muted-foreground">
                              {conv.groupMembers.length + 1} members • {getOnlineMembers(conv)} online
                            </p>
                          )}
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.isGroup && conv.lastMessage.sender?.username && (
                                <span className="font-medium">{conv.lastMessage.sender.username}: </span>
                              )}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {selectedConversation.isGroup ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <Avatar className="w-10 h-10 border-2 border-primary/20">
                              <AvatarImage src={getConversationAvatar(selectedConversation) || undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                {getConversationDisplayName(selectedConversation)[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!selectedConversation.isGroup && selectedConversation.friend && (
                            <Circle 
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${
                                isOnline(selectedConversation.friend.id) 
                                  ? "text-green-500 fill-green-500" 
                                  : "text-gray-400 fill-gray-400"
                              }`} 
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-fredoka font-bold">{getConversationDisplayName(selectedConversation)}</p>
                          {selectedConversation.isGroup ? (
                            <p className="text-xs text-muted-foreground">
                              {getOnlineMembers(selectedConversation)} of {(selectedConversation.groupMembers?.length || 0) + 1} online
                            </p>
                          ) : (
                            <p className={`text-xs ${isOnline(selectedConversation.friend?.id || "") ? "text-green-500" : "text-muted-foreground"}`}>
                              {isOnline(selectedConversation.friend?.id || "") ? "Online" : "Offline"}
                            </p>
                          )}
                        </div>
                      </div>
                      {!selectedConversation.isGroup && selectedConversation.friend && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTransferModal(true)}
                          className="gap-2 border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"
                        >
                          <Coins className="w-4 h-4" />
                          Send CAMLY
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  {/* Pinned Messages */}
                  <PinnedMessagesBar
                    messages={getPinnedMessages()}
                    onUnpin={handlePinMessage}
                    onScrollTo={scrollToMessage}
                    canUnpin={true}
                  />

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <AnimatePresence>
                        {messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            id={`message-${msg.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group flex transition-colors duration-500 ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            {/* Show avatar for group messages from others */}
                            {selectedConversation.isGroup && msg.sender_id !== user?.id && (
                              <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
                                <AvatarImage src={msg.sender?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                                  {msg.sender?.username?.[0]?.toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[70%] ${msg.sender_id === user?.id ? "order-2" : "order-1"}`}>
                              {/* Show sender name in groups */}
                              {selectedConversation.isGroup && msg.sender_id !== user?.id && (
                                <p className="text-xs text-muted-foreground mb-1 ml-1">
                                  {msg.sender?.username}
                                </p>
                              )}
                              <div className="relative flex items-center gap-1">
                                {/* Message actions menu */}
                                {editingMessageId !== msg.id && (
                                  <div className={msg.sender_id === user?.id ? "order-first" : "order-last"}>
                                    <MessageActionsMenu
                                      messageId={msg.id}
                                      isOwn={msg.sender_id === user?.id}
                                      isPinned={msg.is_pinned}
                                      onEdit={handleEditMessage}
                                      onDelete={handleDeleteMessage}
                                      onForward={handleForwardMessage}
                                      onReply={handleReplyMessage}
                                      onPin={handlePinMessage}
                                    />
                                  </div>
                                )}
                                
                                {editingMessageId === msg.id ? (
                                  <MessageEditInput
                                    value={editContent}
                                    onChange={setEditContent}
                                    onSave={async () => {
                                      const success = await saveEdit();
                                      if (success) {
                                        setMessages(prev =>
                                          prev.map(m =>
                                            m.id === msg.id ? { ...m, message: editContent } : m
                                          )
                                        );
                                      }
                                    }}
                                    onCancel={cancelEditing}
                                  />
                                ) : (
                                  <div
                                    className={`px-4 py-2 rounded-2xl ${
                                      msg.sender_id === user?.id
                                        ? "bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm"
                                        : "bg-muted rounded-bl-sm"
                                    }`}
                                  >
                                    {/* Quoted message */}
                                    {msg.reply_to_message && (
                                      <QuotedMessage
                                        message={msg.reply_to_message.message}
                                        senderName={msg.reply_to_message.sender?.username}
                                        isOwn={msg.sender_id === user?.id}
                                        onClick={() => scrollToMessage(msg.reply_to_message!.id)}
                                      />
                                    )}
                                    {msg.attachment_url && msg.attachment_type && msg.attachment_name && (
                                      <div className="mb-2">
                                        <ChatAttachment
                                          url={msg.attachment_url}
                                          type={msg.attachment_type}
                                          name={msg.attachment_name}
                                          isOwn={msg.sender_id === user?.id}
                                        />
                                      </div>
                                    )}
                                    {msg.message && !msg.message.startsWith("📎") && (
                                      <p className="text-sm">{msg.message}</p>
                                    )}
                                  </div>
                                )}
                                <div className={`absolute top-1/2 -translate-y-1/2 ${
                                  msg.sender_id === user?.id ? "-left-16" : "-right-8"
                                }`}>
                                  <AddReactionButton onReact={(emoji) => handleReaction(msg.id, emoji)} />
                                </div>
                              </div>
                              <MessageReactions
                                reactions={getMessageReactions(msg.id)}
                                onReact={(emoji) => handleReaction(msg.id, emoji)}
                              />
                              <div className={`flex items-center gap-1 mt-1 ${
                                msg.sender_id === user?.id ? "justify-end" : "justify-start"
                              }`}>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(msg.created_at), "HH:mm")}
                                </p>
                                {msg.sender_id === user?.id && (
                                  <ReadReceipt isRead={msg.is_read} isSent={true} />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      <TypingIndicator typingUsers={typingUsers} />
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t flex-shrink-0">
                    {permission !== "granted" && (
                      <div className="mb-3 p-2 bg-primary/10 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Enable notifications for new messages
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={requestPermission}
                          className="h-7 text-xs gap-1"
                        >
                          <Bell className="w-3 h-3" />
                          Enable
                        </Button>
                      </div>
                    )}
                    
                    {/* Reply preview */}
                    {replyingTo && (
                      <div className="mb-3">
                        <ReplyPreview
                          message={{
                            id: replyingTo.id,
                            message: replyingTo.message,
                            senderName: replyingTo.sender?.username,
                          }}
                          onCancel={() => setReplyingTo(null)}
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2 relative">
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="flex-shrink-0"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="w-5 h-5" />
                        </Button>
                        <EmojiPicker
                          isOpen={showEmojiPicker}
                          onOpenChange={setShowEmojiPicker}
                          onEmojiSelect={handleEmojiSelect}
                        />
                      </div>
                      <ChatFileUpload
                        userId={user?.id || ""}
                        roomId={selectedConversation.roomId}
                        onFileUploaded={handleFileUploaded}
                        disabled={sending}
                      />
                      <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            stopTyping();
                            sendMessage();
                          }
                        }}
                        onBlur={stopTyping}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          stopTyping();
                          sendMessage();
                        }}
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
                    <p className="text-muted-foreground font-comic">Select a chat or create a group!</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Transfer Modal */}
      {selectedConversation && !selectedConversation.isGroup && selectedConversation.friend && (
        <ChatTransferModal
          open={showTransferModal}
          onOpenChange={setShowTransferModal}
          recipientId={selectedConversation.friend.id}
          recipientUsername={selectedConversation.friend.username}
          recipientAvatar={selectedConversation.friend.avatar_url}
          onTransferComplete={(amount) => {
            toast.success(`Sent ${amount.toLocaleString()} CAMLY to ${selectedConversation.friend?.username}! 🎉`);
          }}
        />
      )}

      {/* Create Group Modal */}
      {user && (
        <CreateGroupChatModal
          open={showCreateGroupModal}
          onOpenChange={setShowCreateGroupModal}
          userId={user.id}
          onGroupCreated={handleGroupCreated}
        />
      )}

      {/* Message Search Modal */}
      <MessageSearchModal
        open={showSearchModal}
        onOpenChange={setShowSearchModal}
        userId={user?.id}
        onSelectResult={handleSearchResult}
      />

      {/* Forward Message Modal */}
      {user && selectedConversation && (
        <ForwardMessageModal
          open={showForwardModal}
          onOpenChange={setShowForwardModal}
          message={messageToForward ? {
            text: messageToForward.message,
            attachmentUrl: messageToForward.attachment_url,
            attachmentType: messageToForward.attachment_type,
            attachmentName: messageToForward.attachment_name,
            senderName: messageToForward.sender?.username,
          } : null}
          conversations={getForwardConversations()}
          userId={user.id}
          currentRoomId={selectedConversation.roomId}
        />
      )}
    </div>
  );
}
