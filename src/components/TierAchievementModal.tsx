import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { ReferralTier } from '@/utils/referralTiers';
import { Sparkles, Star, Gift } from 'lucide-react';

interface TierAchievementModalProps {
  tier: ReferralTier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TierAchievementModal = ({ tier, isOpen, onClose }: TierAchievementModalProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen && tier) {
      // Play celebration sound
      const audio = new Audio('https://media.funplanet.life/audio/coin-reward.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = tier.id === 'legend' 
        ? ['#9333ea', '#ec4899', '#f43f5e', '#fbbf24']
        : tier.id === 'diamond'
        ? ['#22d3ee', '#3b82f6', '#60a5fa']
        : tier.id === 'gold'
        ? ['#fbbf24', '#f59e0b', '#d97706']
        : ['#94a3b8', '#64748b', '#475569'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      setTimeout(() => setShowContent(true), 300);
    } else {
      setShowContent(false);
    }
  }, [isOpen, tier]);

  if (!tier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className={`relative rounded-3xl p-8 bg-gradient-to-br ${tier.bgGradient} overflow-hidden`}
            >
              {/* Sparkle effects */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white/60" />
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 text-center">
                {/* Big icon */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-8xl mb-4"
                >
                  {tier.icon}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-black text-white mb-2 drop-shadow-lg"
                >
                  Chúc mừng! 🎉
                </motion.h2>

                {/* Tier name */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl font-bold text-white/90 mb-4"
                >
                  Bạn đã đạt cấp <span className="text-white">{tier.name}</span>!
                </motion.div>

                {/* Reward */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gift className="w-6 h-6 text-white" />
                    <span className="text-white font-semibold">Phần thưởng</span>
                  </div>
                  <div className="text-3xl font-black text-white flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 text-yellow-300 animate-pulse" />
                    +{tier.reward.toLocaleString()} CAMLY
                    <Star className="w-6 h-6 text-yellow-300 animate-pulse" />
                  </div>
                </motion.div>

                {/* Badge earned */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-white/80 mb-6"
                >
                  Bạn đã nhận huy hiệu <span className="font-bold">{tier.badge}</span>
                </motion.div>

                {/* Close button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={onClose}
                    className="bg-white text-gray-900 hover:bg-white/90 font-bold px-8 py-3 rounded-full text-lg"
                  >
                    Tuyệt vời! ✨
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
