import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface RichNotificationProps {
  amount: number;
  token: string;
  tokenImage?: string;
  onComplete?: () => void;
}

export const RichNotification = ({ amount, token, tokenImage, onComplete }: RichNotificationProps) => {
  const [show, setShow] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
    }

    // Play the RICH audio
    audioRef.current = new Audio('/audio/rich1.mp3');
    audioRef.current.volume = 0.8;
    audioRef.current.play().catch(err => console.log('Audio play failed:', err));

    // Metallic gold confetti burst
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // Initial massive burst
    confetti({
      particleCount: 150,
      spread: 360,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B', '#F0E68C'],
      scalar: 1.5,
      gravity: 0.8,
      ticks: 300
    });

    // Continuous metallic gold confetti
    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      confetti({
        particleCount: 30,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B'],
        scalar: 1.3,
        gravity: 0.7,
        ticks: 200
      });
    }, 250);

    // Golden fireworks
    const fireworksInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(fireworksInterval);
        return;
      }

      confetti({
        particleCount: 80,
        startVelocity: 40,
        spread: 360,
        origin: {
          x: randomInRange(0.2, 0.8),
          y: randomInRange(0.2, 0.6)
        },
        colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520'],
        scalar: 1.4,
        ticks: 250
      });
    }, 600);

    const mainTimeout = setTimeout(() => {
      setShow(false);
      clearInterval(confettiInterval);
      clearInterval(fireworksInterval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(mainTimeout);
      clearInterval(confettiInterval);
      clearInterval(fireworksInterval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [amount, token, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="text-center z-10 relative flex flex-col items-center justify-center gap-6 px-4 max-w-full">
            {/* RICH Text with Metallic Gold Effect */}
            <motion.h1
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ 
                scale: [1, 1.15, 1],
                rotateY: 0
              }}
              transition={{ 
                scale: { 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                },
                rotateY: { duration: 0.8 }
              }}
              className="text-6xl md:text-9xl font-black relative"
              style={{
                background: 'linear-gradient(145deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FF8C00 75%, #FFD700 100%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 2s linear infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(255,215,0,0.8), 0 0 80px rgba(255,165,0,0.6), 0 10px 30px rgba(0,0,0,0.5)',
                WebkitTextStroke: '2px #B8860B',
                letterSpacing: '0.1em',
                filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.9))'
              }}
            >
              💰 RICH! 💰
            </motion.h1>

            {/* Amount display with metallic gold styling */}
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ 
                scale: [1, 1.12, 1],
                y: 0
              }}
              transition={{ 
                delay: 0.3,
                scale: { 
                  repeat: Infinity, 
                  duration: 1.3,
                  ease: "easeInOut"
                }
              }}
              className="flex items-center justify-center gap-4 text-5xl md:text-7xl font-black"
              style={{
                background: 'linear-gradient(145deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FF8C00 75%, #FFD700 100%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 2s linear infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255,215,0,0.7), 0 0 60px rgba(255,165,0,0.5)',
                WebkitTextStroke: '2px #B8860B',
                filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.8))'
              }}
            >
              <span>+{amount}</span>
              {tokenImage ? (
                <motion.img 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  src={tokenImage} 
                  alt={token} 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.9)) drop-shadow(0 0 40px rgba(255,165,0,0.6))',
                    boxShadow: '0 0 40px rgba(255,215,0,0.6), inset 0 0 20px rgba(255,215,0,0.3)'
                  }}
                />
              ) : (
                <span className="text-4xl md:text-5xl">{token}</span>
              )}
            </motion.div>

            {/* Shining effect overlay */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear"
              }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                width: '50%'
              }}
            />
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </AnimatePresence>
  );
};
