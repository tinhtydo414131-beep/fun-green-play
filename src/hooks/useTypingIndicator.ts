import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface TypingUser {
  id: string;
  username: string;
}

export function useTypingIndicator(roomId: string | null) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase.channel(`typing-${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typing: TypingUser[] = [];

        Object.entries(state).forEach(([key, value]) => {
          if (key !== user.id && Array.isArray(value)) {
            const userData = value[0] as any;
            if (userData?.isTyping) {
              typing.push({
                id: key,
                username: userData.username || "Someone",
              });
            }
          }
        });

        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            isTyping: false,
            username: user.email?.split("@")[0] || "User",
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  const startTyping = useCallback(async () => {
    if (!channelRef.current || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Update presence to show typing
    await channelRef.current.track({
      isTyping: true,
      username: user.email?.split("@")[0] || "User",
    });

    // Auto-stop typing after 3 seconds of no activity
    typingTimeoutRef.current = setTimeout(async () => {
      await channelRef.current?.track({
        isTyping: false,
        username: user.email?.split("@")[0] || "User",
      });
    }, 3000);
  }, [user]);

  const stopTyping = useCallback(async () => {
    if (!channelRef.current || !user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await channelRef.current.track({
      isTyping: false,
      username: user.email?.split("@")[0] || "User",
    });
  }, [user]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}
