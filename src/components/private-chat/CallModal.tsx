import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, 
  PhoneIncoming, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CallState } from '@/hooks/useVideoCall';

interface CallModalProps {
  callState: CallState;
  onAnswer: (callId: string, callType: 'audio' | 'video') => void;
  onDecline: (callId: string) => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  callState,
  onAnswer,
  onDecline,
  onEnd,
  onToggleMute,
  onToggleCamera,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const isOpen = callState.status !== 'idle';
  const isRinging = callState.status === 'ringing' && !callState.isCaller;
  const isCalling = callState.status === 'calling';
  const isConnected = callState.status === 'connected';

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  // Call duration timer
  useEffect(() => {
    if (!isConnected) {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute();
  };

  const handleToggleCamera = () => {
    setIsCameraOff(!isCameraOff);
    onToggleCamera();
  };

  if (!isOpen || !callState.remoteUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className={cn(
          "max-w-md p-0 overflow-hidden border-0",
          callState.callType === 'video' && isConnected && "max-w-3xl"
        )}
      >
        <div className={cn(
          "relative flex flex-col items-center justify-center min-h-[400px]",
          callState.callType === 'video' && isConnected ? "bg-black" : "bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500"
        )}>
          
          {/* Video call - Connected state */}
          {callState.callType === 'video' && isConnected ? (
            <>
              {/* Remote video (full screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full min-h-[400px] object-cover"
              />
              
              {/* Local video (picture-in-picture) */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 right-4 w-32 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "w-full h-full object-cover",
                    isCameraOff && "hidden"
                  )}
                />
                {isCameraOff && (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <VideoOff className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </motion.div>

              {/* Duration badge */}
              <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-mono">
                  {formatDuration(callDuration)}
                </span>
              </div>
            </>
          ) : (
            /* Audio call or Calling/Ringing state */
            <div className="flex flex-col items-center py-10 px-6 text-white text-center">
              {/* Animated rings for calling state */}
              <div className="relative mb-6">
                <AnimatePresence>
                  {(isCalling || isRinging) && (
                    <>
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ 
                            scale: [1, 2], 
                            opacity: [0.5, 0] 
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                          className="absolute inset-0 rounded-full border-4 border-white/30"
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
                
                <Avatar className="h-28 w-28 ring-4 ring-white/30 shadow-2xl">
                  <AvatarImage src={callState.remoteUser.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-white/20 to-white/10 text-white text-3xl">
                    {callState.remoteUser.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {callState.remoteUser.username}
              </h2>
              
              <p className="text-white/80 text-lg mb-2">
                {isRinging ? (
                  <span className="flex items-center gap-2">
                    <PhoneIncoming className="h-5 w-5 animate-bounce" />
                    {callState.callType === 'video' ? 'Cuộc gọi video đến' : 'Cuộc gọi đến'}
                  </span>
                ) : isCalling ? (
                  'Đang gọi...'
                ) : isConnected ? (
                  formatDuration(callDuration)
                ) : null}
              </p>

              {/* Audio indicator when connected */}
              {isConnected && callState.callType === 'audio' && (
                <div className="flex gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: [8, 24, 8],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="w-1.5 bg-white/60 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
              {isRinging ? (
                /* Incoming call controls */
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Button
                      variant="destructive"
                      size="lg"
                      className="h-16 w-16 rounded-full shadow-lg"
                      onClick={() => onDecline(callState.callId!)}
                    >
                      <X className="h-8 w-8" />
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      size="lg"
                      className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
                      onClick={() => onAnswer(callState.callId!, callState.callType)}
                    >
                      <Phone className="h-8 w-8" />
                    </Button>
                  </motion.div>
                </>
              ) : (
                /* In-call controls */
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      "h-14 w-14 rounded-full",
                      isMuted ? "bg-red-500/80 text-white" : "bg-white/20 text-white hover:bg-white/30"
                    )}
                    onClick={handleToggleMute}
                  >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>

                  {callState.callType === 'video' && (
                    <Button
                      variant="ghost"
                      size="lg"
                      className={cn(
                        "h-14 w-14 rounded-full",
                        isCameraOff ? "bg-red-500/80 text-white" : "bg-white/20 text-white hover:bg-white/30"
                      )}
                      onClick={handleToggleCamera}
                    >
                      {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    size="lg"
                    className="h-16 w-16 rounded-full shadow-lg"
                    onClick={onEnd}
                  >
                    <PhoneOff className="h-7 w-7" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
