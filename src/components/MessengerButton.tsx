import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle } from "lucide-react";

export function MessengerButton() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      subscribeToMessages();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      // Get rooms user is member of
      const { data: memberships } = await supabase
        .from("chat_room_members")
        .select("room_id")
        .eq("user_id", user.id);

      if (!memberships?.length) return;

      const roomIds = memberships.map(m => m.room_id);

      // Count unread messages in those rooms not from this user
      const { count } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .in("room_id", roomIds)
        .neq("sender_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages"
        },
        (payload) => {
          if (payload.new.sender_id !== user?.id) {
            setUnreadCount(prev => prev + 1);
            // Play notification sound
            const audio = new Audio("/audio/coin-reward.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => {});
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `is_read=eq.true`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate("/messages")}
    >
      <MessageCircle className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-500 text-white text-xs flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
