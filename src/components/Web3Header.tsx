import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, Check, ChevronDown, LogOut, Gift, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useAccount, useDisconnect } from 'wagmi';
import { web3Modal, shortenAddress, formatCamly, REWARDS } from '@/lib/web3';
import { useWeb3Rewards } from '@/hooks/useWeb3Rewards';
import camlyCoin from '@/assets/camly-coin.png';
import { toast } from 'sonner';

export function Web3Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { camlyBalance, isLoading, firstWalletClaimed, connectWallet } = useWeb3Rewards();
  const [copied, setCopied] = useState(false);
  const [showAirdrop, setShowAirdrop] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Check for first connect airdrop
  useEffect(() => {
    if (isConnected && address && !firstWalletClaimed) {
      const timer = setTimeout(() => setShowAirdrop(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, firstWalletClaimed]);

  const handleConnect = () => {
    web3Modal.open();
  };

  const handleClaimAirdrop = async () => {
    setClaiming(true);
    const result = await connectWallet();
    setClaiming(false);
    if (result) {
      setShowAirdrop(false);
      toast.success(`🎉 Airdrop claimed! +${formatCamly(REWARDS.FIRST_WALLET_CONNECT)} CAMLY`);
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const displayBalance = camlyBalance || 0;

  return (
    <>
      {/* Airdrop Modal */}
      <AnimatePresence>
        {showAirdrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAirdrop(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-gradient-to-br from-primary/20 via-background to-secondary/20 border-2 border-primary/30 rounded-3xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowAirdrop(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-4"
                >
                  <Gift className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Welcome Airdrop!
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </h2>

                <p className="text-muted-foreground mb-4">
                  Claim your first-connect bonus on BSC Mainnet!
                </p>

                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center justify-center gap-3 mb-6 p-4 bg-primary/10 rounded-2xl"
                >
                  <img src={camlyCoin} alt="CAMLY" className="w-12 h-12" />
                  <div className="text-left">
                    <p className="text-3xl font-bold text-primary">
                      +{formatCamly(REWARDS.FIRST_WALLET_CONNECT)}
                    </p>
                    <p className="text-sm text-muted-foreground">CAMLY Tokens</p>
                  </div>
                </motion.div>

                <p className="text-xs text-muted-foreground mb-4">
                  Connected: <span className="font-mono">{shortenAddress(address || '')}</span>
                </p>

                <Button
                  onClick={handleClaimAirdrop}
                  disabled={claiming}
                  className="w-full h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg shadow-lg"
                >
                  {claiming ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-2" />
                      Claim Airdrop
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Button */}
      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleConnect}
            className="h-10 sm:h-12 px-3 sm:px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
          >
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Connect</span>
            <span className="xs:hidden">💼</span>
          </Button>
        </motion.div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 sm:gap-3 h-10 sm:h-12 px-3 sm:px-4 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <img src={camlyCoin} alt="CAMLY" className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-bold text-sm sm:text-base text-foreground">
                  {isLoading ? '...' : formatCamly(displayBalance)}
                </span>
              </div>
              <div className="w-px h-5 bg-border hidden sm:block" />
              <span className="font-mono text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                {shortenAddress(address || '')}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-2">
            <div className="px-3 py-2 mb-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Your Balance (BSC)</p>
              <div className="flex items-center gap-2">
                <img src={camlyCoin} alt="CAMLY" className="w-6 h-6" />
                <span className="font-bold text-lg">{formatCamly(displayBalance)}</span>
                <span className="text-sm text-muted-foreground">CAMLY</span>
              </div>
            </div>

            <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {shortenAddress(address || '')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={handleDisconnect} 
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
