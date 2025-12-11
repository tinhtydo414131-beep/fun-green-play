import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { usePushNotifications } from "./usePushNotifications";

interface FriendRequest {
  id: string;
  sender_id: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
}

export function useFriendRequestNotifications() {
  const { user } = useAuth();
  const { notifyFriendRequest } = usePushNotifications();
  const [pendingRequest, setPendingRequest] = useState<FriendRequest | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending requests count
  const fetchPendingCount = useCallback(async () => {
    if (!user) return;

    const { count } = await supabase
      .from("friend_requests")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    setPendingCount(count || 0);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchPendingCount();

    // Subscribe to new friend requests
    const channel = supabase
      .channel("friend-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_requests",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch sender info
          const { data: sender } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();

          const newRequest: FriendRequest = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            sender: sender || undefined,
            created_at: payload.new.created_at,
          };

          setPendingRequest(newRequest);
          setPendingCount((prev) => prev + 1);
          
          // Show toast notification
          toast.info(`${sender?.username || "Someone"} sent you a friend request! 🎉`, {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => window.location.href = "/friends",
            },
          });
          
          // Send push notification
          notifyFriendRequest(sender?.username || "Someone");
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "friend_requests",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          // Request was accepted/rejected, update count
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPendingCount]);

  const acceptRequest = useCallback(
    async (requestId: string, senderId: string) => {
      if (!user) return;

      try {
        // Update request status
        const { error: updateError } = await supabase
          .from("friend_requests")
          .update({ status: "accepted" })
          .eq("id", requestId);

        if (updateError) throw updateError;

        // Create mutual friendship
        const { error: friendError } = await supabase.from("friends").insert([
          { user_id: user.id, friend_id: senderId },
          { user_id: senderId, friend_id: user.id },
        ]);

        if (friendError) throw friendError;

        // Update friend counts manually
        const { count: userFriendCount } = await supabase
          .from("friends")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        const { count: senderFriendCount } = await supabase
          .from("friends")
          .select("*", { count: "exact", head: true })
          .eq("user_id", senderId);

        await Promise.all([
          supabase
            .from("profiles")
            .update({ total_friends: userFriendCount || 0 })
            .eq("id", user.id),
          supabase
            .from("profiles")
            .update({ total_friends: senderFriendCount || 0 })
            .eq("id", senderId),
        ]);

        toast.success("Friend request accepted! 🎉");
        setPendingRequest(null);
        fetchPendingCount();
      } catch (error) {
        console.error("Error accepting request:", error);
        toast.error("Failed to accept request");
      }
    },
    [user, fetchPendingCount]
  );

  const rejectRequest = useCallback(
    async (requestId: string) => {
      try {
        const { error } = await supabase
          .from("friend_requests")
          .update({ status: "rejected" })
          .eq("id", requestId);

        if (error) throw error;

        toast.info("Friend request declined");
        setPendingRequest(null);
        fetchPendingCount();
      } catch (error) {
        console.error("Error rejecting request:", error);
        toast.error("Failed to decline request");
      }
    },
    [fetchPendingCount]
  );

  const dismissNotification = useCallback(() => {
    setPendingRequest(null);
  }, []);

  return {
    pendingRequest,
    pendingCount,
    acceptRequest,
    rejectRequest,
    dismissNotification,
    refetch: fetchPendingCount,
  };
}
