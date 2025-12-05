import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateBalanceRequest {
  user_id: string;
  amount: number;
  operation: 'add' | 'subtract' | 'set';
  reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the request has valid authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Invalid token:', authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: UpdateBalanceRequest = await req.json();
    const { user_id, amount, operation, reason } = body;

    // Validate inputs
    if (!user_id || amount === undefined || !operation) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!['add', 'subtract', 'set'].includes(operation)) {
      return new Response(
        JSON.stringify({ error: "Invalid operation" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof amount !== 'number' || amount < 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Security check: User can only update their own balance (unless admin)
    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (user_id !== user.id && !isAdmin) {
      console.error('User attempted to modify another user\'s balance');
      return new Response(
        JSON.stringify({ error: "Forbidden: Cannot modify another user's balance" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the secure database function
    const { data: newBalance, error: updateError } = await supabase.rpc('update_wallet_balance', {
      p_user_id: user_id,
      p_amount: amount,
      p_operation: operation
    });

    if (updateError) {
      console.error('Failed to update balance:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update balance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the transaction
    await supabase.from('wallet_transactions').insert({
      to_user_id: operation === 'subtract' ? null : user_id,
      from_user_id: operation === 'subtract' ? user_id : null,
      amount: amount,
      token_type: 'CAMLY',
      transaction_type: operation === 'add' ? 'reward' : operation === 'subtract' ? 'withdrawal' : 'adjustment',
      status: 'completed',
      notes: reason || `Balance ${operation}: ${amount}`
    });

    console.log(`Balance updated for user ${user_id}: ${operation} ${amount}, new balance: ${newBalance}`);

    return new Response(
      JSON.stringify({ success: true, newBalance }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Update balance error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
