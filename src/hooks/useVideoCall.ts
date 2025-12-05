import { useState, useCallback } from "react";

interface CallTarget {
  id: string;
  username: string;
  avatar_url: string | null;
}

export function useVideoCall() {
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callTarget, setCallTarget] = useState<CallTarget | null>(null);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [isIncoming, setIsIncoming] = useState(false);

  const startCall = useCallback((target: CallTarget, type: "audio" | "video") => {
    setCallTarget(target);
    setCallType(type);
    setIsIncoming(false);
    setIsCallOpen(true);
  }, []);

  const receiveCall = useCallback((target: CallTarget, type: "audio" | "video") => {
    setCallTarget(target);
    setCallType(type);
    setIsIncoming(true);
    setIsCallOpen(true);
  }, []);

  const endCall = useCallback(() => {
    setIsCallOpen(false);
    setCallTarget(null);
  }, []);

  return {
    isCallOpen,
    callTarget,
    callType,
    isIncoming,
    startCall,
    receiveCall,
    endCall
  };
}