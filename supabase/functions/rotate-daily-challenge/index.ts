import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date().toISOString().split('T')[0];

    console.log(`Rotating daily challenge for ${today}`);

    // Check if today's challenge already exists
    const { data: existingChallenge } = await supabase
      .from("daily_combo_challenges")
      .select("*")
      .eq("challenge_date", today)
      .eq("is_active", true)
      .single();

    if (existingChallenge) {
      console.log("Today's challenge already exists");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Challenge already exists",
          challenge: existingChallenge 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark yesterday's challenge as inactive
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await supabase
      .from("daily_combo_challenges")
      .update({ is_active: false })
      .eq("challenge_date", yesterdayStr);

    // Get all active challenge templates
    const { data: challenges } = await supabase
      .from("combo_challenges")
      .select("*")
      .eq("is_active", true);

    if (!challenges || challenges.length === 0) {
      throw new Error("No active challenges found");
    }

    // Select a random challenge with weighted difficulty
    const difficulties = {
      easy: 0.35,    // 35% chance
      medium: 0.35,  // 35% chance
      hard: 0.20,    // 20% chance
      extreme: 0.10  // 10% chance
    };

    const random = Math.random();
    let selectedDifficulty = 'easy';
    let cumulative = 0;

    for (const [difficulty, weight] of Object.entries(difficulties)) {
      cumulative += weight;
      if (random <= cumulative) {
        selectedDifficulty = difficulty;
        break;
      }
    }

    const filteredChallenges = challenges.filter(c => c.difficulty === selectedDifficulty);
    const selectedChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)] 
      || challenges[Math.floor(Math.random() * challenges.length)];

    // Create today's challenge
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    expiresAt.setHours(0, 0, 0, 0);

    const { data: newChallenge, error: insertError } = await supabase
      .from("daily_combo_challenges")
      .insert({
        challenge_id: selectedChallenge.id,
        challenge_date: today,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`New challenge created: ${selectedChallenge.title}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Daily challenge rotated successfully",
        challenge: {
          ...newChallenge,
          details: selectedChallenge
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error rotating daily challenge:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
