import React, { createContext, useContext, ReactNode } from 'react';
import { useVideoCall, CallState } from '@/hooks/useVideoCall';
import { CallModal } from './CallModal';
import { useAuth } from '@/hooks/useAuth';

interface CallContextType {
  callState: CallState;
  startCall: (
    otherUser: { id: string; username: string; avatar_url: string | null },
    callType: 'audio' | 'video'
  ) => Promise<void>;
  endCall: () => Promise<void>;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const {
    callState,
    startCall,
    answerCall,
    endCall,
    declineCall,
    toggleMute,
    toggleCamera,
  } = useVideoCall(user?.id || null);

  return (
    <CallContext.Provider value={{ callState, startCall, endCall }}>
      {children}
      <CallModal
        callState={callState}
        onAnswer={answerCall}
        onDecline={declineCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
      />
    </CallContext.Provider>
  );
};
