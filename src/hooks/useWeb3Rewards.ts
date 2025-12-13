import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const CAMLY_CONTRACT_ADDRESS = '0x0910320181889feFDE0BB1Ca63962b0A8882e413';
const POINTS_TO_CAMLY_RATIO = 100; // 1 point = 100 Camly

// Reward amounts
const REWARDS = {
  FIRST_WALLET_CONNECT: 50000,
  FIRST_GAME_PLAY: 10000,
  DAILY_CHECKIN: 5000,
};

// Streak bonus multipliers
const STREAK_BONUSES: Record<number, number> = {
  3: 1.5,   // 3-day streak = 1.5x
  7: 2.0,   // 7-day streak = 2x
  14: 2.5,  // 14-day streak = 2.5x
  30: 3.0,  // 30-day streak = 3x
};

// ERC20 ABI for transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

interface Web3RewardsState {
  camlyBalance: number;
  walletAddress: string | null;
  isConnected: boolean;
  isLoading: boolean;
  firstWalletClaimed: boolean;
  firstGameClaimed: boolean;
  lastDailyCheckin: string | null;
  dailyStreak: number;
}

// Calculate streak bonus multiplier
const getStreakMultiplier = (streak: number): number => {
  let multiplier = 1;
  for (const [threshold, bonus] of Object.entries(STREAK_BONUSES)) {
    if (streak >= parseInt(threshold)) {
      multiplier = bonus;
    }
  }
  return multiplier;
};

export const useWeb3Rewards = () => {
  const { user } = useAuth();
  const [state, setState] = useState<Web3RewardsState>({
    camlyBalance: 0,
    walletAddress: null,
    isConnected: false,
    isLoading: true,
    firstWalletClaimed: false,
    firstGameClaimed: false,
    lastDailyCheckin: null,
    dailyStreak: 0,
  });
  const [pendingReward, setPendingReward] = useState<{
    amount: number;
    type: string;
    description: string;
  } | null>(null);

  // Load user rewards from database
  const loadRewards = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('web3_rewards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setState(prev => ({
          ...prev,
          camlyBalance: Number(data.camly_balance) || 0,
          walletAddress: data.wallet_address,
          isConnected: !!data.wallet_address,
          firstWalletClaimed: data.first_wallet_claimed,
          firstGameClaimed: data.first_game_claimed,
          lastDailyCheckin: data.last_daily_checkin,
          dailyStreak: data.daily_streak || 0,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  // Connect wallet using MetaMask
  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error('Please login first');
      return null;
    }

    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed');
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      // Check if this is first wallet connection
      const { data: existing } = await supabase
        .from('web3_rewards')
        .select('first_wallet_claimed')
        .eq('user_id', user.id)
        .maybeSingle();

      const isFirstConnect = !existing;

      // Upsert rewards record
      const { error } = await supabase
        .from('web3_rewards')
        .upsert({
          user_id: user.id,
          wallet_address: address,
          first_wallet_claimed: existing?.first_wallet_claimed ?? false,
          camly_balance: isFirstConnect ? REWARDS.FIRST_WALLET_CONNECT : (existing ? undefined : 0),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Award first connection bonus
      if (isFirstConnect) {
        await supabase.from('web3_reward_transactions').insert({
          user_id: user.id,
          amount: REWARDS.FIRST_WALLET_CONNECT,
          reward_type: 'first_wallet_connect',
          description: 'First wallet connection bonus',
        });

        await supabase
          .from('web3_rewards')
          .update({ first_wallet_claimed: true })
          .eq('user_id', user.id);

        setPendingReward({
          amount: REWARDS.FIRST_WALLET_CONNECT,
          type: 'first_wallet_connect',
          description: 'First Wallet Connection Bonus!',
        });

        // Process referral bonus for referrer (if user was referred)
        const storedCode = localStorage.getItem('fun_planet_referral_code');
        if (storedCode) {
          try {
            // Check if user already has a referral record
            const { data: existingReferral } = await supabase
              .from('referrals')
              .select('id')
              .eq('referred_id', user.id)
              .maybeSingle();

            if (!existingReferral) {
              // Find the referrer
              const { data: referrer } = await supabase
                .from('profiles')
                .select('id, username')
                .eq('referral_code', storedCode.toUpperCase())
                .maybeSingle();

              if (referrer && referrer.id !== user.id) {
                const REFERRAL_REWARD = 25000;

                // Create referral record
                await supabase
                  .from('referrals')
                  .insert({
                    referrer_id: referrer.id,
                    referred_id: user.id,
                    referral_code: storedCode.toUpperCase(),
                    reward_paid: true,
                    reward_amount: REFERRAL_REWARD,
                    completed_at: new Date().toISOString(),
                  });

                // Add reward to referrer's balance
                const { data: referrerRewards } = await supabase
                  .from('web3_rewards')
                  .select('camly_balance, total_referrals, referral_earnings')
                  .eq('user_id', referrer.id)
                  .maybeSingle();

                if (referrerRewards) {
                  await supabase
                    .from('web3_rewards')
                    .update({
                      camly_balance: Number(referrerRewards.camly_balance) + REFERRAL_REWARD,
                      total_referrals: (referrerRewards.total_referrals || 0) + 1,
                      referral_earnings: Number(referrerRewards.referral_earnings || 0) + REFERRAL_REWARD,
                    })
                    .eq('user_id', referrer.id);
                } else {
                  await supabase
                    .from('web3_rewards')
                    .insert({
                      user_id: referrer.id,
                      camly_balance: REFERRAL_REWARD,
                      total_referrals: 1,
                      referral_earnings: REFERRAL_REWARD,
                    });
                }

                // Record transaction for referrer
                await supabase.from('web3_reward_transactions').insert({
                  user_id: referrer.id,
                  amount: REFERRAL_REWARD,
                  reward_type: 'referral_bonus',
                  description: `Mời bạn ${user.email?.split('@')[0] || 'mới'} thành công`,
                });

                localStorage.removeItem('fun_planet_referral_code');
                toast.success(`Bạn đã được ${referrer.username} mời thành công! 🎉`);
              }
            }
          } catch (refError) {
            console.error('Error processing referral:', refError);
          }
        }
      }

      setState(prev => ({
        ...prev,
        walletAddress: address,
        isConnected: true,
        camlyBalance: isFirstConnect ? REWARDS.FIRST_WALLET_CONNECT : prev.camlyBalance,
        firstWalletClaimed: true,
      }));

      return address;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
      return null;
    }
  }, [user]);

  // Claim first game play reward
  const claimFirstGameReward = useCallback(async () => {
    if (!user || state.firstGameClaimed) return false;

    try {
      // Check current state
      const { data: current } = await supabase
        .from('web3_rewards')
        .select('first_game_claimed, camly_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (current?.first_game_claimed) return false;

      const newBalance = (Number(current?.camly_balance) || 0) + REWARDS.FIRST_GAME_PLAY;

      await supabase
        .from('web3_rewards')
        .upsert({
          user_id: user.id,
          first_game_claimed: true,
          camly_balance: newBalance,
        }, { onConflict: 'user_id' });

      await supabase.from('web3_reward_transactions').insert({
        user_id: user.id,
        amount: REWARDS.FIRST_GAME_PLAY,
        reward_type: 'first_game_play',
        description: 'First game play bonus',
      });

      setState(prev => ({
        ...prev,
        camlyBalance: newBalance,
        firstGameClaimed: true,
      }));

      setPendingReward({
        amount: REWARDS.FIRST_GAME_PLAY,
        type: 'first_game_play',
        description: 'First Game Play Bonus!',
      });

      return true;
    } catch (error) {
      console.error('Error claiming first game reward:', error);
      return false;
    }
  }, [user, state.firstGameClaimed]);

  // Claim daily check-in reward
  const claimDailyCheckin = useCallback(async () => {
    if (!user) return false;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    try {
      const { data: current } = await supabase
        .from('web3_rewards')
        .select('last_daily_checkin, camly_balance, daily_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (current?.last_daily_checkin === today) {
        toast.info('Already claimed daily check-in today');
        return false;
      }

      // Calculate new streak
      let newStreak = 1;
      if (current?.last_daily_checkin === yesterday) {
        // Consecutive day - increase streak
        newStreak = (current.daily_streak || 0) + 1;
      }
      // If not yesterday, streak resets to 1

      // Calculate bonus with streak multiplier
      const multiplier = getStreakMultiplier(newStreak);
      const baseReward = REWARDS.DAILY_CHECKIN;
      const bonusReward = Math.floor(baseReward * multiplier);

      const newBalance = (Number(current?.camly_balance) || 0) + bonusReward;

      await supabase
        .from('web3_rewards')
        .upsert({
          user_id: user.id,
          last_daily_checkin: today,
          camly_balance: newBalance,
          daily_streak: newStreak,
        }, { onConflict: 'user_id' });

      const description = multiplier > 1 
        ? `Daily Check-in (${newStreak}-day streak, ${multiplier}x bonus!)` 
        : 'Daily check-in reward';

      await supabase.from('web3_reward_transactions').insert({
        user_id: user.id,
        amount: bonusReward,
        reward_type: 'daily_checkin',
        description,
      });

      setState(prev => ({
        ...prev,
        camlyBalance: newBalance,
        lastDailyCheckin: today,
        dailyStreak: newStreak,
      }));

      setPendingReward({
        amount: bonusReward,
        type: 'daily_checkin',
        description: multiplier > 1 
          ? `${newStreak}-Day Streak! (${multiplier}x Bonus)` 
          : 'Daily Check-in Reward!',
      });

      return true;
    } catch (error) {
      console.error('Error claiming daily checkin:', error);
      return false;
    }
  }, [user]);

  // Convert points to Camly
  const convertPointsToCamly = useCallback(async (points: number) => {
    if (!user || points <= 0) return false;

    const camlyAmount = points * POINTS_TO_CAMLY_RATIO;

    try {
      const { data: current } = await supabase
        .from('web3_rewards')
        .select('camly_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      const newBalance = (Number(current?.camly_balance) || 0) + camlyAmount;

      await supabase
        .from('web3_rewards')
        .upsert({
          user_id: user.id,
          camly_balance: newBalance,
        }, { onConflict: 'user_id' });

      await supabase.from('web3_reward_transactions').insert({
        user_id: user.id,
        amount: camlyAmount,
        reward_type: 'points_conversion',
        description: `Converted ${points} points to ${camlyAmount} Camly`,
      });

      setState(prev => ({
        ...prev,
        camlyBalance: newBalance,
      }));

      setPendingReward({
        amount: camlyAmount,
        type: 'points_conversion',
        description: `Converted ${points} points!`,
      });

      return true;
    } catch (error) {
      console.error('Error converting points:', error);
      return false;
    }
  }, [user]);

  // Claim Camly to wallet - signs a message to verify ownership then processes claim
  const claimToWallet = useCallback(async (amount: number): Promise<{ success: boolean; txHash?: string }> => {
    if (!user || !state.walletAddress || amount <= 0 || amount > state.camlyBalance) {
      toast.error('Invalid claim amount or wallet not connected');
      return { success: false };
    }

    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed');
      return { success: false };
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      // Verify the connected wallet matches the stored wallet
      if (signerAddress.toLowerCase() !== state.walletAddress.toLowerCase()) {
        toast.error('Please connect with the wallet you registered');
        return { success: false };
      }

      // Create a claim message for the user to sign
      const timestamp = Date.now();
      const claimMessage = `FUN Planet Claim Request\n\nAmount: ${amount.toLocaleString()} CAMLY\nWallet: ${signerAddress}\nTimestamp: ${timestamp}\n\nSign this message to confirm your claim request.`;
      
      // Request signature from user
      toast.info('Please sign the message in your wallet to confirm claim');
      const signature = await signer.signMessage(claimMessage);
      
      // Verify signature is valid
      const recoveredAddress = ethers.verifyMessage(claimMessage, signature);
      if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
        toast.error('Signature verification failed');
        return { success: false };
      }

      // Generate claim transaction hash from signature
      const claimTxHash = ethers.keccak256(ethers.toUtf8Bytes(signature + timestamp));

      const newBalance = state.camlyBalance - amount;

      const { data: current } = await supabase
        .from('web3_rewards')
        .select('total_claimed_to_wallet')
        .eq('user_id', user.id)
        .single();

      const newTotalClaimed = (Number(current?.total_claimed_to_wallet) || 0) + amount;

      // Update balance in database
      await supabase
        .from('web3_rewards')
        .update({
          camly_balance: newBalance,
          total_claimed_to_wallet: newTotalClaimed,
        })
        .eq('user_id', user.id);

      // Record the claim transaction with signature
      await supabase.from('web3_reward_transactions').insert({
        user_id: user.id,
        amount: -amount,
        reward_type: 'claim_to_wallet',
        description: `Claimed ${amount.toLocaleString()} CAMLY to ${signerAddress.slice(0, 6)}...${signerAddress.slice(-4)}`,
        transaction_hash: claimTxHash,
        claimed_to_wallet: true,
      });

      // Also record in camly_coin_transactions for wallet history
      await supabase.from('camly_coin_transactions').insert({
        user_id: user.id,
        amount: -amount,
        transaction_type: 'withdraw',
        description: `Claim to wallet ${signerAddress.slice(0, 6)}...${signerAddress.slice(-4)}`,
      });

      setState(prev => ({
        ...prev,
        camlyBalance: newBalance,
      }));

      toast.success(`Successfully claimed ${amount.toLocaleString()} CAMLY!`);
      return { success: true, txHash: claimTxHash };
    } catch (error: any) {
      console.error('Claim error:', error);
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        toast.error('Claim cancelled by user');
      } else {
        toast.error(error.message || 'Failed to claim to wallet');
      }
      return { success: false };
    }
  }, [user, state.walletAddress, state.camlyBalance]);

  // Check if daily checkin is available
  const canClaimDailyCheckin = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.lastDailyCheckin !== today;
  }, [state.lastDailyCheckin]);

  const clearPendingReward = useCallback(() => {
    setPendingReward(null);
  }, []);

  return {
    ...state,
    pendingReward,
    connectWallet,
    claimFirstGameReward,
    claimDailyCheckin,
    convertPointsToCamly,
    claimToWallet,
    canClaimDailyCheckin,
    clearPendingReward,
    loadRewards,
    REWARDS,
    STREAK_BONUSES,
    getStreakMultiplier,
    POINTS_TO_CAMLY_RATIO,
    CAMLY_CONTRACT_ADDRESS,
  };
};
