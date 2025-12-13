import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';
import { ethers } from 'https://esm.sh/ethers@6.15.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CAMLY Contract on BSC (deployed by FUN Planet)
const CAMLY_CONTRACT = '0xf9FfF1976FADEf8712319fa46881DB0E0FB2f828';
const CAMLY_DECIMALS = 18; // Standard ERC20 decimals

// Use multiple RPC endpoints with fallback (avoid rate limits)
const BSC_RPC_ENDPOINTS = [
  'https://bsc-dataseed.bnbchain.org',
  'https://bsc-dataseed1.bnbchain.org', 
  'https://bsc-dataseed2.bnbchain.org',
  'https://bsc-dataseed3.bnbchain.org',
  'https://bsc-dataseed4.bnbchain.org',
  'https://bsc.publicnode.com',
  'https://binance.llamarpc.com',
];

// Get a random RPC endpoint to distribute load
const getRandomRPC = () => BSC_RPC_ENDPOINTS[Math.floor(Math.random() * BSC_RPC_ENDPOINTS.length)];

// ERC20 Transfer event signature
const TRANSFER_EVENT_SIGNATURE = 'Transfer(address,address,uint256)';

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to retry with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.message?.includes('rate limit') || 
                          error.code === -32005 ||
                          error.message?.includes('429');
      
      if (isRateLimit && attempt < maxRetries - 1) {
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}...`);
        await delay(waitTime);
      } else if (attempt < maxRetries - 1) {
        await delay(baseDelay);
      }
    }
  }
  
  throw lastError;
}

// Create provider with fallback
async function createProviderWithFallback(): Promise<ethers.JsonRpcProvider> {
  const shuffledEndpoints = [...BSC_RPC_ENDPOINTS].sort(() => Math.random() - 0.5);
  
  for (const endpoint of shuffledEndpoints) {
    try {
      const provider = new ethers.JsonRpcProvider(endpoint);
      // Test the connection
      await provider.getBlockNumber();
      console.log(`✅ Connected to RPC: ${endpoint}`);
      return provider;
    } catch (error) {
      console.log(`❌ Failed to connect to ${endpoint}, trying next...`);
    }
  }
  
  throw new Error('All RPC endpoints failed');
}

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

    // Initialize ethers provider with fallback
    const provider = await createProviderWithFallback();
    const contract = new ethers.Contract(
      CAMLY_CONTRACT,
      [
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'function decimals() view returns (uint8)'
      ],
      provider
    );

    // Get current block number with retry
    const currentBlock = await withRetry(() => provider.getBlockNumber());
    console.log('📊 Current block:', currentBlock);

    // Get last processed block from database (or start from 50 blocks ago)
    const { data: lastProcessed } = await supabase
      .from('wallet_transactions')
      .select('created_at')
      .eq('token_type', 'CAMLY')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Reduce block range to avoid rate limits (smaller window)
    const BLOCK_RANGE = 20;
    const fromBlock = lastProcessed 
      ? currentBlock - BLOCK_RANGE
      : currentBlock - BLOCK_RANGE * 2; // First run: check last 40 blocks max

    console.log(`🔎 Scanning blocks ${fromBlock} to ${currentBlock} (${currentBlock - fromBlock} blocks)...`);

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

    // Query Transfer events with retry and smaller batches
    let events: any[] = [];
    const BATCH_SIZE = 5; // Query in very small batches to avoid RPC limits
    
    for (let startBlock = fromBlock; startBlock < currentBlock; startBlock += BATCH_SIZE) {
      const endBlock = Math.min(startBlock + BATCH_SIZE - 1, currentBlock);
      
      try {
        const batchEvents = await withRetry(async () => {
          const transferFilter = contract.filters.Transfer();
          return await contract.queryFilter(transferFilter, startBlock, endBlock);
        }, 3, 2000);
        
        events = events.concat(batchEvents);
        console.log(`📦 Fetched events from blocks ${startBlock}-${endBlock}: ${batchEvents.length} events`);
        
        // Small delay between batches to avoid rate limiting
        if (endBlock < currentBlock) {
          await delay(500);
        }
      } catch (error: any) {
        console.error(`⚠️ Error fetching blocks ${startBlock}-${endBlock}:`, error.message);
        // Continue with next batch instead of failing completely
        continue;
      }
    }
    
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

      // Get transaction timestamp with retry
      let timestamp = new Date().toISOString();
      try {
        const block = await withRetry(() => provider.getBlock(event.blockNumber), 2, 1000);
        if (block?.timestamp) {
          timestamp = new Date(block.timestamp * 1000).toISOString();
        }
      } catch (error) {
        console.log(`⚠️ Could not get block timestamp, using current time`);
      }

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
      
      // Small delay between processing to avoid rate limits on block fetches
      await delay(100);
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
