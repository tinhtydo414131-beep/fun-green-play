import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { Gamepad2, Wallet, Upload, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { fireDiamondConfetti } from './DiamondConfetti';
import { playRewardSound } from './SoundEffects528Hz';

export const HeroDiamondButtons = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { i18n } = useTranslation();
  const isVN = i18n.language === 'vi';
  const [connecting, setConnecting] = useState(false);

  const handlePlayNow = () => {
    const gamesSection = document.getElementById('games-gallery');
    if (gamesSection) {
      gamesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/games');
    }
  };

  const handleConnectWallet = async () => {
    if (!user) {
      toast.info(isVN ? 'Vui lòng đăng nhập trước!' : 'Please login first!');
      navigate('/auth');
      return;
    }

    if (isConnected) {
      toast.success(isVN ? 'Ví đã kết nối!' : 'Wallet already connected!');
      fireDiamondConfetti('celebration');
      playRewardSound();
      return;
    }

    setConnecting(true);
    try {
      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
        toast.success(isVN ? '🎉 Kết nối ví thành công! +50K CAMLY' : '🎉 Wallet connected! +50K CAMLY');
        fireDiamondConfetti('rainbow');
        playRewardSound();
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast.error(isVN ? 'Không thể kết nối ví' : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleUploadGame = () => {
    navigate('/upload-game');
  };

  const handle3DBuilder = () => {
    navigate('/planet-explorer');
  };

  const buttons = [
    {
      icon: Gamepad2,
      label: isVN ? 'Chơi ngay' : 'Play Now',
      sublabel: isVN ? 'Không cần đăng ký' : 'No registration',
      onClick: handlePlayNow,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/30'
    },
    {
      icon: Wallet,
      label: isVN ? 'Kết nối ví' : 'Connect Wallet',
      sublabel: isConnected ? (isVN ? 'Đã kết nối!' : 'Connected!') : '+50K CAMLY',
      onClick: handleConnectWallet,
      gradient: isConnected ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-pink-500',
      shadow: 'shadow-orange-500/30',
      loading: connecting
    },
    {
      icon: Upload,
      label: isVN ? 'Tải game lên' : 'Upload Game',
      sublabel: '+500K CAMLY',
      onClick: handleUploadGame,
      gradient: 'from-purple-500 to-violet-500',
      shadow: 'shadow-purple-500/30'
    },
    {
      icon: Globe,
      label: isVN ? 'Xây hành tinh 3D' : 'Build 3D Planet',
      sublabel: 'AR/WebXR',
      onClick: handle3DBuilder,
      gradient: 'from-pink-500 to-rose-500',
      shadow: 'shadow-pink-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
      {buttons.map((button, index) => (
        <motion.div
          key={button.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <Button
            onClick={button.onClick}
            disabled={button.loading}
            className={`w-full h-auto py-4 px-3 flex flex-col items-center gap-2 bg-gradient-to-r ${button.gradient} hover:opacity-90 ${button.shadow} shadow-lg hover:shadow-xl transition-all hover:scale-105 rounded-2xl border-0`}
          >
            <motion.div
              animate={{ 
                rotate: button.loading ? 360 : 0,
                scale: button.loading ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                duration: button.loading ? 1 : 0.3,
                repeat: button.loading ? Infinity : 0
              }}
            >
              <button.icon className="w-6 h-6 md:w-7 md:h-7" />
            </motion.div>
            
            <div className="text-center">
              <p className="font-bold text-sm md:text-base leading-tight">
                {button.label}
              </p>
              <p className="text-[10px] md:text-xs opacity-90 mt-0.5">
                {button.sublabel}
              </p>
            </div>

            {/* Diamond sparkle effect */}
            <motion.div
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              className="absolute top-1 right-1"
            >
              <Sparkles className="w-3 h-3 text-white/70" />
            </motion.div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

export default HeroDiamondButtons;
