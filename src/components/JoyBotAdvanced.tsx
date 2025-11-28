import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Sparkles, Heart, Star, Zap, HelpCircle, Lightbulb } from 'lucide-react';
import { useJoyBotTips } from '@/hooks/useJoyBotTips';

interface JoyBotAdvancedProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
};

const moods = ['😊', '😄', '🥳', '🤗', '😎', '🌟', '✨', '💫'];

export const JoyBotAdvanced = ({ position = 'bottom-right' }: JoyBotAdvancedProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState(moods[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const { personalizedTips } = useJoyBotTips();

  // Change mood periodically
  useEffect(() => {
    const moodInterval = setInterval(() => {
      setCurrentMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 5000);

    return () => clearInterval(moodInterval);
  }, []);

  // Auto-show tip after delay
  useEffect(() => {
    if (personalizedTips.length > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [personalizedTips]);

  const changeTip = () => {
    setTipIndex((prev) => (prev + 1) % Math.max(personalizedTips.length, 1));
  };

  const currentTip = personalizedTips[tipIndex] || {
    message: "Chào bạn! Mình là JoyBot! Hãy chơi game để kiếm CAMLY nhé! 🎮",
    emoji: "👋"
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4"
          >
            <Card className="p-4 max-w-xs bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/30 shadow-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-4xl"
                >
                  {currentTip.emoji}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold text-primary">JoyBot Tip</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    {currentTip.message}
                  </p>
                  <div className="flex gap-2">
                    {personalizedTips.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={changeTip}
                        className="h-7 text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Tip khác ({tipIndex + 1}/{personalizedTips.length})
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                      className="h-7 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 shadow-lg hover:shadow-2xl transition-shadow overflow-hidden group"
      >
        {/* Rotating gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* JoyBot character with mood */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl relative z-10"
          >
            {currentMood}
          </motion.div>
        </div>

        {/* Sparkle effects on hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-2 right-2"
              >
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute bottom-2 left-2"
              >
                <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              </motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-2 left-2"
              >
                <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Pulsing help indicator */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <HelpCircle className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};
