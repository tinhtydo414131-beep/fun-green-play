import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CallState {
  callId: string | null;
  status: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
  callType: 'audio' | 'video';
  isCaller: boolean;
  remoteUser: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startTime: Date | null;
}

export const useVideoCall = (currentUserId: string | null) => {
  const { toast } = useToast();
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    status: 'idle',
    callType: 'audio',
    isCaller: false,
    remoteUser: null,
    localStream: null,
    remoteStream: null,
    startTime: null,
  });
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Initialize WebRTC peer connection
  const initPeerConnection = useCallback((stream: MediaStream) => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);

    // Add local tracks to connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle incoming tracks
    pc.ontrack = (event) => {
      setCallState(prev => ({
        ...prev,
        remoteStream: event.streams[0],
      }));
    };

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && callState.callId) {
        await supabase.from('call_signals').insert({
          call_id: callState.callId,
          sender_id: currentUserId!,
          signal_type: 'ice-candidate',
          signal_data: { candidate: event.candidate.toJSON() } as unknown as Record<string, unknown>,
        } as any);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState(prev => ({ ...prev, status: 'connected', startTime: new Date() }));
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [currentUserId, callState.callId]);

  // Start a call
  const startCall = async (
    otherUser: { id: string; username: string; avatar_url: string | null },
    callType: 'audio' | 'video'
  ) => {
    if (!currentUserId) return;

    try {
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });

      // Create call record
      const { data: call, error } = await supabase
        .from('video_calls')
        .insert({
          caller_id: currentUserId,
          callee_id: otherUser.id,
          call_type: callType,
          status: 'ringing',
        })
        .select()
        .single();

      if (error) throw error;

      setCallState({
        callId: call.id,
        status: 'calling',
        callType,
        isCaller: true,
        remoteUser: otherUser,
        localStream: stream,
        remoteStream: null,
        startTime: null,
      });

      // Initialize peer connection
      const pc = initPeerConnection(stream);

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await supabase.from('call_signals').insert({
        call_id: call.id,
        sender_id: currentUserId,
        signal_type: 'offer',
        signal_data: { sdp: offer.sdp, type: offer.type },
      });

      toast({
        title: callType === 'video' ? "Đang gọi video..." : "Đang gọi...",
        description: `Đang gọi cho ${otherUser.username}`,
      });

    } catch (error: any) {
      console.error('Error starting call:', error);
      toast({
        title: "Không thể thực hiện cuộc gọi",
        description: error.message || "Vui lòng kiểm tra quyền truy cập camera/microphone",
        variant: "destructive",
      });
    }
  };

  // Answer incoming call
  const answerCall = async (callId: string, callType: 'audio' | 'video') => {
    if (!currentUserId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });

      setCallState(prev => ({
        ...prev,
        localStream: stream,
        status: 'connected',
      }));

      const pc = initPeerConnection(stream);

      // Get the offer signal
      const { data: signals } = await supabase
        .from('call_signals')
        .select('*')
        .eq('call_id', callId)
        .eq('signal_type', 'offer')
        .single();

      if (signals) {
        const signalData = signals.signal_data as unknown as RTCSessionDescriptionInit;
        await pc.setRemoteDescription(new RTCSessionDescription(signalData));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await supabase.from('call_signals').insert({
          call_id: callId,
          sender_id: currentUserId,
          signal_type: 'answer',
          signal_data: { sdp: answer.sdp, type: answer.type },
        });
      }

      // Update call status
      await supabase
        .from('video_calls')
        .update({ status: 'connected', started_at: new Date().toISOString() })
        .eq('id', callId);

    } catch (error: any) {
      console.error('Error answering call:', error);
      toast({
        title: "Không thể trả lời cuộc gọi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // End call
  const endCall = useCallback(async () => {
    if (callState.localStream) {
      callState.localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (callState.callId) {
      const duration = callState.startTime 
        ? Math.floor((Date.now() - callState.startTime.getTime()) / 1000)
        : 0;

      await supabase
        .from('video_calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
        })
        .eq('id', callState.callId);
    }

    setCallState({
      callId: null,
      status: 'idle',
      callType: 'audio',
      isCaller: false,
      remoteUser: null,
      localStream: null,
      remoteStream: null,
      startTime: null,
    });
  }, [callState]);

  // Decline call
  const declineCall = async (callId: string) => {
    await supabase
      .from('video_calls')
      .update({ status: 'declined', ended_at: new Date().toISOString() })
      .eq('id', callId);
    
    setCallState({
      callId: null,
      status: 'idle',
      callType: 'audio',
      isCaller: false,
      remoteUser: null,
      localStream: null,
      remoteStream: null,
      startTime: null,
    });
  };

  // Toggle mute
  const toggleMute = () => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  // Listen for incoming calls
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_calls',
          filter: `callee_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const call = payload.new as any;
          
          // Fetch caller info
          const { data: callerProfile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', call.caller_id)
            .single();

          if (callerProfile) {
            setCallState({
              callId: call.id,
              status: 'ringing',
              callType: call.call_type,
              isCaller: false,
              remoteUser: callerProfile,
              localStream: null,
              remoteStream: null,
              startTime: null,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Listen for call signals
  useEffect(() => {
    if (!callState.callId || !currentUserId) return;

    const channel = supabase
      .channel(`call-signals-${callState.callId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `call_id=eq.${callState.callId}`,
        },
        async (payload) => {
          const signal = payload.new as any;
          
          // Ignore own signals
          if (signal.sender_id === currentUserId) return;

          const pc = peerConnection.current;
          if (!pc) return;

          if (signal.signal_type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data));
            setCallState(prev => ({ ...prev, status: 'connected', startTime: new Date() }));
          } else if (signal.signal_type === 'ice-candidate' && signal.signal_data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.signal_data.candidate));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [callState.callId, currentUserId]);

  // Listen for call status changes
  useEffect(() => {
    if (!callState.callId) return;

    const channel = supabase
      .channel(`call-status-${callState.callId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_calls',
          filter: `id=eq.${callState.callId}`,
        },
        (payload) => {
          const call = payload.new as any;
          if (call.status === 'ended' || call.status === 'declined') {
            endCall();
            toast({
              title: call.status === 'declined' ? "Cuộc gọi bị từ chối" : "Cuộc gọi đã kết thúc",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callState.callId, endCall, toast]);

  return {
    callState,
    startCall,
    answerCall,
    endCall,
    declineCall,
    toggleMute,
    toggleCamera,
  };
};
