import { useEffect } from "react";
import { motion } from "framer-motion";
import camlyCoin from "@/assets/camly-coin.png";

interface CamlyCoinRewardProps {
  amount: number;
  message?: string;
  onComplete?: () => void;
}

export const CamlyCoinReward = ({ amount, message, onComplete }: CamlyCoinRewardProps) => {
  useEffect(() => {
    const audio = new Audio("/audio/rich1.mp3");
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Audio play failed:", e));

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ 
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1],
          y: [50, -10, 0]
        }}
        exit={{ 
          scale: 0.8,
          opacity: 0,
          y: -50
        }}
        transition={{ 
          duration: 0.6,
          ease: "easeOut"
        }}
        className="bg-gradient-to-br from-accent via-secondary to-accent p-8 rounded-3xl shadow-2xl border-4 border-white/30 pointer-events-auto"
      >
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="flex flex-col items-center gap-4"
        >
          <img 
            src={camlyCoin} 
            alt="Camly Coin" 
            className="w-24 h-24 drop-shadow-2xl"
          />
          
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-6xl font-fredoka font-bold text-white drop-shadow-lg"
            >
              +{amount.toLocaleString()}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-comic text-white/90 mt-2"
            >
              Camly Coins
            </motion.div>

            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-lg font-comic text-white/80 mt-3 max-w-xs"
              >
                {message}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Sparkle effects */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{ 
                x: "50%", 
                y: "50%",
                scale: 0,
                opacity: 1
              }}
              animate={{ 
                x: `${50 + (Math.cos(i * Math.PI / 4) * 150)}%`,
                y: `${50 + (Math.sin(i * Math.PI / 4) * 150)}%`,
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 1,
                delay: 0.3,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
