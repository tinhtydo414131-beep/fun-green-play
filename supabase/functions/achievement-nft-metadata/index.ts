import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AchievementMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const ACHIEVEMENT_TYPES = {
  games_master: {
    name: "Games Master",
    description: "Achieved by playing 100+ games on FUN Planet",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=gamesmaster&backgroundColor=6366f1",
    threshold: 100,
    trait: "total_plays"
  },
  social_butterfly: {
    name: "Social Butterfly",
    description: "Made 10+ friends on FUN Planet",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=socialbutterfly&backgroundColor=ec4899",
    threshold: 10,
    trait: "total_friends"
  },
  game_creator: {
    name: "Game Creator",
    description: "Uploaded and got 5+ games approved on FUN Planet",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=gamecreator&backgroundColor=22c55e",
    threshold: 5,
    trait: "approved_games"
  },
  wealthy_player: {
    name: "Wealthy Player",
    description: "Earned 10,000,000+ CAMLY on FUN Planet",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=wealthyplayer&backgroundColor=f59e0b",
    threshold: 10000000,
    trait: "wallet_balance"
  },
  top_10_player: {
    name: "Top 10 Legend",
    description: "Ranked in the Top 10 players on FUN Planet",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=top10legend&backgroundColor=eab308",
    threshold: 10,
    trait: "rank"
  },
  music_lover: {
    name: "Music Lover",
    description: "Uploaded 10+ music tracks to FUN Planet",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=musiclover&backgroundColor=8b5cf6",
    threshold: 10,
    trait: "music_uploaded"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tokenId = url.searchParams.get('tokenId');
    const achievementType = url.searchParams.get('type');
    const userId = url.searchParams.get('userId');

    console.log(`NFT Metadata request - tokenId: ${tokenId}, type: ${achievementType}, userId: ${userId}`);

    // If requesting specific token metadata (for NFT marketplaces)
    if (tokenId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Get minted NFT data
      const { data: nftData, error } = await supabase
        .from('minted_achievement_nfts')
        .select('*')
        .eq('token_id', tokenId)
        .single();

      if (error || !nftData) {
        console.error('NFT not found:', error);
        return new Response(
          JSON.stringify({ error: 'NFT not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const achievement = ACHIEVEMENT_TYPES[nftData.achievement_type as keyof typeof ACHIEVEMENT_TYPES];
      
      const metadata: AchievementMetadata = {
        name: `${achievement.name} #${tokenId}`,
        description: achievement.description,
        image: achievement.image,
        attributes: [
          { trait_type: "Achievement Type", value: achievement.name },
          { trait_type: "Platform", value: "FUN Planet" },
          { trait_type: "Minted Date", value: new Date(nftData.minted_at).toISOString().split('T')[0] },
          { trait_type: "Rarity", value: getRarity(nftData.achievement_type) }
        ]
      };

      return new Response(JSON.stringify(metadata), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get available achievements for a user
    if (userId && achievementType === 'available') {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get approved games count
      const { count: approvedGames } = await supabase
        .from('uploaded_games')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved');

      // Get user rank
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, wallet_balance')
        .order('wallet_balance', { ascending: false });

      const userRank = (allProfiles?.findIndex(p => p.id === userId) ?? -1) + 1;

      // Get already minted NFTs
      const { data: mintedNfts } = await supabase
        .from('minted_achievement_nfts')
        .select('achievement_type')
        .eq('user_id', userId);

      const mintedTypes = new Set(mintedNfts?.map(n => n.achievement_type) || []);

      // Check which achievements are available
      const userStats = {
        total_plays: profile.total_plays || 0,
        total_friends: profile.total_friends || 0,
        approved_games: approvedGames || 0,
        wallet_balance: profile.wallet_balance || 0,
        rank: userRank,
        music_uploaded: 0 // Would need to query music table
      };

      const availableAchievements = Object.entries(ACHIEVEMENT_TYPES).map(([key, achievement]) => {
        const currentValue = userStats[achievement.trait as keyof typeof userStats] || 0;
        const isEligible = achievement.trait === 'rank' 
          ? currentValue > 0 && currentValue <= achievement.threshold
          : currentValue >= achievement.threshold;
        const isMinted = mintedTypes.has(key);

        return {
          id: key,
          name: achievement.name,
          description: achievement.description,
          image: achievement.image,
          threshold: achievement.threshold,
          currentValue,
          isEligible,
          isMinted,
          canMint: isEligible && !isMinted,
          rarity: getRarity(key),
          trait: achievement.trait
        };
      });

      console.log(`Found ${availableAchievements.filter(a => a.canMint).length} mintable achievements for user`);

      return new Response(JSON.stringify({ achievements: availableAchievements }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Record a minted NFT
    if (req.method === 'POST') {
      let body;
      try {
        const text = await req.text();
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'Request body is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        body = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { userId, achievementType, tokenId, txHash, walletAddress } = body;

      console.log(`Recording minted NFT - user: ${userId}, type: ${achievementType}, tokenId: ${tokenId}`);

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data, error } = await supabase
        .from('minted_achievement_nfts')
        .insert({
          user_id: userId,
          achievement_type: achievementType,
          token_id: tokenId,
          tx_hash: txHash,
          wallet_address: walletAddress
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording minted NFT:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to record NFT' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({ success: true, nft: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getRarity(achievementType: string): string {
  const rarities: Record<string, string> = {
    games_master: 'Rare',
    social_butterfly: 'Common',
    game_creator: 'Epic',
    wealthy_player: 'Legendary',
    top_10_player: 'Legendary',
    music_lover: 'Rare'
  };
  return rarities[achievementType] || 'Common';
}