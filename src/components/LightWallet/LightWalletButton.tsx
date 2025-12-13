import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Gem, ChevronDown, Sparkles } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCamly, CAMLY_CONTRACT_ADDRESS } from '@/lib/web3';
import { LightWalletModal } from './LightWalletModal';
import { cn } from '@/lib/utils';

interface LightWalletButtonProps {
  variant?: 'header' | 'floating';
  className?: string;
}

export const LightWalletButton = ({ variant = 'header', className }: LightWalletButtonProps) => {
  const { address, isConnected } = useAccount();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [camlyBalance, setCamlyBalance] = useState(0);
  const [nftAvatarUrl, setNftAvatarUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch on-chain BNB balance
  const { data: bnbBalance } = useBalance({
    address: address,
  });

  // Fetch CAMLY balance from Supabase
  useEffect(() => {
    if (user) {
      fetchCamlyBalance();
      fetchNftAvatar();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('wallet-balance')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new.wallet_balance) {
              setCamlyBalance(payload.new.wallet_balance);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchCamlyBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();
    if (data) {
      setCamlyBalance(data.wallet_balance || 0);
    }
  };

  const fetchNftAvatar = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('fun_id')
      .select('soul_nft_id, avatar_glow_color')
      .eq('user_id', user.id)
      .single();
    if (data?.soul_nft_id) {
      setNftAvatarUrl(`/nft-avatars/${data.soul_nft_id}.png`);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (variant === 'floating') {
    return (
      <>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500",
            "border-2 border-yellow-300 shadow-lg shadow-amber-500/30",
            "hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-300",
            className
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Diamond sparkle effect */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                      x: [0, (Math.random() - 0.5) * 40],
                      y: [0, (Math.random() - 0.5) * 40],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    <Gem className="w-3 h-3 text-white" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Gem className="w-5 h-5 text-white drop-shadow-lg" />
          </motion.div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              {nftAvatarUrl && (
                <img 
                  src={nftAvatarUrl} 
                  alt="Soul NFT" 
                  className="w-6 h-6 rounded-full border-2 border-white"
                />
              )}
              <span className="font-bold text-white text-sm">
                {formatCamly(camlyBalance)} CAMLY
              </span>
            </div>
          ) : (
            <span className="font-bold text-white text-sm">Connect Wallet</span>
          )}

          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </motion.button>

        <LightWalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          camlyBalance={camlyBalance}
          onBalanceUpdate={fetchCamlyBalance}
        />
      </>
    );
  }

  // Header variant
  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-xl",
          "bg-gradient-to-r from-amber-500/20 to-yellow-500/20",
          "border border-amber-500/30 hover:border-amber-500/60",
          "transition-all duration-300 group",
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Sparkle effect on hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    x: [0, (Math.random() - 0.5) * 30],
                    y: [0, -20 - Math.random() * 20],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                >
                  <Gem className="w-3 h-3 text-amber-400" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.div
          className="relative"
          animate={{ 
            rotateY: isHovered ? 180 : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          <Gem className="w-5 h-5 text-amber-500" />
        </motion.div>

        {isConnected && address ? (
          <div className="flex items-center gap-2">
            {nftAvatarUrl && (
              <img 
                src={nftAvatarUrl} 
                alt="Soul NFT" 
                className="w-5 h-5 rounded-full border border-amber-500/50"
              />
            )}
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground">
                {shortenAddress(address)}
              </span>
              <span className="font-bold text-amber-500 text-sm">
                {formatCamly(camlyBalance)} CAMLY
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-foreground">My Wallet</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </motion.button>

      <LightWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        camlyBalance={camlyBalance}
        onBalanceUpdate={fetchCamlyBalance}
      />
    </>
  );
};
