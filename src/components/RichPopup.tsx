import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RichPopupProps {
  amount: number;
  token: string;
  onComplete?: () => void;
}

export const RichPopup = ({ amount, token, onComplete }: RichPopupProps) => {
  useEffect(() => {
    const audio = new Audio("/audio/rich1.mp3");
    audio.play().catch(console.error);

    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -50 }}
      className="fixed bottom-24 right-8 z-50 bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 rounded-2xl shadow-2xl p-6 border-4 border-yellow-400"
      style={{
        boxShadow: "0 0 40px rgba(234, 179, 8, 0.6), inset 0 2px 10px rgba(255, 255, 255, 0.3)"
      }}
    >
      <div className="text-center space-y-2">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 0.5
          }}
          className="text-5xl font-black tracking-wider"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFA500 75%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
            filter: "drop-shadow(0 2px 8px rgba(255, 215, 0, 0.8))",
            textShadow: "0 0 20px rgba(255, 215, 0, 0.5)"
          }}
        >
          RICH
        </motion.div>
        <div 
          className="text-2xl font-bold"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFED4E 50%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 1px 4px rgba(255, 215, 0, 0.6))"
          }}
        >
          +{amount} {token}
        </div>
      </div>
    </motion.div>
  );
};
