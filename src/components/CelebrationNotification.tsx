import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import cCoinGlow from "@/assets/c-coin-glow.png";
import cCoinRainbow from "@/assets/c-coin-rainbow.png";

interface CelebrationNotificationProps {
  amount: number;
  token: string;
  tokenImage?: string; // Optional token image URL
  onComplete?: () => void;
  duration?: number; // Optional duration in milliseconds (default: 25000)
}

export const CelebrationNotification = ({ amount, token, tokenImage, onComplete, duration: customDuration }: CelebrationNotificationProps) => {
  const [show, setShow] = useState(true);
  const [showBadge, setShowBadge] = useState(false);
  
  // Use custom duration or default to 12000ms (for 5 times RICH)
  const celebrationDuration = customDuration || 12000;
  const badgeDuration = celebrationDuration * 2;

  useEffect(() => {
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Voice announcement "RICH" 5 times
    if ('speechSynthesis' in window) {
      const richText = "RICH! ".repeat(5);
      const utterance = new SpeechSynthesisUtterance(richText);
      utterance.rate = 1.0;
      utterance.pitch = 1.3;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
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

    // Continuous confetti with custom duration
    const duration = celebrationDuration;
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
      
      // Fun Planet confetti - minimal and clean
      confetti({
        particleCount: 25,
        startVelocity: 25,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#8B46FF', '#00F2FF'],
        scalar: 1.2,
        gravity: 0.7
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
        particleCount: 60,
        startVelocity: 35,
        spread: 360,
        origin: {
          x: randomInRange(0.2, 0.8),
          y: randomInRange(0.3, 0.7)
        },
        colors: ['#8B46FF', '#00F2FF'],
        scalar: 1.3,
        ticks: 200
      });
    }, 800);

    // Main celebration ends after custom duration
    const mainTimeout = setTimeout(() => {
      setShow(false);
      setShowBadge(true);
      clearInterval(confettiInterval);
      clearInterval(fireworksInterval);
    }, celebrationDuration);
 
    // Badge disappears after double the celebration duration
    const badgeTimeout = setTimeout(() => {
      setShowBadge(false);
      onComplete?.();
    }, badgeDuration);

    return () => {
      clearTimeout(mainTimeout);
      clearTimeout(badgeTimeout);
      clearInterval(confettiInterval);
      clearInterval(fireworksInterval);
    };
  }, [amount, token, onComplete, celebrationDuration, badgeDuration]);

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
              background: 'linear-gradient(135deg, #8B46FF 0%, #00F2FF 100%)',
              backdropFilter: 'blur(8px)'
            }}
          >

            <div className="text-center z-10">
              {/* Main text with 2 glowing coins on sides */}
              <div className="relative flex items-center justify-center gap-6 md:gap-12">
                {/* Left coin - synchronized with RICH text */}
                <motion.img
                  src={cCoinRainbow}
                  alt="coin"
                  className="w-24 h-24 md:w-40 md:h-40 flex-shrink-0"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: 0,
                    filter: [
                      'brightness(1) drop-shadow(0 0 30px rgba(255,215,0,0.9))',
                      'brightness(1.8) drop-shadow(0 0 60px rgba(255,215,0,1))',
                      'brightness(1) drop-shadow(0 0 30px rgba(255,215,0,0.9))',
                    ],
                  }}
                  transition={{ 
                    scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                    rotate: { duration: 0.6, ease: "backOut" },
                    filter: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                  }}
                />
                
                {/* RICH text */}
                <motion.h1
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ 
                    duration: 0.5,
                    scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                  }}
                  className="text-5xl md:text-7xl font-black mb-8 relative leading-tight"
                  style={{
                    color: '#FFD700',
                    textShadow: '0 0 40px rgba(0,242,255,0.8), 0 0 80px rgba(0,242,255,0.5), 0 4px 20px rgba(0,0,0,0.3)',
                    WebkitTextStroke: '3px #00F2FF',
                    letterSpacing: '0.05em'
                  }}
                >
                  RICH RICH RICH RICH RICH!!!
                </motion.h1>

                {/* Right coin - synchronized with RICH text */}
                <motion.img
                  src={cCoinRainbow}
                  alt="coin"
                  className="w-24 h-24 md:w-40 md:h-40 flex-shrink-0"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: 0,
                    filter: [
                      'brightness(1) drop-shadow(0 0 30px rgba(255,215,0,0.9))',
                      'brightness(1.8) drop-shadow(0 0 60px rgba(255,215,0,1))',
                      'brightness(1) drop-shadow(0 0 30px rgba(255,215,0,0.9))',
                    ],
                  }}
                  transition={{ 
                    scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                    rotate: { duration: 0.6, ease: "backOut" },
                    filter: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                  }}
                />
              </div>

              {/* Amount display */}
              <motion.div
                initial={{ scale: 0, y: 30 }}
                animate={{ 
                  scale: [1, 1.08, 1],
                  y: 0
                }}
                transition={{ 
                  delay: 0.2,
                  scale: { repeat: Infinity, duration: 1.2 }
                }}
                className="flex items-center justify-center gap-4 text-7xl md:text-8xl font-black"
                style={{
                  color: '#FFD700',
                  textShadow: '0 0 30px rgba(0,242,255,0.7), 0 0 60px rgba(0,242,255,0.4)',
                  WebkitTextStroke: '2px #00F2FF'
                }}
              >
                <span>+{amount}</span>
                {tokenImage ? (
                  <img 
                    src={tokenImage} 
                    alt={token} 
                    className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-full"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.8))',
                      boxShadow: '0 0 40px rgba(255,215,0,0.5)'
                    }}
                  />
                ) : (
                  <span className="text-5xl md:text-6xl">{token}</span>
                )}
              </motion.div>
            </div>
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
            className="fixed top-20 right-6 z-50 px-6 py-3 rounded-full flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #8B46FF 0%, #00F2FF 100%)',
              boxShadow: '0 8px 24px rgba(139,70,255,0.4)',
            }}
          >
            {tokenImage && (
              <img 
                src={tokenImage} 
                alt={token} 
                className="w-8 h-8 object-contain rounded-full"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))'
                }}
              />
            )}
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
