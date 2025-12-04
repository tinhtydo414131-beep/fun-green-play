import { motion } from 'framer-motion';
import { Copy, Users, Coins, Gift, Share2, CheckCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReferral } from '@/hooks/useReferral';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ReferralTierProgress } from './ReferralTierProgress';
import { TierAchievementModal } from './TierAchievementModal';
import { getCurrentTier, getNextTier, REFERRAL_TIERS, ReferralTier } from '@/utils/referralTiers';
import { useNavigate } from 'react-router-dom';

const ReferralCard = () => {
  const navigate = useNavigate();
  const {
    referralCode,
    totalReferrals,
    referralEarnings,
    isLoading,
    copyReferralLink,
    getReferralLink,
    REFERRAL_REWARD_FOR_REFERRER,
    newTierAchieved,
    clearNewTierAchieved,
  } = useReferral();
  
  const [copied, setCopied] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

  // Show modal when new tier is achieved
  useEffect(() => {
    if (newTierAchieved) {
      setShowTierModal(true);
    }
  }, [newTierAchieved]);

  const handleCloseTierModal = () => {
    setShowTierModal(false);
    clearNewTierAchieved();
  };

  const handleCopy = async () => {
    await copyReferralLink();
    setCopied(true);
    
    // Trigger mini confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const link = getReferralLink();
    if (!link) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mời bạn chơi Fun Planet!',
          text: `Tham gia Fun Planet với mình và nhận 50.000 Camly miễn phí! 🎮🎁`,
          url: link,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const currentTier = getCurrentTier(totalReferrals);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-indigo-950/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Gift className="w-5 h-5" />
                Mời bạn bè
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/camly-leaderboard')}
                className="text-xs"
              >
                <Trophy className="w-4 h-4 mr-1" />
                Bảng xếp hạng
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tier Progress */}
            <ReferralTierProgress 
              totalReferrals={totalReferrals} 
              referralEarnings={referralEarnings}
            />

            {/* Referral Code Display */}
            <div className="p-4 rounded-xl bg-white/70 dark:bg-black/30 border border-purple-200 dark:border-purple-700">
              <p className="text-xs text-muted-foreground mb-1">Mã mời của bạn</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold tracking-widest text-purple-600 dark:text-purple-400">
                  {referralCode || '--------'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="hover:bg-purple-100 dark:hover:bg-purple-900"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-purple-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 border border-blue-200 dark:border-blue-700"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-700 dark:text-blue-300">Đã mời</span>
                </div>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  {totalReferrals}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 border border-amber-200 dark:border-amber-700"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">Kiếm được</span>
                </div>
                <p className="text-xl font-bold text-amber-800 dark:text-amber-200">
                  {referralEarnings.toLocaleString()}
                </p>
              </motion.div>
            </div>

            {/* Reward Info */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700">
              <p className="text-xs text-green-700 dark:text-green-300 text-center">
                🎁 Mỗi bạn mời thành công = <span className="font-bold">+{REFERRAL_REWARD_FOR_REFERRER.toLocaleString()} Camly</span>
              </p>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 border-purple-300 hover:bg-purple-100 dark:border-purple-700 dark:hover:bg-purple-900"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tier Achievement Modal */}
      <TierAchievementModal
        tier={newTierAchieved}
        isOpen={showTierModal}
        onClose={handleCloseTierModal}
      />
    </>
  );
};

export default ReferralCard;
