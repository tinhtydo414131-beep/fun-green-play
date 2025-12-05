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

interface TwilioIceServer {
  url: string;
  urls: string;
  username?: string;
  credential?: string;
}

// Fetch time-limited TURN credentials from Twilio
async function fetchTwilioCredentials(): Promise<IceServer[] | null> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

  if (!accountSid || !authToken) {
    console.log("[ICE Servers] Twilio credentials not configured");
    return null;
  }

  try {
    console.log("[ICE Servers] Fetching Twilio TURN credentials...");
    
    // Twilio Network Traversal Service API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Tokens.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Request 24-hour TTL for credentials
        body: 'Ttl=86400',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ICE Servers] Twilio API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("[ICE Servers] Twilio credentials received, expires:", data.date_updated);

    // Transform Twilio response to standard ICE server format
    const iceServers: IceServer[] = data.ice_servers.map((server: TwilioIceServer) => ({
      urls: server.urls || server.url,
      username: server.username,
      credential: server.credential,
    }));

    console.log("[ICE Servers] Got", iceServers.length, "servers from Twilio");
    return iceServers;
  } catch (error) {
    console.error("[ICE Servers] Error fetching Twilio credentials:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Base ICE servers with public STUN servers
    const iceServers: IceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ];

    // Try to get Twilio TURN credentials (enterprise-grade)
    const twilioServers = await fetchTwilioCredentials();
    
    if (twilioServers && twilioServers.length > 0) {
      console.log("[ICE Servers] Using Twilio TURN servers");
      iceServers.push(...twilioServers);
    } else {
      // Fallback to free public TURN servers (OpenRelay project)
      console.log("[ICE Servers] Falling back to public TURN servers");
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
    }

    // Check for additional custom TURN credentials
    const turnUsername = Deno.env.get('TURN_USERNAME');
    const turnCredential = Deno.env.get('TURN_CREDENTIAL');
    const turnServer = Deno.env.get('TURN_SERVER');

    if (turnServer && turnUsername && turnCredential) {
      console.log("[ICE Servers] Adding custom TURN server");
      iceServers.push({
        urls: turnServer,
        username: turnUsername,
        credential: turnCredential,
      });
    }

    console.log("[ICE Servers] Returning", iceServers.length, "total servers");

    return new Response(
      JSON.stringify({ 
        iceServers,
        provider: twilioServers ? 'twilio' : 'public'
      }),
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
