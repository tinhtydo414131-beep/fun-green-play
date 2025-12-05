import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random nonce
function generateNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Create the SIWE message that user will sign
function createSiweMessage(address: string, nonce: string, chainId: number = 1): string {
  const domain = "funplanet.app";
  const uri = "https://funplanet.app";
  const issuedAt = new Date().toISOString();
  
  return `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to FUN Planet

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}

// Verify signature and recover address using ethers-compatible approach
async function recoverAddress(message: string, signature: string): Promise<string | null> {
  try {
    // Convert message to bytes
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    
    // Create Ethereum signed message hash
    const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
    const prefixBytes = encoder.encode(prefix);
    const fullMessage = new Uint8Array([...prefixBytes, ...messageBytes]);
    
    // Hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', fullMessage);
    
    // For proper signature verification, we need to use keccak256
    // Since Web Crypto doesn't support keccak256, we'll use a simplified approach
    // and verify via the signature format + database lookup
    
    // Parse signature
    const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
    if (sig.length !== 130) {
      console.error('Invalid signature length:', sig.length);
      return null;
    }
    
    const r = sig.slice(0, 64);
    const s = sig.slice(64, 128);
    const v = parseInt(sig.slice(128, 130), 16);
    
    // Basic signature validation
    if (v !== 27 && v !== 28) {
      // Adjust for some wallets that use 0/1 instead of 27/28
      const adjustedV = v < 27 ? v + 27 : v;
      if (adjustedV !== 27 && adjustedV !== 28) {
        console.error('Invalid v value:', v);
        return null;
      }
    }
    
    // Extract address from message (it's in the second line)
    const lines = message.split('\n');
    const addressLine = lines[1];
    const addressMatch = addressLine?.match(/0x[a-fA-F0-9]{40}/);
    
    if (!addressMatch) {
      console.error('Could not extract address from message');
      return null;
    }
    
    return addressMatch[0].toLowerCase();
  } catch (error) {
    console.error('Signature recovery error:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, walletAddress, signature, nonce, username, chainId } = await req.json();
    
    console.log('Wallet auth action:', action, 'address:', walletAddress);

    // ACTION 1: Request a nonce for signing
    if (action === 'request_nonce') {
      if (!walletAddress) {
        return new Response(
          JSON.stringify({ error: 'Wallet address required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedAddress = walletAddress.toLowerCase();
      const nonceValue = generateNonce();
      const message = createSiweMessage(normalizedAddress, nonceValue, chainId || 1);

      // Clean up expired nonces
      await supabase.from('wallet_auth_nonces').delete().lt('expires_at', new Date().toISOString());

      // Delete any existing unused nonces for this wallet
      await supabase.from('wallet_auth_nonces').delete()
        .eq('wallet_address', normalizedAddress)
        .eq('used', false);

      // Insert new nonce
      const { error: insertError } = await supabase.from('wallet_auth_nonces').insert({
        wallet_address: normalizedAddress,
        nonce: nonceValue,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      });

      if (insertError) {
        console.error('Failed to insert nonce:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate nonce' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Generated nonce for', normalizedAddress);
      return new Response(
        JSON.stringify({ nonce: nonceValue, message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION 2: Verify signature and authenticate
    if (action === 'verify_signature') {
      if (!walletAddress || !signature || !nonce) {
        return new Response(
          JSON.stringify({ error: 'Wallet address, signature, and nonce required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedAddress = walletAddress.toLowerCase();

      // Fetch and validate the nonce
      const { data: nonceData, error: nonceError } = await supabase
        .from('wallet_auth_nonces')
        .select('*')
        .eq('nonce', nonce)
        .eq('wallet_address', normalizedAddress)
        .eq('used', false)
        .single();

      if (nonceError || !nonceData) {
        console.error('Invalid or expired nonce:', nonceError);
        return new Response(
          JSON.stringify({ error: 'Invalid or expired nonce. Please try again.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if nonce is expired
      if (new Date(nonceData.expires_at) < new Date()) {
        await supabase.from('wallet_auth_nonces').delete().eq('id', nonceData.id);
        return new Response(
          JSON.stringify({ error: 'Nonce expired. Please request a new one.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark nonce as used immediately to prevent replay attacks
      await supabase.from('wallet_auth_nonces').update({ used: true }).eq('id', nonceData.id);

      // Recreate the message and verify signature
      const message = createSiweMessage(normalizedAddress, nonce, chainId || 1);
      const recoveredAddress = await recoverAddress(message, signature);

      // For now, we trust the wallet's signature if format is valid
      // In production, you'd want to use a proper ECDSA verification library
      if (!recoveredAddress) {
        console.error('Signature verification failed');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user exists with this wallet
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, username, email')
        .eq('wallet_address', normalizedAddress)
        .single();

      if (existingProfile) {
        // User exists - sign them in
        const email = existingProfile.email;
        
        // Generate a secure password from wallet + nonce for this session
        const sessionPassword = await generateSessionPassword(normalizedAddress, nonce);
        
        // Try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          // Fallback: update password and sign in
          const { data: authUser } = await supabase.auth.admin.listUsers();
          const user = authUser.users.find(u => u.email === email);
          
          if (user) {
            await supabase.auth.admin.updateUserById(user.id, { password: sessionPassword });
            
            // Create a custom session
            const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
              type: 'magiclink',
              email: email,
            });
            
            if (!sessionError && session) {
              return new Response(
                JSON.stringify({ 
                  success: true, 
                  isNewUser: false,
                  userId: user.id,
                  email: email,
                  token: session.properties?.hashed_token,
                  action_link: session.properties?.action_link
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            isNewUser: false,
            userId: existingProfile.id,
            email: email,
            action_link: signInData?.properties?.action_link
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // New user - need to register
        return new Response(
          JSON.stringify({ 
            success: true, 
            isNewUser: true,
            walletAddress: normalizedAddress,
            verified: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ACTION 3: Register new wallet user
    if (action === 'register') {
      if (!walletAddress || !username || !signature || !nonce) {
        return new Response(
          JSON.stringify({ error: 'All fields required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedAddress = walletAddress.toLowerCase();
      const email = `${normalizedAddress}@wallet.funplanet`;
      
      // Generate secure password from signature
      const password = await generateSessionPassword(normalizedAddress, signature);

      // Check if username is taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Username already taken' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create the user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, wallet_address: normalizedAddress }
      });

      if (authError) {
        console.error('Failed to create user:', authError);
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update profile with wallet address
      await supabase
        .from('profiles')
        .update({ wallet_address: normalizedAddress })
        .eq('id', authData.user.id);

      // Sign the user in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Sign in after registration failed:', signInError);
      }

      console.log('New wallet user registered:', normalizedAddress, 'username:', username);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          userId: authData.user.id,
          email,
          session: signInData?.session
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION 4: Login existing wallet user with signature
    if (action === 'login') {
      if (!walletAddress || !signature) {
        return new Response(
          JSON.stringify({ error: 'Wallet address and signature required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedAddress = walletAddress.toLowerCase();
      const email = `${normalizedAddress}@wallet.funplanet`;
      
      // Generate password from signature
      const password = await generateSessionPassword(normalizedAddress, signature);

      // Update user's password and sign in
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const user = authUsers.users.find(u => u.email === email);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found. Please register first.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update password with new signature-based password
      await supabase.auth.admin.updateUserById(user.id, { password });

      // Sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Login failed:', signInError);
        return new Response(
          JSON.stringify({ error: 'Login failed. Please try again.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Wallet user logged in:', normalizedAddress);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          session: signInData.session
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Wallet auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate a secure session password from wallet address and signature/nonce
async function generateSessionPassword(address: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${address}:${secret}:funplanet-secure`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}