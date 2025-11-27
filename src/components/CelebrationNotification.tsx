import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

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
  const [moneyEmojis, setMoneyEmojis] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([]);
  
  // Use custom duration or default to 25000ms
  const celebrationDuration = customDuration || 25000;
  const badgeDuration = celebrationDuration * 2;

  useEffect(() => {
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Create money emoji rain synchronized with "RICH" sounds
    const createMoneyRain = (delay: number) => {
      setTimeout(() => {
        const newEmojis = Array.from({ length: 15 }, (_, i) => ({
          id: Date.now() + i + delay,
          x: Math.random() * 100,
          delay: Math.random() * 300,
          duration: 2 + Math.random() * 1.5
        }));
        setMoneyEmojis(prev => [...prev, ...newEmojis]);
        
        // Remove emojis after animation
        setTimeout(() => {
          setMoneyEmojis(prev => prev.filter(e => !newEmojis.find(ne => ne.id === e.id)));
        }, 4000);
      }, delay);
    };

    // Trigger money rain 5 times synchronized with "RICH"
    createMoneyRain(0);
    createMoneyRain(400);
    createMoneyRain(800);
    createMoneyRain(1200);
    createMoneyRain(1600);

    // Voice announcement "RICH" 5 times with excitement
    if ('speechSynthesis' in window) {
      const speakRich = (delay: number, pitch: number) => {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance("RICH!");
          utterance.rate = 1.2;
          utterance.pitch = pitch;
          utterance.volume = 1;
          utterance.lang = 'en-US';
          speechSynthesis.speak(utterance);
        }, delay);
      };

      // Say "RICH" 5 times with increasing pitch for excitement
      speakRich(0, 1.0);
      speakRich(400, 1.1);
      speakRich(800, 1.2);
      speakRich(1200, 1.3);
      speakRich(1600, 1.5);
    }

    // Play victory sound (using Web Audio API for synthetic sound)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Exciting sound effect for each "RICH"
    const playRichSound = (delay: number, frequency: number) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, delay);
    };

    // Play 5 exciting sounds synchronized with voice
    playRichSound(0, 600);
    playRichSound(400, 700);
    playRichSound(800, 800);
    playRichSound(1200, 900);
    playRichSound(1600, 1000);

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
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #8B46FF 0%, #00F2FF 100%)',
              backdropFilter: 'blur(8px)'
            }}
          >
            {/* Money emoji rain */}
            {moneyEmojis.map((emoji) => (
              <motion.div
                key={emoji.id}
                initial={{ y: -100, x: `${emoji.x}vw`, opacity: 1, rotate: 0 }}
                animate={{ 
                  y: '110vh', 
                  rotate: 360,
                  opacity: [1, 1, 0.5, 0]
                }}
                transition={{ 
                  duration: emoji.duration,
                  delay: emoji.delay / 1000,
                  ease: 'linear'
                }}
                onAnimationComplete={() => {
                  // Trigger firework explosion when emoji reaches bottom
                  confetti({
                    particleCount: 30,
                    spread: 70,
                    origin: { 
                      x: emoji.x / 100, 
                      y: 1 
                    },
                    colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00F2FF', '#8B46FF'],
                    startVelocity: 45,
                    gravity: 1.2,
                    scalar: 1.2,
                    ticks: 100
                  });
                }}
                className="absolute text-6xl md:text-7xl pointer-events-none"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8))',
                  zIndex: 1
                }}
              >
                💰
              </motion.div>
            ))}

            <div className="text-center z-10">
              {/* Main text with clean neon effect */}
              <motion.h1
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 0.5,
                  scale: { repeat: Infinity, duration: 1.5 }
                }}
                className="text-7xl md:text-8xl font-black mb-8 relative"
                style={{
                  color: '#FFD700',
                  textShadow: '0 0 40px rgba(0,242,255,0.8), 0 0 80px rgba(0,242,255,0.5), 0 4px 20px rgba(0,0,0,0.3)',
                  WebkitTextStroke: '3px #00F2FF',
                  letterSpacing: '0.05em'
                }}
              >
                💰 RICH! RICH! RICH! 💰
              </motion.h1>

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
