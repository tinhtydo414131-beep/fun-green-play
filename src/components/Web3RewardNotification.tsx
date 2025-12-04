import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Web3RewardNotificationProps {
  isOpen: boolean;
  amount: number;
  description: string;
  onClose: () => void;
}

export const Web3RewardNotification = ({
  isOpen,
  amount,
  description,
  onClose,
}: Web3RewardNotificationProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [displayedAmount, setDisplayedAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Play sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF8C00', '#FFB347'],
      });

      // Animate number counting
      const duration = 1500;
      const steps = 30;
      const increment = amount / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= amount) {
          setDisplayedAmount(amount);
          clearInterval(timer);
        } else {
          setDisplayedAmount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayedAmount(0);
    }
  }, [isOpen, amount]);

  return (
    <>
      <audio ref={audioRef} src="/audio/rich1-6.mp3" preload="auto" />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
          >
            {/* Outer glow container */}
            <div className="relative">
              {/* Animated glow ring */}
              <motion.div
                className="absolute -inset-1 rounded-2xl opacity-75 blur-sm"
                style={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FFD700)',
                  backgroundSize: '400% 400%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              
              {/* Inner glow ring */}
              <motion.div
                className="absolute -inset-0.5 rounded-2xl opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00, #FFD700)',
                  backgroundSize: '200% 200%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Main card - metallic orange-yellow */}
              <div
                className="relative rounded-2xl p-6 overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #FFB347 0%, #FF8C00 25%, #FFA500 50%, #FFD700 75%, #FFB347 100%)',
                  boxShadow: `
                    0 0 20px rgba(255, 165, 0, 0.5),
                    0 0 40px rgba(255, 140, 0, 0.3),
                    inset 0 1px 1px rgba(255, 255, 255, 0.4),
                    inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                  `,
                }}
              >
                {/* Metallic shine effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 55%, transparent 60%)',
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'easeInOut',
                  }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  {/* Animated coin icon */}
                  <motion.div
                    className="relative"
                    animate={{
                      rotateY: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Coins className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                    
                    {/* Sparkle effects */}
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-200" />
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-1 -left-2"
                      animate={{ scale: [1, 0.8, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-100" />
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    🎉 Reward Received! 🎉
                  </h3>

                  {/* Amount with counting animation */}
                  <motion.div
                    className="text-4xl font-extrabold text-white drop-shadow-lg"
                    animate={{ scale: displayedAmount === amount ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    +{displayedAmount.toLocaleString()} CAMLY
                  </motion.div>

                  {/* Description */}
                  <p className="text-white/90 font-medium text-lg">
                    {description}
                  </p>

                  {/* Decorative coins */}
                  <div className="flex gap-2 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-200 to-orange-400 shadow-md"
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
