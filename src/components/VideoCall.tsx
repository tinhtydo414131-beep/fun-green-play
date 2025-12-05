import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor,
  X,
  Maximize2,
  Minimize2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  isIncoming?: boolean;
  callType: "audio" | "video";
}

export function VideoCall({ isOpen, onClose, targetUser, isIncoming, callType }: VideoCallProps) {
  const { user } = useAuth();
  const [callStatus, setCallStatus] = useState<"ringing" | "connected" | "ended">("ringing");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeCall();
    }

    return () => {
      cleanup();
    };
  }, [isOpen]);

  useEffect(() => {
    if (callStatus === "connected") {
      durationInterval.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callStatus]);

  const initializeCall = async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === "video"
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Handle incoming tracks
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // For demo purposes, simulate connection after 2 seconds
      if (!isIncoming) {
        setTimeout(() => {
          setCallStatus("connected");
          toast.success("Call connected!");
        }, 2000);
      }

    } catch (error) {
      console.error("Error initializing call:", error);
      toast.error("Failed to access camera/microphone");
      onClose();
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    setCallStatus("ringing");
    setCallDuration(0);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const endCall = () => {
    setCallStatus("ended");
    cleanup();
    onClose();
    toast.info("Call ended");
  };

  const acceptCall = () => {
    setCallStatus("connected");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => endCall()}>
      <DialogContent className={`p-0 overflow-hidden bg-black ${isFullscreen ? "max-w-full h-screen" : "sm:max-w-xl"}`}>
        <div className="relative h-[70vh] flex flex-col">
          {/* Remote Video / Avatar */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
            {callType === "video" && callStatus === "connected" ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <motion.div
                  animate={callStatus === "ringing" ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/50">
                    <AvatarImage src={targetUser.avatar_url || undefined} />
                    <AvatarFallback className="text-4xl">
                      {targetUser.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <h3 className="text-white text-xl font-semibold">{targetUser.username}</h3>
                <p className="text-white/70 mt-2">
                  {callStatus === "ringing" && (isIncoming ? "Incoming call..." : "Calling...")}
                  {callStatus === "connected" && formatDuration(callDuration)}
                </p>
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          {callType === "video" && isVideoEnabled && (
            <motion.div
              className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg"
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Header Controls */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
              {callStatus === "ringing" && isIncoming ? (
                <>
                  <Button
                    size="lg"
                    className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
                    onClick={endCall}
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600"
                    onClick={acceptCall}
                  >
                    <Phone className="w-6 h-6" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    className={`rounded-full w-14 h-14 ${isMuted ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white"}`}
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  
                  {callType === "video" && (
                    <Button
                      variant="ghost"
                      size="lg"
                      className={`rounded-full w-14 h-14 ${!isVideoEnabled ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white"}`}
                      onClick={toggleVideo}
                    >
                      {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>
                  )}

                  <Button
                    size="lg"
                    className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
                    onClick={endCall}
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}