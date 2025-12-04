import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  getCurrentTier, 
  getNextTier, 
  getProgressToNextTier, 
  getEarnedBadges,
  ReferralTier 
} from '@/utils/referralTiers';
import { Star, TrendingUp } from 'lucide-react';

interface ReferralTierProgressProps {
  totalReferrals: number;
  referralEarnings: number;
  compact?: boolean;
}

export const ReferralTierProgress = ({ 
  totalReferrals, 
  referralEarnings,
  compact = false 
}: ReferralTierProgressProps) => {
  const currentTier = getCurrentTier(totalReferrals);
  const nextTier = getNextTier(totalReferrals);
  const progress = getProgressToNextTier(totalReferrals);
  const earnedBadges = getEarnedBadges(totalReferrals);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentTier.icon}</span>
            <span className={`font-bold ${currentTier.color}`}>{currentTier.name}</span>
          </div>
          {nextTier && (
            <span className="text-xs text-muted-foreground">
              {totalReferrals}/{nextTier.requiredReferrals} → {nextTier.icon}
            </span>
          )}
        </div>
        <Progress value={progress.percentage} className="h-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current tier display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl bg-gradient-to-r ${currentTier.bgGradient} relative overflow-hidden`}
      >
        {/* Decorative elements for legend tier */}
        {currentTier.id === 'legend' && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                animate={{
                  y: [-20, 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
                style={{ left: `${i * 10}%` }}
              >
                <Star className="w-4 h-4 text-white/40" />
              </motion.div>
            ))}
          </div>
        )}

        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            animate={{ 
              scale: currentTier.id === 'legend' ? [1, 1.1, 1] : 1,
              rotate: currentTier.id === 'legend' ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl"
          >
            {currentTier.icon}
          </motion.div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white drop-shadow-md">
              {currentTier.name}
            </h3>
            <p className="text-white/80 text-sm">
              {totalReferrals} bạn bè đã mời
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Tiến trình lên {nextTier.name}
            </span>
            <span className="font-medium">
              {totalReferrals}/{nextTier.requiredReferrals}
            </span>
          </div>
          <div className="relative">
            <Progress value={progress.percentage} className="h-3" />
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2 text-lg"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {nextTier.icon}
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Còn {nextTier.requiredReferrals - totalReferrals} bạn nữa để nhận{' '}
            <span className="font-semibold text-primary">
              +{nextTier.reward.toLocaleString()} Camly
            </span>
          </p>
        </div>
      )}

      {/* Referral earnings */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200 dark:border-amber-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-amber-700 dark:text-amber-300">
            💰 Tổng Camly từ mời bạn
          </span>
          <span className="font-bold text-amber-800 dark:text-amber-200">
            {referralEarnings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Huy hiệu đã đạt</h4>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant="secondary"
                  className={`bg-gradient-to-r ${badge.bgGradient} text-white border-0 px-3 py-1`}
                >
                  {badge.badge}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
