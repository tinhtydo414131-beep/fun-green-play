import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Gamepad2, Upload, Users, Gift, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { formatCamly } from '@/lib/web3';
import { fireDiamondConfetti } from '@/components/DiamondConfetti';

export type EarnType = 'game' | 'upload' | 'referral' | 'daily' | 'charity';

interface EarnConfig {
  icon: typeof Gem;
  color: string;
  bgColor: string;
  borderColor: string;
}

const earnConfigs: Record<EarnType, EarnConfig> = {
  game: {
    icon: Gamepad2,
    color: 'text-green-500',
    bgColor: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
  },
  upload: {
    icon: Upload,
    color: 'text-blue-500',
    bgColor: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
  },
  referral: {
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
  },
  daily: {
    icon: Gift,
    color: 'text-amber-500',
    bgColor: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-500/30',
  },
  charity: {
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/30',
  },
};

export const showEarnToast = (amount: number, type: EarnType, message?: string) => {
  const config = earnConfigs[type];
  const Icon = config.icon;
  
  // Fire confetti
  fireDiamondConfetti('reward');
  
  // Play bling sound
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {}
  
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${config.bgColor} border ${config.borderColor} shadow-xl`}
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 0.5 }}
          className={`w-10 h-10 rounded-full bg-background/50 flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${config.color}`} />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className={`font-bold text-lg ${config.color}`}
            >
              +{formatCamly(amount)} CAMLY
            </motion.span>
            <motion.div
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Gem className="w-4 h-4 text-amber-500" />
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground">
            {message || getDefaultMessage(type)}
          </p>
        </div>
        
        {/* Flying diamonds */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              x: (Math.random() - 0.5) * 100,
              y: -50 - Math.random() * 50,
            }}
            transition={{ duration: 1, delay: i * 0.2 }}
          >
            <Gem className="w-3 h-3 text-amber-400" />
          </motion.div>
        ))}
      </motion.div>
    ),
    { duration: 4000 }
  );
};

const getDefaultMessage = (type: EarnType): string => {
  switch (type) {
    case 'game':
      return 'Keep playing and earning! 🎮';
    case 'upload':
      return 'Thank you for contributing! 🚀';
    case 'referral':
      return 'Your friend joined FUN Planet! 👥';
    case 'daily':
      return 'Welcome back! See you tomorrow! 🌟';
    case 'charity':
      return 'Spreading light to the world! 💖';
    default:
      return 'Joy earned! ✨';
  }
};

// Component for displaying wallet balance with live updates
export const WalletBalanceDisplay = ({ 
  balance, 
  showIcon = true,
  size = 'default'
}: { 
  balance: number;
  showIcon?: boolean;
  size?: 'small' | 'default' | 'large';
}) => {
  const sizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-xl',
  };

  return (
    <motion.div
      key={balance}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-1 font-bold text-amber-500 ${sizeClasses[size]}`}
    >
      {showIcon && <Gem className="w-4 h-4" />}
      <span>{formatCamly(balance)}</span>
      <span className="text-muted-foreground font-normal">CAMLY</span>
    </motion.div>
  );
};
