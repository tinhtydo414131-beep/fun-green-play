import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePrivateMessages, Conversation } from '@/hooks/usePrivateMessages';
import { ConversationList } from '@/components/private-chat/ConversationList';
import { PrivateChatView } from '@/components/private-chat/PrivateChatView';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageCircle, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';

const PrivateMessages: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [directUser, setDirectUser] = useState<{ id: string; username: string; avatar_url: string | null } | null>(null);
  
  const { conversations, loading, totalUnread, refreshConversations } = usePrivateMessages(user?.id || null);

  // Handle direct user from URL
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && user) {
      // Fetch user profile
      const fetchUser = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', userId)
          .single();
        
        if (data) {
          setDirectUser(data);
        }
      };
      fetchUser();
    }
  }, [searchParams, user]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <MessageCircle className="h-12 w-12 text-pink-500 animate-bounce" />
          <span className="text-muted-foreground">Đang tải...</span>
        </div>
      </div>
    );
  }

  // If we have a direct user from URL, show the chat
  if (directUser) {
    return (
      <>
        <Helmet>
          <title>Nhắn tin với {directUser.username} | FUN Planet</title>
        </Helmet>
        <PrivateChatView
          currentUserId={user.id}
          otherUser={directUser}
          onBack={() => {
            setDirectUser(null);
            navigate('/messages');
          }}
          isFullscreen={true}
        />
      </>
    );
  }

  // Mobile: Show either list or chat fullscreen
  if (isMobile) {
    if (selectedConversation) {
      return (
        <>
          <Helmet>
            <title>Nhắn tin với {selectedConversation.other_user.username} | FUN Planet</title>
          </Helmet>
          <PrivateChatView
            currentUserId={user.id}
            otherUser={selectedConversation.other_user}
            onBack={() => setSelectedConversation(null)}
            isFullscreen={true}
          />
        </>
      );
    }

    return (
      <>
        <Helmet>
          <title>Tin nhắn | FUN Planet</title>
          <meta name="description" content="Nhắn tin riêng tư với bạn bè trên FUN Planet" />
        </Helmet>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-500 to-purple-500 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white"
                  onClick={() => navigate(-1)}
                >
                  ←
                </Button>
                <h1 className="text-xl font-bold text-white">Tin nhắn</h1>
                {totalUnread > 0 && (
                  <span className="bg-white text-pink-500 text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={() => navigate('/find-friends')}
              >
                <Users className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Conversation List */}
          <ConversationList
            conversations={conversations}
            loading={loading}
            onSelectConversation={setSelectedConversation}
          />
        </div>
      </>
    );
  }

  // Desktop: Split view
  return (
    <>
      <Helmet>
        <title>Tin nhắn | FUN Planet</title>
        <meta name="description" content="Nhắn tin riêng tư với bạn bè trên FUN Planet" />
      </Helmet>
      <div className="min-h-screen bg-background flex">
        {/* Left sidebar - Conversations */}
        <div className="w-[360px] border-r border-border flex flex-col">
          <div className="p-4 border-b border-border bg-gradient-to-r from-pink-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="hover:bg-pink-500/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Tin nhắn</h1>
              </div>
              {totalUnread > 0 && (
                <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalUnread} mới
                </span>
              )}
            </div>
          </div>
          <ConversationList
            conversations={conversations}
            loading={loading}
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?.conversation_id}
          />
        </div>

        {/* Right side - Chat or empty state */}
        <div className="flex-1 flex items-center justify-center">
          {selectedConversation ? (
            <div className="w-full h-screen">
              <PrivateChatView
                currentUserId={user.id}
                otherUser={selectedConversation.other_user}
                isFullscreen={true}
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Chọn cuộc trò chuyện</h2>
              <p className="text-muted-foreground max-w-md">
                Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu nhắn tin mới với bạn bè.
              </p>
              <Button
                className="mt-6 bg-gradient-to-r from-pink-500 to-purple-500"
                onClick={() => navigate('/find-friends')}
              >
                <Users className="h-4 w-4 mr-2" />
                Tìm bạn bè
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PrivateMessages;
