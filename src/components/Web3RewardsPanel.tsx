import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Coins, Gift, Calendar, ArrowUpRight, Loader2, History, Flame, Trophy } from 'lucide-react';
import { useWeb3Rewards } from '@/hooks/useWeb3Rewards';
import { WalletConnectModal } from './WalletConnectModal';
import { ClaimRewardsModal } from './ClaimRewardsModal';
import { Web3RewardNotification } from './Web3RewardNotification';
import { motion } from 'framer-motion';

export const Web3RewardsPanel = () => {
  const navigate = useNavigate();
  const {
    camlyBalance,
    walletAddress,
    isConnected,
    isLoading,
    lastDailyCheckin,
    dailyStreak,
    pendingReward,
    connectWallet,
    claimDailyCheckin,
    claimToWallet,
    canClaimDailyCheckin,
    clearPendingReward,
    REWARDS,
    STREAK_BONUSES,
    getStreakMultiplier,
    CAMLY_CONTRACT_ADDRESS,
  } = useWeb3Rewards();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleDailyCheckin = async () => {
    setIsCheckingIn(true);
    try {
      await claimDailyCheckin();
    } finally {
      setIsCheckingIn(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            Web3 Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance Display */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <p className="text-sm text-muted-foreground mb-1">Camly Balance</p>
            <motion.p
              key={camlyBalance}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"
            >
              {camlyBalance.toLocaleString()}
            </motion.p>
          </div>

          {/* Wallet Connection */}
          {isConnected && walletAddress ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Wallet className="w-4 h-4 text-green-500" />
              <span className="text-sm font-mono">{shortenAddress(walletAddress)}</span>
              <span className="ml-auto text-xs text-green-500 font-medium">Connected</span>
            </div>
          ) : (
            <Button
              onClick={() => setShowConnectModal(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                +{REWARDS.FIRST_WALLET_CONNECT.toLocaleString()}
              </span>
            </Button>
          )}

          {/* Daily Check-in with Streak */}
          <div className="space-y-2">
            {dailyStreak > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">{dailyStreak}-day streak</span>
                {getStreakMultiplier(dailyStreak) > 1 && (
                  <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">
                    {getStreakMultiplier(dailyStreak)}x bonus
                  </span>
                )}
              </div>
            )}
            <Button
              onClick={handleDailyCheckin}
              disabled={!canClaimDailyCheckin() || isCheckingIn}
              variant="outline"
              className="w-full border-yellow-500/30 hover:bg-yellow-500/10"
            >
              {isCheckingIn ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4 mr-2" />
              )}
              Daily Check-in
              <span className="ml-auto text-xs text-yellow-500">
                +{Math.floor(REWARDS.DAILY_CHECKIN * getStreakMultiplier(dailyStreak + 1)).toLocaleString()} CAMLY
              </span>
            </Button>
          </div>

          {/* Claim to Wallet */}
          {isConnected && camlyBalance > 0 && (
            <Button
              onClick={() => setShowClaimModal(true)}
              variant="outline"
              className="w-full border-green-500/30 hover:bg-green-500/10"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Claim to Wallet
            </Button>
          )}

          {/* Leaderboard */}
          <Button
            onClick={() => navigate('/camly-leaderboard')}
            variant="outline"
            className="w-full border-yellow-500/30 hover:bg-yellow-500/10"
          >
            <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
            View Leaderboard
          </Button>

          {/* View History */}
          <Button
            onClick={() => navigate('/rewards-history')}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <History className="w-4 h-4 mr-2" />
            View Transaction History
          </Button>

          {/* Reward Info */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
            <div className="flex justify-between">
              <span>First wallet connect:</span>
              <span className="text-yellow-500">+{REWARDS.FIRST_WALLET_CONNECT.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>First game play:</span>
              <span className="text-yellow-500">+{REWARDS.FIRST_GAME_PLAY.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Daily check-in:</span>
              <span className="text-yellow-500">+{REWARDS.DAILY_CHECKIN.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={connectWallet}
        isConnected={isConnected}
        walletAddress={walletAddress}
      />

      <ClaimRewardsModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        camlyBalance={camlyBalance}
        walletAddress={walletAddress}
        onClaim={claimToWallet}
        contractAddress={CAMLY_CONTRACT_ADDRESS}
      />

      {/* Reward Notification */}
      <Web3RewardNotification
        isOpen={!!pendingReward}
        amount={pendingReward?.amount || 0}
        description={pendingReward?.description || ''}
        onClose={clearPendingReward}
      />
    </>
  );
};
