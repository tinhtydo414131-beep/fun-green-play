import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeConnectionOptions {
  channelName: string;
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onMessage: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Hook to handle Supabase Realtime with automatic reconnection on mobile
 * Fixes: Chat + Like/Comment không real-time trên mobile (do Realtime disconnect khi background)
 */
export function useRealtimeConnection({
  channelName,
  table,
  filter,
  event = '*',
  onMessage,
  enabled = true
}: UseRealtimeConnectionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastVisibilityRef = useRef<string>(document.visibilityState);

  const setupChannel = useCallback(() => {
    if (!enabled) return;

    // Cleanup existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelConfig: any = {
      event,
      schema: 'public',
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, onMessage)
      .subscribe((status) => {
        console.log(`[Realtime] ${channelName} status:`, status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Auto reconnect after error
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[Realtime] Reconnecting ${channelName}...`);
            setupChannel();
          }, 2000);
        }
      });

    channelRef.current = channel;
  }, [channelName, table, filter, event, onMessage, enabled]);

  // Handle visibility change for mobile background/foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentVisibility = document.visibilityState;
      
      // App came back to foreground
      if (lastVisibilityRef.current === 'hidden' && currentVisibility === 'visible') {
        console.log('[Realtime] App returned to foreground, reconnecting...');
        setupChannel();
      }
      
      lastVisibilityRef.current = currentVisibility;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setupChannel]);

  // Initial setup
  useEffect(() => {
    setupChannel();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [setupChannel]);

  // Reconnect on network change
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Realtime] Network online, reconnecting...');
      setTimeout(setupChannel, 1000);
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [setupChannel]);

  const forceReconnect = useCallback(() => {
    setupChannel();
  }, [setupChannel]);

  return { isConnected, forceReconnect };
}

/**
 * Hook specifically for chat real-time with reconnection
 */
export function useChatRealtime(
  roomId: string | null,
  onNewMessage: (message: any) => void,
  enabled: boolean = true
) {
  return useRealtimeConnection({
    channelName: `chat-room-${roomId}`,
    table: 'chat_messages',
    filter: roomId ? `room_id=eq.${roomId}` : undefined,
    event: 'INSERT',
    onMessage: (payload) => {
      onNewMessage(payload.new);
    },
    enabled: enabled && !!roomId
  });
}

/**
 * Hook for posts/likes/comments real-time
 */
export function usePostsRealtime(
  userId: string | null,
  onPostChange: () => void,
  enabled: boolean = true
) {
  const { isConnected: postsConnected } = useRealtimeConnection({
    channelName: `user-posts-${userId}`,
    table: 'posts',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    event: '*',
    onMessage: onPostChange,
    enabled: enabled && !!userId
  });

  const { isConnected: likesConnected } = useRealtimeConnection({
    channelName: `post-likes-global`,
    table: 'post_likes',
    event: '*',
    onMessage: onPostChange,
    enabled
  });

  const { isConnected: commentsConnected } = useRealtimeConnection({
    channelName: `post-comments-global`,
    table: 'post_comments',
    event: '*',
    onMessage: onPostChange,
    enabled
  });

  return { 
    isConnected: postsConnected || likesConnected || commentsConnected 
  };
}
