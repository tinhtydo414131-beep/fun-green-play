import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import coinImage from "@/assets/coin-celebration.png";

interface CelebrationNotificationProps {
  amount: number;
  token: string;
  tokenImage?: string;
  onComplete?: () => void;
  duration?: number;
}

export const CelebrationNotification = ({ amount, token, tokenImage, onComplete, duration: customDuration }: CelebrationNotificationProps) => {
  const [show, setShow] = useState(true);
  
  const celebrationDuration = customDuration || 5000;

  useEffect(() => {
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    // Hát "RICH" 5 lần
    if ('speechSynthesis' in window) {
      const speakRich = (times: number) => {
        for (let i = 0; i < times; i++) {
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance("RICH");
            utterance.rate = 1.0;
            utterance.pitch = 1.3;
            utterance.volume = 1;
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
          }, i * 400);
        }
      };
      speakRich(5);
    }

    // Auto hide after duration
    const timeout = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, celebrationDuration);

    return () => {
      clearTimeout(timeout);
    };
  }, [amount, token, onComplete, celebrationDuration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-6 right-6 z-50"
        >
          <div 
            className="relative p-6 rounded-2xl backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 70, 255, 0.95), rgba(0, 242, 255, 0.95))',
              border: '4px solid transparent',
              backgroundClip: 'padding-box',
            }}
          >
            {/* Rainbow glowing border */}
            <div 
              className="absolute inset-0 rounded-2xl -z-10"
              style={{
                background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)',
                backgroundSize: '400% 400%',
                animation: 'rainbow-glow 3s linear infinite',
                padding: '4px',
                filter: 'blur(8px)',
              }}
            />
            
            {/* Content */}
            <div className="flex items-center gap-4">
              {/* Spinning coin */}
              <motion.img
                src={coinImage}
                alt="Coin"
                className="w-20 h-20 object-contain"
                animate={{ 
                  rotateY: [0, 360],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                }}
              />
              
              {/* Amount text */}
              <div className="text-white">
                <div className="text-sm font-semibold opacity-90">Đã nhận</div>
                <div className="text-3xl font-black flex items-center gap-2">
                  <span>+{amount}</span>
                  <span className="text-2xl">{token}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      <style>{`
        @keyframes rainbow-glow {
          0% { background-position: 0% 50%; }
          100% { background-position: 400% 50%; }
        }
      `}</style>
    </AnimatePresence>
  );
};
