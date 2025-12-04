import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useReadReceipts(roomId: string | null, userId: string | null) {
  // Mark messages as read when viewing a room
  const markMessagesAsRead = useCallback(async () => {
    if (!roomId || !userId) return;

    try {
      await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("room_id", roomId)
        .neq("sender_id", userId)
        .eq("is_read", false);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [roomId, userId]);

  // Mark messages as read on mount and when new messages arrive
  useEffect(() => {
    if (roomId && userId) {
      markMessagesAsRead();
    }
  }, [roomId, userId, markMessagesAsRead]);

  return { markMessagesAsRead };
}

export function useReadReceiptSubscription(
  roomId: string | null,
  onReadUpdate: (messageIds: string[]) => void
) {
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`read-receipts-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          if (payload.new.is_read && !payload.old.is_read) {
            onReadUpdate([payload.new.id]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, onReadUpdate]);
}
