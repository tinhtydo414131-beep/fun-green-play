import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { useWebRTCSignaling } from "@/hooks/useWebRTCSignaling";
import { useCallQualityStats } from "@/hooks/useCallQualityStats";
import { CallQualityIndicator } from "@/components/CallQualityIndicator";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
  isIncoming?: boolean;
  incomingCallId?: string;
  callType?: "audio" | "video";
}

export function VideoCall({
  isOpen,
  onClose,
  targetUser,
  isIncoming = false,
  incomingCallId,
  callType = "video",
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const [callStatus, setCallStatus] = useState<"ringing" | "connecting" | "connected" | "ended">("ringing");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const {
    connectionState,
    peerConnection,
    startCall,
    answerCall,
    endCall,
    rejectCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useWebRTCSignaling();

  // Call quality monitoring
  const qualityStats = useCallQualityStats(peerConnection);

  const handleRemoteStream = (stream: MediaStream) => {
    console.log("[VideoCall] Remote stream received");
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
    setCallStatus("connected");
  };

  useEffect(() => {
    if (!isOpen || !targetUser) return;

    const initializeCall = async () => {
      if (isIncoming && incomingCallId) {
        // Answer incoming call
        setCallStatus("connecting");
        const call = {
          id: incomingCallId,
          caller_id: targetUser.id,
          callee_id: "",
          call_type: callType,
          status: "ringing",
          started_at: null,
          ended_at: null,
          created_at: new Date().toISOString(),
        };
        
        const localStream = await answerCall(call, handleRemoteStream);
        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } else {
        // Start outgoing call
        setCallStatus("ringing");
        const result = await startCall(targetUser.id, callType, handleRemoteStream);
        if (result?.localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = result.localStream;
        }
      }
    };

    initializeCall();

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isOpen, targetUser, isIncoming, incomingCallId, callType, answerCall, startCall]);

  // Update connection status based on WebRTC state
  useEffect(() => {
    if (connectionState === "connected") {
      setCallStatus("connected");
    } else if (connectionState === "connecting") {
      setCallStatus("connecting");
    } else if (connectionState === "failed" || connectionState === "disconnected" || connectionState === "closed") {
      setCallStatus("ended");
    }
  }, [connectionState]);

  // Duration timer
  useEffect(() => {
    if (callStatus === "connected") {
      durationInterval.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callStatus]);

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    toggleMute(newMuted);
  };

  const handleToggleVideo = () => {
    const newVideoOff = !isVideoOff;
    setIsVideoOff(newVideoOff);
    toggleVideo(newVideoOff);
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      await stopScreenShare();
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      const stream = await startScreenShare();
      if (stream) {
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        
        // Handle when user stops via browser UI
        stream.getVideoTracks()[0].onended = () => {
          screenStreamRef.current = null;
          setIsScreenSharing(false);
        };
      }
    }
  };

  const handleEndCall = async () => {
    setCallStatus("ended");
    
    // Prepare quality stats for saving
    const avgQualityStats = callDuration > 0 && qualityStats ? {
      avgBitrate: qualityStats.audioBitrate + qualityStats.videoBitrate,
      avgPacketLoss: (qualityStats.audioPacketLoss + qualityStats.videoPacketLoss) / 2,
      avgLatency: qualityStats.roundTripTime,
      quality: qualityStats.quality.charAt(0).toUpperCase() + qualityStats.quality.slice(1),
    } : undefined;
    
    await endCall(avgQualityStats, callDuration);
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    onClose();
  };

  const handleRejectCall = async () => {
    if (incomingCallId) {
      await rejectCall(incomingCallId);
    }
    onClose();
  };

  const handleAcceptCall = async () => {
    if (!targetUser || !incomingCallId) return;
    
    setCallStatus("connecting");
    const call = {
      id: incomingCallId,
      caller_id: targetUser.id,
      callee_id: "",
      call_type: callType,
      status: "ringing",
      started_at: null,
      ended_at: null,
      created_at: new Date().toISOString(),
    };
    
    const localStream = await answerCall(call, handleRemoteStream);
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!targetUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleEndCall()}>
      <DialogContent
        className={`p-0 overflow-hidden bg-black border-none ${
          isFullscreen ? "fixed inset-0 max-w-none w-screen h-screen rounded-none" : "max-w-2xl"
        }`}
      >
        <div className="relative w-full h-full min-h-[400px] flex flex-col">
          {/* Remote Video / Avatar */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            {callType === "video" && callStatus === "connected" ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-white/20">
                  <AvatarImage src={targetUser.avatar_url || ""} />
                  <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                    {targetUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-white text-2xl font-semibold">
                  {targetUser.username}
                </h3>
                <p className="text-white/70 text-sm">
                  {callStatus === "ringing" && (isIncoming ? "Incoming call..." : "Calling...")}
                  {callStatus === "connecting" && "Connecting..."}
                  {callStatus === "connected" && formatDuration(callDuration)}
                  {callStatus === "ended" && "Call ended"}
                </p>
              </div>
            )}

            {/* Call Quality Indicator */}
            {callStatus === "connected" && (
              <CallQualityIndicator 
                stats={qualityStats} 
                isVideoCall={callType === "video"} 
              />
            )}

            {/* Local Video PIP */}
            {callType === "video" && !isVideoOff && (
              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/30 bg-black">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover mirror"
                  style={{ transform: "scaleX(-1)" }}
                />
              </div>
            )}

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>

            {/* Call Duration (for video calls when connected) */}
            {callStatus === "connected" && callType === "video" && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
                <p className="text-white text-sm">{formatDuration(callDuration)}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-900/90 backdrop-blur p-6">
            <div className="flex items-center justify-center gap-4">
              {/* Mute Button */}
              <Button
                variant="outline"
                size="icon"
                className={`w-14 h-14 rounded-full ${
                  isMuted
                    ? "bg-red-500/20 border-red-500 text-red-500"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
                onClick={handleToggleMute}
                disabled={callStatus === "ended"}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {/* Video Toggle (only for video calls) */}
              {callType === "video" && (
                <Button
                  variant="outline"
                  size="icon"
                  className={`w-14 h-14 rounded-full ${
                    isVideoOff
                      ? "bg-red-500/20 border-red-500 text-red-500"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                  onClick={handleToggleVideo}
                  disabled={callStatus === "ended" || isScreenSharing}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
              )}

              {/* Screen Share Button (only for video calls when connected) */}
              {callType === "video" && callStatus === "connected" && (
                <Button
                  variant="outline"
                  size="icon"
                  className={`w-14 h-14 rounded-full ${
                    isScreenSharing
                      ? "bg-blue-500/20 border-blue-500 text-blue-500"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                  onClick={handleToggleScreenShare}
                >
                  {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                </Button>
              )}

              {/* End Call Button */}
              <Button
                size="icon"
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>

              {/* Accept Call Button (for incoming calls) */}
              {isIncoming && callStatus === "ringing" && (
                <Button
                  size="icon"
                  className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleAcceptCall}
                >
                  <Phone className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VideoCall;
