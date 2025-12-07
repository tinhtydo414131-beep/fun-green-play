import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Check, Clock, MessageCircle, UserMinus, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FriendStatus = "none" | "friends" | "pending_sent" | "pending_received";

interface FriendActionButtonProps {
  targetUserId: string;
  targetUsername: string;
  showMessage?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function FriendActionButton({
  targetUserId,
  targetUsername,
  showMessage = true,
  size = "default",
  className = "",
}: FriendActionButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<FriendStatus>("none");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && targetUserId) {
      checkFriendStatus();
    }
  }, [user, targetUserId]);

  const checkFriendStatus = async () => {
    if (!user) return;
    
    try {
      // Check if already friends
      const { data: friendship } = await supabase
        .from("friends")
        .select("id")
        .eq("user_id", user.id)
        .eq("friend_id", targetUserId)
        .single();

      if (friendship) {
        setStatus("friends");
        setLoading(false);
        return;
      }

      // Check for pending sent request
      const { data: sentRequest } = await supabase
        .from("friend_requests")
        .select("id")
        .eq("sender_id", user.id)
        .eq("receiver_id", targetUserId)
        .eq("status", "pending")
        .single();

      if (sentRequest) {
        setStatus("pending_sent");
        setRequestId(sentRequest.id);
        setLoading(false);
        return;
      }

      // Check for pending received request
      const { data: receivedRequest } = await supabase
        .from("friend_requests")
        .select("id")
        .eq("sender_id", targetUserId)
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .single();

      if (receivedRequest) {
        setStatus("pending_received");
        setRequestId(receivedRequest.id);
        setLoading(false);
        return;
      }

      setStatus("none");
    } catch (error) {
      console.error("Error checking friend status:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: user.id,
          receiver_id: targetUserId,
          status: "pending"
        })
        .select("id")
        .single();

      if (error) throw error;

      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      toast.success(`Đã gửi lời mời kết bạn đến ${targetUsername}! 🎉`);
      setStatus("pending_sent");
      setRequestId(data.id);
    } catch (error) {
      toast.error("Không thể gửi lời mời kết bạn");
    } finally {
      setProcessing(false);
    }
  };

  const cancelRequest = async () => {
    if (!requestId) return;
    setProcessing(true);
    try {
      await supabase
        .from("friend_requests")
        .delete()
        .eq("id", requestId);

      toast.info("Đã hủy lời mời kết bạn");
      setStatus("none");
      setRequestId(null);
    } catch (error) {
      toast.error("Không thể hủy lời mời");
    } finally {
      setProcessing(false);
    }
  };

  const acceptRequest = async () => {
    if (!requestId || !user) return;
    setProcessing(true);
    try {
      // Update request
      await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      // Create friendship
      await supabase.from("friends").insert([
        { user_id: user.id, friend_id: targetUserId },
        { user_id: targetUserId, friend_id: user.id }
      ]);

      // Update counts
      await Promise.all([
        supabase.from("profiles").update({ 
          total_friends: (await supabase.from("profiles").select("total_friends").eq("id", user.id).single()).data?.total_friends + 1 
        }).eq("id", user.id),
        supabase.from("profiles").update({ 
          total_friends: (await supabase.from("profiles").select("total_friends").eq("id", targetUserId).single()).data?.total_friends + 1 
        }).eq("id", targetUserId)
      ]);

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      toast.success(`Bạn và ${targetUsername} đã trở thành bạn bè! 🎊`);
      setStatus("friends");
      setRequestId(null);
    } catch (error) {
      toast.error("Không thể chấp nhận lời mời");
    } finally {
      setProcessing(false);
    }
  };

  const rejectRequest = async () => {
    if (!requestId) return;
    setProcessing(true);
    try {
      await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      toast.info("Đã từ chối lời mời kết bạn");
      setStatus("none");
      setRequestId(null);
    } catch (error) {
      toast.error("Không thể từ chối lời mời");
    } finally {
      setProcessing(false);
    }
  };

  const unfriend = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      await supabase
        .from("friends")
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`);

      toast.info(`Đã hủy kết bạn với ${targetUsername}`);
      setStatus("none");
    } catch (error) {
      toast.error("Không thể hủy kết bạn");
    } finally {
      setProcessing(false);
    }
  };

  const openChat = () => {
    navigate(`/messages?with=${targetUserId}`);
  };

  if (loading) {
    return (
      <Button size={size} variant="outline" disabled className={className}>
        <div className="animate-pulse w-16 h-4 bg-muted rounded" />
      </Button>
    );
  }

  if (user?.id === targetUserId) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {status === "none" && (
        <Button
          size={size}
          onClick={sendRequest}
          disabled={processing}
          className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          {processing ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Thêm bạn bè
            </>
          )}
        </Button>
      )}

      {status === "pending_sent" && (
        <Button
          size={size}
          variant="outline"
          onClick={cancelRequest}
          disabled={processing}
          className="gap-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
        >
          <Clock className="w-4 h-4" />
          Đã gửi lời mời
        </Button>
      )}

      {status === "pending_received" && (
        <div className="flex gap-2">
          <Button
            size={size}
            onClick={acceptRequest}
            disabled={processing}
            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
          >
            <Check className="w-4 h-4" />
            Đồng ý
          </Button>
          <Button
            size={size}
            variant="outline"
            onClick={rejectRequest}
            disabled={processing}
          >
            Từ chối
          </Button>
        </div>
      )}

      {status === "friends" && (
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={size} variant="outline" className="gap-2 text-green-600 border-green-200">
                <Check className="w-4 h-4" />
                Bạn bè
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={unfriend} className="text-red-500">
                <UserMinus className="w-4 h-4 mr-2" />
                Hủy kết bạn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {showMessage && (
            <Button size={size} variant="default" onClick={openChat} className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Nhắn tin
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
