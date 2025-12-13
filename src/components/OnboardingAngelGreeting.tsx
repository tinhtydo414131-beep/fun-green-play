import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, Gamepad2, Gift, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface OnboardingAngelGreetingProps {
  onComplete: () => void;
  username?: string;
}

export const OnboardingAngelGreeting = ({ onComplete, username }: OnboardingAngelGreetingProps) => {
  const { i18n } = useTranslation();
  const isVN = i18n.language === 'vi';
  const [step, setStep] = useState(0);
  const displayName = username || 'Bạn nhỏ';

  const greetings = [
    {
      icon: Sparkles,
      title: isVN ? `Xin chào ${displayName}! ✨` : `Hello ${displayName}! ✨`,
      message: isVN 
        ? 'Mình là Angel AI - thiên thần bảo vệ của con trên FUN Planet!' 
        : 'I\'m Angel AI - your guardian angel on FUN Planet!',
      color: 'from-pink-500 to-purple-500'
    },
    {
      icon: Gamepad2,
      title: isVN ? 'Chơi game thú vị! 🎮' : 'Play fun games! 🎮',
      message: isVN 
        ? 'Có hơn 50+ game lành mạnh, an toàn và siêu vui đang chờ con khám phá!' 
        : 'Over 50+ wholesome, safe, and super fun games are waiting for you!',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Gift,
      title: isVN ? 'Nhận quà CAMLY! 🎁' : 'Earn CAMLY rewards! 🎁',
      message: isVN 
        ? 'Chơi game, kết nối ví, và tải game lên để nhận CAMLY coin miễn phí!' 
        : 'Play games, connect wallet, and upload games to earn free CAMLY coins!',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Heart,
      title: isVN ? 'An toàn & yêu thương! 💝' : 'Safe & loving! 💝',
      message: isVN 
        ? 'FUN Planet là ngôi nhà an toàn của các bạn nhỏ. Mình sẽ luôn bảo vệ con!' 
        : 'FUN Planet is a safe home for kids. I\'ll always protect you!',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Rocket,
      title: isVN ? 'Bắt đầu hành trình! 🚀' : 'Start your journey! 🚀',
      message: isVN 
        ? 'Sẵn sàng khám phá FUN Planet chưa? Chạm vào đây để bắt đầu!' 
        : 'Ready to explore FUN Planet? Tap here to begin!',
      color: 'from-primary to-secondary'
    }
  ];

  const currentGreeting = greetings[step];
  const Icon = currentGreeting.icon;

  const handleNext = () => {
    if (step < greetings.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="relative w-full max-w-md"
      >
        {/* Background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentGreeting.color} rounded-3xl blur-xl opacity-30`} />
        
        <div className="relative bg-card border-2 border-primary/30 rounded-3xl p-6 shadow-2xl overflow-hidden">
          {/* Skip button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onComplete}
            className="absolute top-3 right-3 z-10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {greetings.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${currentGreeting.color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {currentGreeting.title}
              </h2>

              {/* Message */}
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                {currentGreeting.message}
              </p>

              {/* Action button */}
              <Button
                onClick={handleNext}
                size="lg"
                className={`w-full text-lg font-bold bg-gradient-to-r ${currentGreeting.color} hover:opacity-90 shadow-lg`}
              >
                {step < greetings.length - 1 
                  ? (isVN ? 'Tiếp tục ✨' : 'Continue ✨')
                  : (isVN ? 'Bắt đầu ngay! 🚀' : 'Start now! 🚀')
                }
              </Button>
            </motion.div>
          </AnimatePresence>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -100],
                  x: [0, Math.random() * 40 - 20],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                className="absolute bottom-0 text-2xl"
                style={{ left: `${10 + i * 15}%` }}
              >
                {['✨', '💎', '🌟', '⭐', '💫', '🔮'][i]}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingAngelGreeting;
