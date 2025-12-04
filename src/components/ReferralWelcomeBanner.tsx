import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ReferralWelcomeBannerProps {
  referrerUsername: string;
  isVisible: boolean;
  onDismiss: () => void;
  onConnectWallet: () => void;
}

const ReferralWelcomeBanner = ({
  referrerUsername,
  isVisible,
  onDismiss,
  onConnectWallet,
}: ReferralWelcomeBannerProps) => {
  useEffect(() => {
    if (isVisible) {
      // Trigger confetti on show
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      });
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/90 dark:via-yellow-950/90 dark:to-orange-950/90 p-6 shadow-2xl shadow-amber-500/20">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full blur-2xl"
              />
            </div>

            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors"
            >
              <X className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </button>

            {/* Content */}
            <div className="relative z-10">
              {/* Header with icon */}
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
                >
                  <Gift className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1">
                    Chào mừng bạn mới!
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-4 leading-relaxed">
                Bạn được <span className="font-bold text-amber-900 dark:text-amber-100">{referrerUsername}</span> mời chơi Fun Planet! 
                Kết nối ví ngay để nhận <span className="font-bold text-green-600 dark:text-green-400">50.000 Camly</span> + người mời cũng nhận quà nhé! 🎁
              </p>

              {/* CTA Button */}
              <Button
                onClick={onConnectWallet}
                className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02]"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Kết nối ví nhận thưởng
              </Button>

              {/* Bonus info */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎉
                </motion.span>
                <span>Tổng thưởng: 75.000 Camly cho cả hai!</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReferralWelcomeBanner;
