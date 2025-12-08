import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Copy, Check, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useAccount, useDisconnect } from 'wagmi';
import { web3ModalBSC, shortenAddress, formatCamly } from '@/lib/web3-bsc';
import { useWeb3Rewards } from '@/hooks/useWeb3Rewards';
import camlyCoin from '@/assets/camly-coin.png';
import { toast } from 'sonner';

export function Web3Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { camlyBalance, isLoading } = useWeb3Rewards();
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    web3ModalBSC.open();
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

  if (!isConnected) {
    return (
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
    );
  }

  return (
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
          <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
          <div className="flex items-center gap-2">
            <img src={camlyCoin} alt="CAMLY" className="w-6 h-6" />
            <span className="font-bold text-lg">{formatCamly(displayBalance)}</span>
            <span className="text-sm text-muted-foreground">CAMLY</span>
          </div>
        </div>
          )}
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
  );
}
