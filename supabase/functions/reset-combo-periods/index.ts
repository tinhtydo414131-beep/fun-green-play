import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const periodResetSchema = z.object({
  periodType: z.enum(['daily', 'weekly']).optional(),
});

type PeriodType = 'daily' | 'weekly';

const PRIZE_AMOUNTS: Record<PeriodType, number> = {
  daily: 100,
  weekly: 500,
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

    // Parse and validate input
    const body = await req.json().catch(() => ({}));
    const validationResult = periodResetSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Invalid input:", validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validationResult.error.errors 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { periodType } = validationResult.data;
    const now = new Date();
    
    console.log(`Starting reset for period type: ${periodType || 'both'}`);

    const periodsToReset: PeriodType[] = periodType ? [periodType] : ['daily', 'weekly'];
    const results = [];

    for (const type of periodsToReset) {
      // Check if it's time to reset this period
      const { data: activePeriod } = await supabase
        .from("combo_active_periods")
        .select("*")
        .eq("period_type", type)
        .eq("is_active", true)
        .single();

      if (!activePeriod || new Date(activePeriod.period_end) > now) {
        console.log(`Not time to reset ${type} period yet`);
        continue;
      }

      console.log(`Resetting ${type} period from ${activePeriod.period_start} to ${activePeriod.period_end}`);

      // Find the winner (highest combo in this period)
      const { data: topCombo } = await supabase
        .from("gold_miner_combos")
        .select("user_id, highest_combo, level_achieved, total_value")
        .gte("created_at", activePeriod.period_start)
        .lte("created_at", activePeriod.period_end)
        .order("highest_combo", { ascending: false })
        .limit(1)
        .single();

      if (topCombo && topCombo.highest_combo >= 10) {
        console.log(`Winner found for ${type}: User ${topCombo.user_id} with combo ${topCombo.highest_combo}`);

        // Create winner record
        const { error: winnerError } = await supabase
          .from("combo_period_winners")
          .insert({
            user_id: topCombo.user_id,
            period_type: type,
            period_start: activePeriod.period_start,
            period_end: activePeriod.period_end,
            highest_combo: topCombo.highest_combo,
            prize_amount: PRIZE_AMOUNTS[type],
            prize_type: 'tokens',
            claimed: false,
          });

        if (winnerError) {
          console.error(`Error creating winner record:`, winnerError);
        } else {
          // Update user's wallet balance with fallback
          const { data: profile } = await supabase
            .from("profiles")
            .select("wallet_balance")
            .eq("id", topCombo.user_id)
            .single();

          if (profile) {
            const { error: balanceError } = await supabase
              .from("profiles")
              .update({ 
                wallet_balance: (profile.wallet_balance || 0) + PRIZE_AMOUNTS[type] 
              })
              .eq("id", topCombo.user_id);

            if (balanceError) {
              console.error(`Error updating balance:`, balanceError);
            } else {
              console.log(`Prize of ${PRIZE_AMOUNTS[type]} tokens awarded to user ${topCombo.user_id}`);
            }
          }
        }
      } else {
        console.log(`No winner for ${type} period (minimum combo not reached)`);
      }

      // Mark old period as inactive
      await supabase
        .from("combo_active_periods")
        .update({ is_active: false })
        .eq("id", activePeriod.id);

      // Create new period
      const periodStart = type === 'daily' 
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
      
      const periodEnd = new Date(periodStart);
      if (type === 'daily') {
        periodEnd.setDate(periodEnd.getDate() + 1);
      } else {
        periodEnd.setDate(periodEnd.getDate() + 7);
      }

      const { error: newPeriodError } = await supabase
        .from("combo_active_periods")
        .insert({
          period_type: type,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          is_active: true,
        });

      if (newPeriodError) {
        console.error(`Error creating new ${type} period:`, newPeriodError);
      } else {
        console.log(`New ${type} period created: ${periodStart} to ${periodEnd}`);
      }

      results.push({
        period: type,
        winner: topCombo?.user_id || null,
        combo: topCombo?.highest_combo || 0,
        prize: topCombo && topCombo.highest_combo >= 10 ? PRIZE_AMOUNTS[type] : 0,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Period reset completed",
        results 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in reset-combo-periods:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
