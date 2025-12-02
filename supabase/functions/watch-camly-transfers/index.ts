import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';
import { ethers } from 'https://esm.sh/ethers@6.15.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CAMLY Contract on BSC
const CAMLY_CONTRACT = '0x0910320181889fefde0bb1ca63962b0a8882e413';
const CAMLY_DECIMALS = 3;
const BSC_RPC = 'https://bsc-dataseed1.binance.org';

// ERC20 Transfer event signature
const TRANSFER_EVENT_SIGNATURE = 'Transfer(address,address,uint256)';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting CAMLY transfer watcher...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize ethers provider
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const contract = new ethers.Contract(
      CAMLY_CONTRACT,
      [
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'function decimals() view returns (uint8)'
      ],
      provider
    );

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    console.log('📊 Current block:', currentBlock);

    // Get last processed block from database (or start from 100 blocks ago)
    const { data: lastProcessed } = await supabase
      .from('wallet_transactions')
      .select('created_at')
      .eq('token_type', 'CAMLY')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Start from 100 blocks ago if no history, or continue from last check
    const fromBlock = lastProcessed 
      ? currentBlock - 100  // Check last 100 blocks for safety
      : currentBlock - 1000; // First run: check last 1000 blocks

    console.log(`🔎 Scanning blocks ${fromBlock} to ${currentBlock}...`);

    // Get all wallet addresses from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, wallet_address')
      .not('wallet_address', 'is', null);

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    const walletAddresses = new Set(
      profiles?.map(p => p.wallet_address?.toLowerCase()).filter(Boolean) || []
    );
    
    console.log(`👥 Monitoring ${walletAddresses.size} wallet addresses`);

    if (walletAddresses.size === 0) {
      console.log('⚠️ No wallet addresses to monitor');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No wallets to monitor',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query Transfer events
    const transferFilter = contract.filters.Transfer();
    const events = await contract.queryFilter(transferFilter, fromBlock, currentBlock);
    
    console.log(`📨 Found ${events.length} total Transfer events`);

    let processedCount = 0;
    const newTransactions = [];

    // Process each transfer event
    for (const event of events) {
      // Type guard to ensure we have an EventLog with args
      if (!('args' in event) || !event.args) {
        continue;
      }

      const from = event.args[0]?.toLowerCase();
      const to = event.args[1]?.toLowerCase();
      const value = event.args[2];

      // Check if recipient is one of our users
      if (!to || !walletAddresses.has(to)) {
        continue;
      }

      // Find the user profile
      const recipientProfile = profiles?.find(
        p => p.wallet_address?.toLowerCase() === to
      );

      if (!recipientProfile) {
        continue;
      }

      // Get transaction hash and details
      const txHash = event.transactionHash;
      
      // Check if we already recorded this transaction
      const { data: existing } = await supabase
        .from('wallet_transactions')
        .select('id')
        .eq('transaction_hash', txHash)
        .eq('to_user_id', recipientProfile.id)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️ Transaction ${txHash} already recorded`);
        continue;
      }

      // Get transaction timestamp
      const block = await provider.getBlock(event.blockNumber);
      const timestamp = block?.timestamp 
        ? new Date(block.timestamp * 1000).toISOString()
        : new Date().toISOString();

      // Format amount
      const amount = parseFloat(ethers.formatUnits(value, CAMLY_DECIMALS));

      console.log(`💰 New incoming transfer detected:`, {
        to: recipientProfile.id,
        amount,
        txHash
      });

      newTransactions.push({
        from_user_id: null, // External transfer
        to_user_id: recipientProfile.id,
        amount,
        token_type: 'CAMLY',
        transaction_type: 'transfer',
        status: 'completed',
        transaction_hash: txHash,
        notes: `Received from ${from.slice(0, 10)}...`,
        created_at: timestamp
      });

      processedCount++;
    }

    // Batch insert new transactions
    if (newTransactions.length > 0) {
      console.log(`💾 Inserting ${newTransactions.length} new transactions...`);
      
      const { error: insertError } = await supabase
        .from('wallet_transactions')
        .insert(newTransactions);

      if (insertError) {
        console.error('❌ Error inserting transactions:', insertError);
        throw insertError;
      }

      console.log('✅ Successfully inserted new transactions!');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        scannedBlocks: currentBlock - fromBlock,
        totalEvents: events.length,
        newTransactions: processedCount,
        message: `Processed ${processedCount} new incoming transfers` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in CAMLY watcher:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
