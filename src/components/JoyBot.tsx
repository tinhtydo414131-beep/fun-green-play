import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Sparkles, Heart, Star, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface JoyBotProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  autoShow?: boolean;
}

interface Tip {
  message: string;
  emoji: string;
  route?: string;
}

const tips: Tip[] = [
  { message: "Chào bạn! Mình là JoyBot! Hãy chơi game để kiếm CAMLY nhé! 🎮", emoji: "👋", route: "/" },
  { message: "Bạn biết không? Hoàn thành level càng cao, phần thưởng càng lớn! 🎯", emoji: "🎯" },
  { message: "Hãy thử nghe nhạc 432Hz để thư giãn sau khi chơi game nhé! 🎵", emoji: "🎵", route: "/public-music" },
  { message: "Kết bạn để gửi CAMLY và cùng nhau leo bảng xếp hạng! 👥", emoji: "👥", route: "/friends" },
  { message: "Đừng quên cài đặt FUN Planet lên màn hình chính để chơi mọi lúc! 📱", emoji: "📱", route: "/install" },
  { message: "Mỗi game đều có level riêng, hãy thử thách bản thân mỗi ngày! 💪", emoji: "💪" },
  { message: "Ví của bạn đang có bao nhiêu CAMLY rồi? Kiểm tra ngay! 💰", emoji: "💰", route: "/wallet" },
  { message: "Bạn đã thử tất cả các game chưa? Còn nhiều điều thú vị đang chờ! 🌟", emoji: "🌟", route: "/games" },
];

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
};

export const JoyBot = ({ position = 'bottom-right', autoShow = true }: JoyBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState<Tip>(tips[0]);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (autoShow) {
      const timer = setTimeout(() => {
        const routeTips = tips.filter(tip => !tip.route || tip.route === location.pathname);
        const randomTip = routeTips[Math.floor(Math.random() * routeTips.length)] || tips[0];
        setCurrentTip(randomTip);
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [autoShow, location.pathname]);

  const changeTip = () => {
    const newTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(newTip);
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
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
                  animate={pulseAnimation}
                  className="text-4xl"
                >
                  {currentTip.emoji}
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-2">
                    {currentTip.message}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={changeTip}
                      className="h-7 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Tip khác
                    </Button>
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
        animate={floatingAnimation}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 shadow-lg hover:shadow-2xl transition-shadow overflow-hidden group"
      >
        {/* Animated background effects */}
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
        
        {/* JoyBot character */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl"
          >
            😊
          </motion.div>
        </div>

        {/* Sparkle effects */}
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

        {/* Notification badge */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              !
            </motion.div>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};
