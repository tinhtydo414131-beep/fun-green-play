export interface ReferralTier {
  id: 'none' | 'silver' | 'gold' | 'diamond' | 'legend';
  name: string;
  requiredReferrals: number;
  reward: number;
  color: string;
  bgGradient: string;
  icon: string;
  badge: string;
}

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    id: 'none',
    name: 'Beginner',
    requiredReferrals: 0,
    reward: 0,
    color: 'text-muted-foreground',
    bgGradient: 'from-gray-400 to-gray-500',
    icon: '🌱',
    badge: '',
  },
  {
    id: 'silver',
    name: 'Referral Silver',
    requiredReferrals: 5,
    reward: 50000,
    color: 'text-slate-400',
    bgGradient: 'from-slate-300 to-slate-500',
    icon: '🥈',
    badge: '🥈 Silver',
  },
  {
    id: 'gold',
    name: 'Referral Gold',
    requiredReferrals: 10,
    reward: 100000,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-400 to-amber-500',
    icon: '🥇',
    badge: '🥇 Gold',
  },
  {
    id: 'diamond',
    name: 'Referral Diamond',
    requiredReferrals: 20,
    reward: 200000,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-300 to-blue-500',
    icon: '💎',
    badge: '💎 Diamond',
  },
  {
    id: 'legend',
    name: 'Referral Legend',
    requiredReferrals: 50,
    reward: 500000,
    color: 'text-purple-500',
    bgGradient: 'from-purple-400 via-pink-500 to-red-500',
    icon: '👑',
    badge: '👑 Legend',
  },
];

export const getCurrentTier = (totalReferrals: number): ReferralTier => {
  for (let i = REFERRAL_TIERS.length - 1; i >= 0; i--) {
    if (totalReferrals >= REFERRAL_TIERS[i].requiredReferrals) {
      return REFERRAL_TIERS[i];
    }
  }
  return REFERRAL_TIERS[0];
};

export const getNextTier = (totalReferrals: number): ReferralTier | null => {
  const currentTier = getCurrentTier(totalReferrals);
  const currentIndex = REFERRAL_TIERS.findIndex(t => t.id === currentTier.id);
  if (currentIndex < REFERRAL_TIERS.length - 1) {
    return REFERRAL_TIERS[currentIndex + 1];
  }
  return null;
};

export const getEarnedBadges = (totalReferrals: number): ReferralTier[] => {
  return REFERRAL_TIERS.filter(
    tier => tier.id !== 'none' && totalReferrals >= tier.requiredReferrals
  );
};

export const getProgressToNextTier = (totalReferrals: number): { current: number; required: number; percentage: number } => {
  const nextTier = getNextTier(totalReferrals);
  if (!nextTier) {
    return { current: totalReferrals, required: totalReferrals, percentage: 100 };
  }
  
  const currentTier = getCurrentTier(totalReferrals);
  const progressInTier = totalReferrals - currentTier.requiredReferrals;
  const tierRange = nextTier.requiredReferrals - currentTier.requiredReferrals;
  const percentage = Math.min((progressInTier / tierRange) * 100, 100);
  
  return {
    current: totalReferrals,
    required: nextTier.requiredReferrals,
    percentage,
  };
};
