import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<string | null>;
  isConnected: boolean;
  walletAddress: string | null;
}

export const WalletConnectModal = ({
  isOpen,
  onClose,
  onConnect,
  isConnected,
  walletAddress,
}: WalletConnectModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-center">
            Connect your wallet to earn and claim Camly Coins rewards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isConnected && walletAddress ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connected Wallet</p>
                <p className="font-mono text-lg font-semibold">{shortenAddress(walletAddress)}</p>
              </div>
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* MetaMask Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full p-4 rounded-xl border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:to-yellow-500/20 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-8 h-8">
                    <path
                      fill="#E17726"
                      d="M33.9,10.4L21.2,19.8l2.4-5.6L33.9,10.4z"
                    />
                    <path
                      fill="#E27625"
                      d="M6.1,10.4l12.6,9.5l-2.3-5.7L6.1,10.4z M29.5,27.4l-3.4,5.2l7.2,2l2.1-7.1L29.5,27.4z M4.6,27.5l2.1,7.1 l7.2-2l-3.4-5.2L4.6,27.5z"
                    />
                    <path
                      fill="#E27625"
                      d="M13.5,18.5l-2,3.1l7.2,0.3l-0.2-7.8L13.5,18.5z M26.5,18.5l-5.1-4.5l-0.2,7.9l7.2-0.3L26.5,18.5z M13.9,32.6l4.4-2.1l-3.8-3L13.9,32.6z M21.7,30.5l4.4,2.1l-0.6-5.1L21.7,30.5z"
                    />
                    <path
                      fill="#D5BFB2"
                      d="M26.1,32.6l-4.4-2.1l0.4,2.9l0,1.2L26.1,32.6z M13.9,32.6l4,2l0-1.2l0.3-2.9L13.9,32.6z"
                    />
                    <path
                      fill="#233447"
                      d="M18,25.8l-3.6-1.1l2.6-1.2L18,25.8z M22,25.8l1-2.3l2.6,1.2L22,25.8z"
                    />
                    <path
                      fill="#CC6228"
                      d="M13.9,32.6l0.6-5.2l-4-0.1L13.9,32.6z M25.5,27.4l0.6,5.2l3.4-5.3L25.5,27.4z M28.5,21.6l-7.2,0.3l0.7,3.9 l1-2.3l2.6,1.2L28.5,21.6z M14.4,24.7l2.6-1.2l1,2.3l0.7-3.9l-7.2-0.3L14.4,24.7z"
                    />
                    <path
                      fill="#E27525"
                      d="M11.5,21.6l3.1,6.1l-0.1-3L11.5,21.6z M25.6,24.7l-0.2,3l3.1-6.1L25.6,24.7z M18.7,21.9l-0.7,3.9l0.9,4.5 l0.2-5.9L18.7,21.9z M21.3,21.9l-0.4,2.4l0.1,5.9l0.9-4.5L21.3,21.9z"
                    />
                    <path
                      fill="#F5841F"
                      d="M22,25.8l-0.9,4.5l0.6,0.5l3.8-3l0.2-3L22,25.8z M14.4,24.7l0.1,3l3.8,3l0.6-0.5l-0.9-4.5L14.4,24.7z"
                    />
                    <path
                      fill="#C0AC9D"
                      d="M22.1,34.6l0-1.2l-0.3-0.3h-3.5l-0.3,0.3l0,1.2l-4-2l1.4,1.1l2.8,2h3.6l2.8-2l1.4-1.1L22.1,34.6z"
                    />
                    <path
                      fill="#161616"
                      d="M21.7,30.5l-0.6-0.5h-2.2l-0.6,0.5l-0.3,2.9l0.3-0.3h3.5l0.3,0.3L21.7,30.5z"
                    />
                    <path
                      fill="#763E1A"
                      d="M34.5,11l1.1-5.4L33.9,1L21.7,10.1l4.8,4l6.8,2l1.5-1.8l-0.7-0.5l1-0.9l-0.8-0.6l1-0.8L34.5,11z M4.4,5.6 L5.5,11l-0.8,0.6l1,0.8l-0.8,0.6l1,0.9l-0.7,0.5l1.5,1.8l6.8-2l4.8-4L6.1,1L4.4,5.6z"
                    />
                    <path
                      fill="#F5841F"
                      d="M33.3,16.1l-6.8-2l2,3.1l-3.1,6.1l4.1-0.1h6.1L33.3,16.1z M13.5,14.1l-6.8,2l-2.2,7.1h6.1l4.1,0.1 l-3.1-6.1L13.5,14.1z M21.3,21.9l0.4-7.8l2-5.4h-8.7l1.9,5.4l0.5,7.8l0.2,2.5l0,5.9h2.2l0-5.9L21.3,21.9z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-lg">MetaMask</p>
                  <p className="text-sm text-muted-foreground">Connect using MetaMask wallet</p>
                </div>
                {isConnecting && <Loader2 className="w-5 h-5 animate-spin" />}
              </motion.button>

              {/* First connection bonus info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-xl">🎁</span>
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">First Connection Bonus!</p>
                    <p className="text-sm text-muted-foreground">Get 50,000 Camly Coins on first connect</p>
                  </div>
                </div>
              </div>

              {/* Info about MetaMask */}
              <p className="text-xs text-center text-muted-foreground">
                Don't have MetaMask?{' '}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Install here <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
