import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, X, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface FriendRequest {
  id: string;
  sender_id: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
}

interface FriendRequestNotificationProps {
  request: FriendRequest | null;
  onClose: () => void;
  onAccept: (requestId: string, senderId: string) => void;
  onReject: (requestId: string) => void;
}

export function FriendRequestNotification({ 
  request, 
  onClose, 
  onAccept, 
  onReject 
}: FriendRequestNotificationProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (request) {
      // Play notification sound
      const audio = new Audio("/audio/coin-reward.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      // Auto dismiss after 15 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [request, onClose]);

  const handleAccept = async () => {
    if (!request) return;
    setIsLoading(true);
    try {
      await onAccept(request.id, request.sender_id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    setIsLoading(true);
    try {
      await onReject(request.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {request && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -100, x: "-50%" }}
          className="fixed top-24 left-1/2 z-[100] w-full max-w-md px-4"
        >
          <Card className="relative overflow-hidden border-2 border-primary/50 shadow-2xl bg-gradient-to-br from-background via-primary/5 to-secondary/5">
            {/* Sparkle effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: i * 0.3 
                  }}
                  style={{ 
                    left: `${20 + i * 15}%`, 
                    top: `${20 + (i % 3) * 25}%` 
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <UserPlus className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="font-fredoka font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  New Friend Request! 👋
                </h3>
              </div>

              {/* Sender info */}
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Avatar className="w-16 h-16 border-4 border-primary/30 shadow-lg">
                    <AvatarImage src={request.sender?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-fredoka font-bold text-xl">
                      {request.sender?.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <p className="font-fredoka font-bold text-xl">
                    {request.sender?.username || "Someone"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    wants to be your friend!
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 gap-2 border-2"
                >
                  <X className="w-4 h-4" />
                  Decline
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="h-1 bg-gradient-to-r from-primary to-secondary"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
