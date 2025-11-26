import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import shibaMascot from "@/assets/shiba-mascot.png";

interface CelebrationNotificationProps {
  amount: number;
  token: string;
  onComplete?: () => void;
}

export const CelebrationNotification = ({ amount, token, onComplete }: CelebrationNotificationProps) => {
  const [show, setShow] = useState(true);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Play victory sound (using Web Audio API for synthetic sound)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Jackpot sound
    const playJackpotSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    playJackpotSound();
    setTimeout(playJackpotSound, 200);
    setTimeout(playJackpotSound, 400);

    // Continuous confetti - 20 SECONDS OF FUN!
    const duration = 20000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      const particleCount = 50;
      
      // Golden confetti
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFE4B5', '#F0E68C']
      });

      // Diamond sparkles
      confetti({
        particleCount: 20,
        startVelocity: 25,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        },
        shapes: ['circle'],
        colors: ['#FFFFFF', '#E0FFFF', '#B0E0E6', '#ADD8E6']
      });
    }, 200);

    // Fireworks
    const fireworksInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(fireworksInterval);
        return;
      }

      confetti({
        particleCount: 100,
        startVelocity: 45,
        spread: 360,
        origin: {
          x: randomInRange(0.2, 0.8),
          y: randomInRange(0.3, 0.7)
        },
        colors: ['#FF1493', '#00FFFF', '#FFD700', '#FF69B4', '#00FF00', '#FF4500']
      });
    }, 800);

    // Main celebration ends after 20 seconds
    const mainTimeout = setTimeout(() => {
      setShow(false);
      setShowBadge(true);
      clearInterval(confettiInterval);
      clearInterval(fireworksInterval);
    }, 20000);
 
    // Badge disappears after 40 seconds total (20 + 20)
    const badgeTimeout = setTimeout(() => {
      setShowBadge(false);
      onComplete?.();
    }, 40000);

    return () => {
      clearTimeout(mainTimeout);
      clearTimeout(badgeTimeout);
      clearInterval(confettiInterval);
      clearInterval(fireworksInterval);
    };
  }, [amount, token, onComplete]);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(138,43,226,0.8) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Golden pulsing border */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px 5px rgba(255,215,0,0.5)',
                  '0 0 40px 10px rgba(255,215,0,0.8)',
                  '0 0 20px 5px rgba(255,215,0,0.5)'
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-4 border-8 border-yellow-400 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.3) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 2s ease infinite'
              }}
            />

            {/* Mascot */}
            <motion.img
              src={shibaMascot}
              alt="Shiba Mascot"
              className="absolute bottom-10 left-10 w-48 h-48 z-10"
              initial={{ x: -300, rotate: -45 }}
              animate={{ 
                x: 0, 
                rotate: [0, -10, 10, -10, 10, 0],
                y: [0, -20, 0, -10, 0]
              }}
              transition={{ 
                x: { duration: 0.5 },
                rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 0.5 },
                y: { duration: 0.5, repeat: Infinity }
              }}
            />

            <div className="text-center z-10">
              {/* Main text */}
              <motion.h1
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: [1, 1.2, 1, 1.1, 1],
                  rotate: 0
                }}
                transition={{ 
                  duration: 0.6,
                  scale: { repeat: Infinity, duration: 2 }
                }}
                className="text-9xl font-black mb-8 relative"
                style={{
                  background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFFF00 75%, #FFD700 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.8)) drop-shadow(0 0 60px rgba(255,215,0,0.6))',
                  textShadow: '0 0 80px rgba(255,215,0,0.9)',
                  animation: 'gradient-x 3s linear infinite'
                }}
              >
                FUN AND RICH!!!
              </motion.h1>

              {/* Amount */}
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  y: 0
                }}
                transition={{ 
                  delay: 0.3,
                  scale: { repeat: Infinity, duration: 1.5 }
                }}
                className="flex items-center justify-center gap-4 text-8xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 10px 20px rgba(255,215,0,0.5))',
                  animation: 'gradient-x 2s linear infinite'
                }}
              >
                <span>+{amount}</span>
                <span className="text-6xl">{token}</span>
              </motion.div>

              {/* Particles explosion */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      boxShadow: '0 0 20px rgba(255,215,0,0.8)'
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 400],
                      y: [0, (Math.random() - 0.5) * 400],
                      scale: [1, 0],
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Flash effect */}
            <motion.div
              className="absolute inset-0 bg-yellow-300 pointer-events-none"
              animate={{
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: 5,
                repeatDelay: 0.5
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating badge */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ scale: 0, x: 100 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-20 right-6 z-50 px-6 py-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 10px 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.3)',
            }}
          >
            <span className="text-2xl font-black text-white drop-shadow-lg">
              +{amount} {token}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
};
