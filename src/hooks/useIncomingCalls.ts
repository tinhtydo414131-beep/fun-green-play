import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface IncomingCall {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: "audio" | "video";
  status: string;
  created_at: string;
  caller?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export function useIncomingCalls() {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  const fetchCallerInfo = useCallback(async (callerId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", callerId)
      .single();
    return data;
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log("[IncomingCalls] Subscribing to incoming calls for user:", user.id);

    const channel = supabase
      .channel("incoming-calls")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "video_calls",
          filter: `callee_id=eq.${user.id}`,
        },
        async (payload) => {
          const call = payload.new as IncomingCall;
          console.log("[IncomingCalls] New incoming call:", call);
          
          if (call.status === "ringing") {
            const caller = await fetchCallerInfo(call.caller_id);
            setIncomingCall({ ...call, caller: caller || undefined });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "video_calls",
          filter: `callee_id=eq.${user.id}`,
        },
        (payload) => {
          const call = payload.new as IncomingCall;
          console.log("[IncomingCalls] Call updated:", call.status);
          
          if (call.status !== "ringing") {
            setIncomingCall((current) => 
              current?.id === call.id ? null : current
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log("[IncomingCalls] Unsubscribing");
      supabase.removeChannel(channel);
    };
  }, [user, fetchCallerInfo]);

  const dismissIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return {
    incomingCall,
    dismissIncomingCall,
  };
}
