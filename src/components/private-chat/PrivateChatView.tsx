import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrivateChat, PrivateMessage } from '@/hooks/usePrivateMessages';
import { 
  ArrowLeft, Send, Image, Smile, Heart, Check, CheckCheck, 
  MoreVertical, Phone, Video 
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCall } from './CallProvider';

interface PrivateChatViewProps {
  currentUserId: string;
  otherUser: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  onBack?: () => void;
  isFullscreen?: boolean;
  onMinimize?: () => void;
}

const STICKERS = ['❤️', '😍', '🔥', '👍', '😂', '🥰', '💕', '✨', '🌟', '💫', '🎉', '🎊'];

export const PrivateChatView: React.FC<PrivateChatViewProps> = ({
  currentUserId,
  otherUser,
  onBack,
  isFullscreen = true,
  onMinimize
}) => {
  const { messages, loading, sending, sendMessage } = usePrivateChat(currentUserId, otherUser.id);
  const { startCall } = useCall();
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAudioCall = () => {
    startCall(otherUser, 'audio');
  };

  const handleVideoCall = () => {
    startCall(otherUser, 'video');
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && !uploading) return;
    
    const success = await sendMessage(newMessage.trim());
    if (success) {
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: "Vui lòng chọn ảnh nhỏ hơn 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${currentUserId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      await sendMessage('📷 Ảnh', 'image', urlData.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi tải ảnh",
        description: "Không thể tải ảnh lên",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSendSticker = async (sticker: string) => {
    await sendMessage(sticker, 'sticker');
    setShowStickers(false);
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const groupMessagesByDate = (msgs: PrivateMessage[]) => {
    const groups: { date: string; messages: PrivateMessage[] }[] = [];
    let currentDate = '';
    
    msgs.forEach(msg => {
      const msgDate = format(new Date(msg.created_at), 'yyyy-MM-dd');
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={cn(
      "flex flex-col bg-background",
      isFullscreen ? "h-screen" : "h-[500px] rounded-lg shadow-2xl border border-border"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10 ring-2 ring-pink-400/50">
          <AvatarImage src={otherUser.avatar_url || ''} />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
            {otherUser.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{otherUser.username}</h3>
          <p className="text-xs text-muted-foreground">Đang hoạt động</p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-pink-500 hover:bg-pink-500/10"
            onClick={handleAudioCall}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-purple-500 hover:bg-purple-500/10"
            onClick={handleVideoCall}
          >
            <Video className="h-5 w-5" />
          </Button>
          {onMinimize && (
            <Button variant="ghost" size="icon" onClick={onMinimize}>
              <MoreVertical className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'justify-end' : ''}`}>
                {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <Avatar className="h-20 w-20 mb-4 ring-4 ring-pink-400/30">
              <AvatarImage src={otherUser.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-2xl">
                {otherUser.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{otherUser.username}</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Bắt đầu cuộc trò chuyện mới!
            </p>
            <div className="flex gap-2 mt-4">
              {['👋', '❤️', '😊'].map(emoji => (
                <Button 
                  key={emoji}
                  variant="outline"
                  size="lg"
                  className="text-2xl"
                  onClick={() => sendMessage(emoji, 'sticker')}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messageGroups.map((group, groupIndex) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {format(new Date(group.date), 'dd MMMM, yyyy', { locale: vi })}
                  </span>
                </div>
                
                {/* Messages for this date */}
                <AnimatePresence>
                  {group.messages.map((msg, index) => {
                    const isOwn = msg.sender_id === currentUserId;
                    const showAvatar = index === 0 || 
                      group.messages[index - 1]?.sender_id !== msg.sender_id;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex gap-2 mb-1",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        {/* Avatar (left side) */}
                        {!isOwn && (
                          <div className="w-8 shrink-0">
                            {showAvatar && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={otherUser.avatar_url || ''} />
                                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                                  {otherUser.username[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        
                        {/* Message bubble */}
                        <div className={cn(
                          "max-w-[75%] group relative",
                          isOwn ? "items-end" : "items-start"
                        )}>
                          {msg.message_type === 'sticker' ? (
                            <span className="text-4xl">{msg.message}</span>
                          ) : msg.message_type === 'image' ? (
                            <div className="rounded-2xl overflow-hidden shadow-md">
                              <img 
                                src={msg.attachment_url} 
                                alt="Ảnh" 
                                className="max-w-[250px] max-h-[300px] object-cover"
                              />
                            </div>
                          ) : (
                            <div className={cn(
                              "px-4 py-2 rounded-2xl shadow-sm",
                              isOwn 
                                ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-white rounded-br-md" 
                                : "bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 text-foreground rounded-bl-md"
                            )}>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                            </div>
                          )}
                          
                          {/* Time & read status */}
                          <div className={cn(
                            "flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground",
                            isOwn ? "justify-end" : "justify-start"
                          )}>
                            <span>
                              {format(new Date(msg.created_at), 'HH:mm')}
                            </span>
                            {isOwn && (
                              msg.is_read 
                                ? <CheckCheck className="h-3 w-3 text-cyan-500" />
                                : <Check className="h-3 w-3" />
                            )}
                          </div>
                          
                          {/* React button (on hover) */}
                          <button className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                            isOwn ? "-left-8" : "-right-8"
                          )}>
                            <Heart className="h-4 w-4 text-pink-400 hover:fill-pink-400" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Sticker picker */}
      <AnimatePresence>
        {showStickers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border bg-muted/50 overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-3 justify-center">
              {STICKERS.map(sticker => (
                <button
                  key={sticker}
                  onClick={() => handleSendSticker(sticker)}
                  className="text-3xl hover:scale-125 transition-transform p-1"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="p-3 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* Image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-pink-500"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Image className="h-5 w-5" />
          </Button>
          
          {/* Sticker button */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-purple-500"
            onClick={() => setShowStickers(!showStickers)}
          >
            <span className="text-lg">🎨</span>
          </Button>
          
          {/* Message input */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="pr-10 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-pink-400"
            />
            
            {/* Emoji picker */}
            <Popover open={showEmoji} onOpenChange={setShowEmoji}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-0" align="end">
                <Picker 
                  data={data} 
                  onEmojiSelect={handleEmojiSelect}
                  theme="auto"
                  locale="vi"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
