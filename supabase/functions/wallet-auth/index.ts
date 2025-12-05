import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ethers } from "https://esm.sh/ethers@6.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: 'request_nonce' | 'verify_signature' | 'login' | 'register';
  walletAddress: string;
  chainId?: number;
  signature?: string;
  nonce?: string;
  username?: string;
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

    const body: RequestBody = await req.json();
    const { action, walletAddress, chainId, signature, nonce, username } = body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return new Response(
        JSON.stringify({ error: "Invalid wallet address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // ACTION: Request a new nonce for SIWE
    if (action === "request_nonce") {
      // Generate a secure random nonce
      const nonceBytes = new Uint8Array(32);
      crypto.getRandomValues(nonceBytes);
      const newNonce = Array.from(nonceBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Store nonce with 5-minute expiration
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      // Clean up old expired nonces first
      await supabase.rpc('cleanup_expired_nonces');
      
      // Store the new nonce
      const { error: insertError } = await supabase
        .from('wallet_auth_nonces')
        .insert({
          wallet_address: normalizedAddress,
          nonce: newNonce,
          expires_at: expiresAt
        });

      if (insertError) {
        console.error('Failed to store nonce:', insertError);
        return new Response(
          JSON.stringify({ error: "Failed to generate authentication challenge" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create SIWE message
      const domain = new URL(Deno.env.get("SUPABASE_URL")!).hostname;
      const issuedAt = new Date().toISOString();
      const message = `${domain} wants you to sign in with your Ethereum account:
${walletAddress}

Sign this message to authenticate with FUN Planet. This request will not trigger a blockchain transaction or cost any gas fees.

URI: ${Deno.env.get("SUPABASE_URL")}
Version: 1
Chain ID: ${chainId || 1}
Nonce: ${newNonce}
Issued At: ${issuedAt}`;

      return new Response(
        JSON.stringify({ nonce: newNonce, message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: Verify signature
    if (action === "verify_signature") {
      if (!signature || !nonce) {
        return new Response(
          JSON.stringify({ error: "Missing signature or nonce" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the nonce exists and is not expired
      const { data: nonceData, error: nonceError } = await supabase
        .from('wallet_auth_nonces')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .eq('nonce', nonce)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (nonceError || !nonceData) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired nonce. Please try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Reconstruct the expected message
      const domain = new URL(Deno.env.get("SUPABASE_URL")!).hostname;
      const messageRegex = new RegExp(
        `${domain} wants you to sign in with your Ethereum account:\\n${walletAddress}[\\s\\S]*Nonce: ${nonce}[\\s\\S]*`
      );

      // Verify the signature
      let recoveredAddress: string;
      try {
        // Try to recover the signer from the signature
        // We need to reconstruct the message that was signed
        const expectedMessageBase = `${domain} wants you to sign in with your Ethereum account:
${walletAddress}

Sign this message to authenticate with FUN Planet. This request will not trigger a blockchain transaction or cost any gas fees.

URI: ${Deno.env.get("SUPABASE_URL")}
Version: 1
Chain ID: ${chainId || 1}
Nonce: ${nonce}`;
        
        // The actual message might have an Issued At timestamp, so we verify the signature against the address
        recoveredAddress = ethers.verifyMessage(expectedMessageBase, signature);
        
        // If that doesn't work, try with the full message pattern
        if (recoveredAddress.toLowerCase() !== normalizedAddress) {
          // Try different message formats (with various timestamps)
          const { data: nonceRecord } = await supabase
            .from('wallet_auth_nonces')
            .select('created_at')
            .eq('nonce', nonce)
            .single();
          
          if (nonceRecord) {
            const fullMessage = `${domain} wants you to sign in with your Ethereum account:
${walletAddress}

Sign this message to authenticate with FUN Planet. This request will not trigger a blockchain transaction or cost any gas fees.

URI: ${Deno.env.get("SUPABASE_URL")}
Version: 1
Chain ID: ${chainId || 1}
Nonce: ${nonce}
Issued At: ${nonceRecord.created_at}`;
            recoveredAddress = ethers.verifyMessage(fullMessage, signature);
          }
        }
      } catch (e) {
        console.error('Signature verification failed:', e);
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        return new Response(
          JSON.stringify({ error: "Signature does not match wallet address" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark nonce as used
      await supabase
        .from('wallet_auth_nonces')
        .update({ used: true })
        .eq('id', nonceData.id);

      // Check if user exists
      const walletEmail = `${normalizedAddress}@wallet.funplanet.app`;
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users?.some(u => u.email === walletEmail);

      return new Response(
        JSON.stringify({ 
          verified: true, 
          isNewUser: !userExists,
          walletAddress: normalizedAddress 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: Login existing user
    if (action === "login") {
      if (!signature) {
        return new Response(
          JSON.stringify({ error: "Missing signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const walletEmail = `${normalizedAddress}@wallet.funplanet.app`;
      
      // Generate a secure random password for this session
      const sessionPasswordBytes = new Uint8Array(32);
      crypto.getRandomValues(sessionPasswordBytes);
      const sessionPassword = Array.from(sessionPasswordBytes).map(b => b.toString(16).padStart(2, '0')).join('');

      // Update user's password to the session password
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === walletEmail);

      if (!existingUser) {
        return new Response(
          JSON.stringify({ error: "User not found. Please register first." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update password to session password
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password: sessionPassword
      });

      // Sign in with the new session password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: sessionPassword,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        return new Response(
          JSON.stringify({ error: "Authentication failed" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ session: signInData.session }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: Register new user
    if (action === "register") {
      if (!signature || !nonce || !username) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate username
      if (username.length < 3 || username.length > 20) {
        return new Response(
          JSON.stringify({ error: "Username must be 3-20 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if username is taken
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .single();

      if (existingProfile) {
        return new Response(
          JSON.stringify({ error: "Username already taken" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const walletEmail = `${normalizedAddress}@wallet.funplanet.app`;
      
      // Generate a secure random password
      const passwordBytes = new Uint8Array(32);
      crypto.getRandomValues(passwordBytes);
      const securePassword = Array.from(passwordBytes).map(b => b.toString(16).padStart(2, '0')).join('');

      // Create the user
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: walletEmail,
        password: securePassword,
        email_confirm: true,
        user_metadata: {
          username: username,
          wallet_address: normalizedAddress
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return new Response(
          JSON.stringify({ error: signUpError.message || "Failed to create account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update the profile with wallet address
      await supabase
        .from('profiles')
        .update({ wallet_address: normalizedAddress })
        .eq('id', signUpData.user.id);

      // Sign in the new user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: securePassword,
      });

      if (signInError) {
        return new Response(
          JSON.stringify({ error: "Account created but login failed. Please try logging in." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ session: signInData.session }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Wallet auth error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
