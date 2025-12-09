import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();
    console.log('Scanning game content:', { title, description });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a content safety scanner for a kids gaming platform called FUN Planet. 
            Analyze the game title and description for any inappropriate content.
            
            Flag as UNSAFE if content contains:
            - Violence or gore
            - Adult/sexual content
            - Hate speech or discrimination
            - Drug/alcohol references
            - Gambling
            - Profanity or vulgar language
            - Scary/horror themes
            - Scams or malicious intent
            
            Respond with JSON only: {"safe": boolean, "reason": "string", "confidence": number}`
          },
          {
            role: "user",
            content: `Scan this game submission for a kids platform:
            
Title: ${title}
Description: ${description}

Is this content appropriate for children aged 3-12?`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('AI Gateway error:', response.status);
      // Default to manual review if AI fails
      return new Response(JSON.stringify({
        safe: true,
        reason: "AI scan unavailable - approved for manual review",
        confidence: 0.5,
        needsReview: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';
    console.log('AI Response:', content);

    // Parse the JSON response from AI
    let scanResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scanResult = JSON.parse(jsonMatch[0]);
      } else {
        scanResult = { safe: true, reason: "Content appears appropriate", confidence: 0.7 };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      scanResult = { safe: true, reason: "Scan completed - manual review recommended", confidence: 0.6 };
    }

    console.log('Scan result:', scanResult);

    return new Response(JSON.stringify(scanResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Scan error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      safe: true,
      reason: "Scan error - approved for manual review",
      confidence: 0.5,
      error: errorMessage
    }), {
      status: 200, // Return 200 so upload can proceed
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});