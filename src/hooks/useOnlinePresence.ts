import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface OnlineUser {
  id: string;
  online_at: string;
}

export function useOnlinePresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set<string>();
        
        Object.keys(state).forEach((key) => {
          onlineIds.add(key);
        });
        
        setOnlineUsers(onlineIds);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setOnlineUsers((prev) => new Set([...prev, key]));
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Handle visibility change
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await channel.track({
          id: user.id,
          online_at: new Date().toISOString(),
        });
      } else {
        await channel.untrack();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle beforeunload
    const handleBeforeUnload = () => {
      channel.untrack();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isOnline = useCallback(
    (userId: string) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  return {
    onlineUsers,
    isOnline,
  };
}
