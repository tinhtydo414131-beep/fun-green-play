import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for custom TURN credentials from secrets
    const turnUsername = Deno.env.get('TURN_USERNAME');
    const turnCredential = Deno.env.get('TURN_CREDENTIAL');
    const turnServer = Deno.env.get('TURN_SERVER');

    // Base ICE servers with public STUN servers
    const iceServers: IceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ];

    // Add free public TURN servers (OpenRelay project)
    // These are free and don't require credentials
    iceServers.push(
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      }
    );

    // Add custom TURN server if configured
    if (turnServer && turnUsername && turnCredential) {
      console.log("[ICE Servers] Adding custom TURN server");
      iceServers.push({
        urls: turnServer,
        username: turnUsername,
        credential: turnCredential,
      });
    }

    console.log("[ICE Servers] Returning", iceServers.length, "servers");

    return new Response(
      JSON.stringify({ iceServers }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (err) {
    const error = err as Error;
    console.error("[ICE Servers] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
