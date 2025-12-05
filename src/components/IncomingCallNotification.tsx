import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IncomingCallNotificationProps {
  caller: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  callType: "audio" | "video";
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallNotification({
  caller,
  callType,
  onAccept,
  onReject,
}: IncomingCallNotificationProps) {
  // Play ringtone
  useEffect(() => {
    const audio = new Audio("/audio/coin-reward.mp3");
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(console.error);

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-6 min-w-[320px]">
          <div className="flex flex-col items-center gap-4">
            {/* Pulsing avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
              <Avatar className="w-20 h-20 border-4 border-primary relative">
                <AvatarImage src={caller.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {caller.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Caller info */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                {caller.username}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                {callType === "video" ? (
                  <>
                    <Video className="w-4 h-4" />
                    Incoming video call
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Incoming audio call
                  </>
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-6 mt-2">
              <Button
                size="icon"
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
                onClick={onReject}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white animate-pulse"
                onClick={onAccept}
              >
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default IncomingCallNotification;
