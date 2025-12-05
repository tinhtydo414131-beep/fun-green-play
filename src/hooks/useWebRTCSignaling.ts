import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface CallSignal {
  id: string;
  call_id: string;
  sender_id: string;
  signal_type: string;
  signal_data: RTCSessionDescriptionInit | RTCIceCandidateInit;
  created_at: string;
}

interface VideoCall {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: "audio" | "video";
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

// Fallback ICE servers (STUN only)
const FALLBACK_ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

// Fetch ICE servers including TURN from edge function
async function fetchIceServers(): Promise<RTCConfiguration> {
  try {
    console.log("[WebRTC] Fetching ICE servers from edge function...");
    const { data, error } = await supabase.functions.invoke("get-ice-servers");
    
    if (error || !data?.iceServers) {
      console.warn("[WebRTC] Failed to fetch ICE servers, using fallback:", error);
      return FALLBACK_ICE_SERVERS;
    }
    
    console.log("[WebRTC] Got", data.iceServers.length, "ICE servers (including TURN)");
    return { iceServers: data.iceServers };
  } catch (err) {
    console.warn("[WebRTC] Error fetching ICE servers, using fallback:", err);
    return FALLBACK_ICE_SERVERS;
  }
}

export function useWebRTCSignaling() {
  const { user } = useAuth();
  const [currentCall, setCurrentCall] = useState<VideoCall | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const iceServersRef = useRef<RTCConfiguration | null>(null);

  const cleanup = useCallback(() => {
    console.log("[WebRTC] Cleaning up...");
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    remoteStreamRef.current = null;
    pendingCandidatesRef.current = [];
    setConnectionState(null);
  }, []);

  const setupPeerConnection = useCallback(async (
    callId: string,
    onRemoteStream: (stream: MediaStream) => void
  ) => {
    console.log("[WebRTC] Setting up peer connection for call:", callId);
    
    // Fetch ICE servers if not cached
    if (!iceServersRef.current) {
      iceServersRef.current = await fetchIceServers();
    }
    
    const pc = new RTCPeerConnection(iceServersRef.current);
    peerConnectionRef.current = pc;

    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] Connection state:", pc.connectionState);
      setConnectionState(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[WebRTC] ICE connection state:", pc.iceConnectionState);
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate && user) {
        console.log("[WebRTC] New ICE candidate");
        await (supabase.from("call_signals") as any).insert({
          call_id: callId,
          sender_id: user.id,
          signal_type: "ice-candidate",
          signal_data: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("[WebRTC] Remote track received");
      if (event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        onRemoteStream(event.streams[0]);
      }
    };

    return pc;
  }, [user]);

  const subscribeToSignals = useCallback((
    callId: string,
    onRemoteStream: (stream: MediaStream) => void
  ) => {
    console.log("[WebRTC] Subscribing to signals for call:", callId);
    
    const channel = supabase
      .channel(`call-signals-${callId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_signals",
          filter: `call_id=eq.${callId}`,
        },
        async (payload) => {
          const signal = payload.new as CallSignal;
          
          // Ignore our own signals
          if (signal.sender_id === user?.id) return;
          
          console.log("[WebRTC] Received signal:", signal.signal_type);
          const pc = peerConnectionRef.current;
          if (!pc) return;

          try {
            if (signal.signal_type === "offer") {
              console.log("[WebRTC] Processing offer");
              await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data as RTCSessionDescriptionInit));
              
              // Process pending ICE candidates
              for (const candidate of pendingCandidatesRef.current) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              }
              pendingCandidatesRef.current = [];
              
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              
              await (supabase.from("call_signals") as any).insert({
                call_id: callId,
                sender_id: user?.id,
                signal_type: "answer",
                signal_data: answer,
              });
            } else if (signal.signal_type === "answer") {
              console.log("[WebRTC] Processing answer");
              await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data as RTCSessionDescriptionInit));
              
              // Process pending ICE candidates
              for (const candidate of pendingCandidatesRef.current) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              }
              pendingCandidatesRef.current = [];
            } else if (signal.signal_type === "ice-candidate") {
              console.log("[WebRTC] Processing ICE candidate");
              if (pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(signal.signal_data as RTCIceCandidateInit));
              } else {
                pendingCandidatesRef.current.push(signal.signal_data as RTCIceCandidateInit);
              }
            }
          } catch (error) {
            console.error("[WebRTC] Error processing signal:", error);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return channel;
  }, [user]);

  const startCall = useCallback(async (
    targetUserId: string,
    callType: "audio" | "video",
    onRemoteStream: (stream: MediaStream) => void
  ): Promise<{ call: VideoCall; localStream: MediaStream } | null> => {
    if (!user) return null;
    
    try {
      console.log("[WebRTC] Starting call to:", targetUserId);
      
      // Get local media
      const constraints = {
        audio: true,
        video: callType === "video",
      };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;

      // Create call record
      const { data: call, error: callError } = await supabase
        .from("video_calls")
        .insert({
          caller_id: user.id,
          callee_id: targetUserId,
          call_type: callType,
          status: "ringing",
        })
        .select()
        .single();

      if (callError || !call) {
        console.error("[WebRTC] Failed to create call:", callError);
        localStream.getTracks().forEach(track => track.stop());
        return null;
      }

      const typedCall: VideoCall = {
        ...call,
        call_type: call.call_type as "audio" | "video",
      };

      setCurrentCall(typedCall);

      // Setup peer connection
      const pc = await setupPeerConnection(call.id, onRemoteStream);
      
      // Add local tracks
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      // Subscribe to signals
      subscribeToSignals(call.id, onRemoteStream);

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await (supabase.from("call_signals") as any).insert({
        call_id: call.id,
        sender_id: user.id,
        signal_type: "offer",
        signal_data: offer,
      });

      return { call: typedCall, localStream };
    } catch (error) {
      console.error("[WebRTC] Error starting call:", error);
      cleanup();
      return null;
    }
  }, [user, setupPeerConnection, subscribeToSignals, cleanup]);

  const answerCall = useCallback(async (
    call: VideoCall,
    onRemoteStream: (stream: MediaStream) => void
  ): Promise<MediaStream | null> => {
    if (!user) return null;

    try {
      console.log("[WebRTC] Answering call:", call.id);

      // Get local media
      const constraints = {
        audio: true,
        video: call.call_type === "video",
      };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;

      setCurrentCall(call);

      // Update call status
      await supabase
        .from("video_calls")
        .update({ status: "answered", started_at: new Date().toISOString() })
        .eq("id", call.id);

      // Setup peer connection
      const pc = await setupPeerConnection(call.id, onRemoteStream);

      // Add local tracks
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      // Subscribe to signals
      subscribeToSignals(call.id, onRemoteStream);

      // Fetch existing signals (offer might already be there)
      const { data: signals } = await supabase
        .from("call_signals")
        .select("*")
        .eq("call_id", call.id)
        .order("created_at", { ascending: true });

      if (signals) {
        for (const signal of signals) {
          if (signal.sender_id === user.id) continue;
          
          if (signal.signal_type === "offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data as unknown as RTCSessionDescriptionInit));
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await (supabase.from("call_signals") as any).insert({
              call_id: call.id,
              sender_id: user.id,
              signal_type: "answer",
              signal_data: answer,
            });
          } else if (signal.signal_type === "ice-candidate") {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.signal_data as unknown as RTCIceCandidateInit));
            } else {
              pendingCandidatesRef.current.push(signal.signal_data as unknown as RTCIceCandidateInit);
            }
          }
        }
      }

      return localStream;
    } catch (error) {
      console.error("[WebRTC] Error answering call:", error);
      cleanup();
      return null;
    }
  }, [user, setupPeerConnection, subscribeToSignals, cleanup]);

  const endCall = useCallback(async (qualityStats?: {
    avgBitrate?: number;
    avgPacketLoss?: number;
    avgLatency?: number;
    quality?: string;
  }, durationSeconds?: number) => {
    if (currentCall) {
      console.log("[WebRTC] Ending call:", currentCall.id);
      const updateData: Record<string, unknown> = { 
        status: "completed", 
        ended_at: new Date().toISOString() 
      };
      
      if (qualityStats) {
        updateData.quality_stats = qualityStats;
      }
      if (durationSeconds !== undefined) {
        updateData.duration_seconds = durationSeconds;
      }
      
      await supabase
        .from("video_calls")
        .update(updateData)
        .eq("id", currentCall.id);
    }
    setCurrentCall(null);
    cleanup();
  }, [currentCall, cleanup]);

  const rejectCall = useCallback(async (callId: string) => {
    console.log("[WebRTC] Rejecting call:", callId);
    await supabase
      .from("video_calls")
      .update({ status: "rejected" })
      .eq("id", callId);
  }, []);

  const toggleMute = useCallback((muted: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }, []);

  const toggleVideo = useCallback((videoOff: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !videoOff;
      });
    }
  }, []);

  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const pc = peerConnectionRef.current;

      if (pc && localStreamRef.current) {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        // Handle when user stops sharing via browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };
      }

      return screenStream;
    } catch (error) {
      console.error("[WebRTC] Error starting screen share:", error);
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (pc && localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    currentCall,
    connectionState,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    peerConnection: peerConnectionRef.current,
    startCall,
    answerCall,
    endCall,
    rejectCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup,
  };
}
