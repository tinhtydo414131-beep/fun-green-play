import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Star, Heart, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface JoyBotCelebrationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export const JoyBotCelebration = ({
  show,
  message = "Chúc mừng! Bạn thật tuyệt vời! 🎉",
  onComplete
}: JoyBotCelebrationProps) => {
  const [confettiPieces] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1,
      icon: [Star, Heart, Zap, Sparkles][Math.floor(Math.random() * 4)],
      color: ['text-yellow-400', 'text-pink-400', 'text-purple-400', 'text-blue-400'][Math.floor(Math.random() * 4)]
    }))
  );

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Confetti */}
          {confettiPieces.map((piece) => {
            const Icon = piece.icon;
            return (
              <motion.div
                key={piece.id}
                initial={{ y: -50, x: piece.x, opacity: 1, rotate: 0 }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: 360,
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: piece.duration,
                  delay: piece.delay,
                  ease: "easeIn"
                }}
                className="fixed z-[100] pointer-events-none"
              >
                <Icon className={`w-6 h-6 ${piece.color} fill-current`} />
              </motion.div>
            );
          })}

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 100 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 0.5,
                repeat: 3
              }}
              className="bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl max-w-md mx-4"
            >
              {/* JoyBot character celebrating */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 0.6,
                  repeat: 2
                }}
                className="text-8xl text-center mb-4"
              >
                🥳
              </motion.div>

              {/* Trophy and stars */}
              <div className="flex justify-center gap-4 mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                >
                  <Trophy className="w-12 h-12 text-yellow-300 fill-yellow-300" />
                </motion.div>
                <motion.div
                  animate={{
                    rotate: [0, -360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.2,
                    repeat: Infinity
                  }}
                >
                  <Star className="w-10 h-10 text-yellow-200 fill-yellow-200" />
                </motion.div>
              </div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white text-2xl font-bold text-center drop-shadow-lg"
              >
                {message}
              </motion.p>

              {/* Sparkle ring */}
              <motion.div
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 pointer-events-none"
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <motion.div
                    key={angle}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: angle / 360
                    }}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${angle}deg) translateY(-120px)`,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-200 fill-yellow-200" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />
        </>
      )}
    </AnimatePresence>
  );
};
