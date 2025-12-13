import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, ArrowRight, Loader2, CheckCircle2, ExternalLink, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import camlyCoinIcon from "@/assets/camly-coin-notification.png";

interface ClaimRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  camlyBalance: number;
  walletAddress: string | null;
  onClaim: (amount: number) => Promise<{ success: boolean; txHash?: string }>;
  contractAddress: string;
}

export const ClaimRewardsModal = ({
  isOpen,
  onClose,
  camlyBalance,
  walletAddress,
  onClaim,
  contractAddress,
}: ClaimRewardsModalProps) => {
  const [amount, setAmount] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<{ txHash: string } | null>(null);

  const handleClaim = async () => {
    const claimAmount = parseFloat(amount);
    if (isNaN(claimAmount) || claimAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (claimAmount > camlyBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsClaiming(true);
    try {
      const result = await onClaim(claimAmount);
      if (result.success && result.txHash) {
        setClaimSuccess({ txHash: result.txHash });
        setAmount('');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    setClaimSuccess(null);
    setAmount('');
    onClose();
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <img src={camlyCoinIcon} alt="Camly Coin" className="w-8 h-8" />
            Claim Camly Coins
          </DialogTitle>
          <DialogDescription className="text-center">
            Transfer your earned Camly Coins to your wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {claimSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                  Claim Successful!
                </p>
                <p className="text-sm text-muted-foreground mt-2">Transaction Hash:</p>
                <a
                  href={`https://bscscan.com/tx/${claimSuccess.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {shortenAddress(claimSuccess.txHash)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Security notice */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-600 dark:text-blue-400">Secure Claim Process</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    You'll be asked to sign a message to verify wallet ownership. No gas fees required.
                  </p>
                </div>
              </div>

              {/* Balance display */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available Balance</span>
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {camlyBalance.toLocaleString()} CAMLY
                  </span>
                </div>
              </div>

              {/* Wallet address */}
              {walletAddress && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Wallet className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Claim to:</span>
                  <span className="font-mono text-sm font-medium">{shortenAddress(walletAddress)}</span>
                </div>
              )}

              {/* Amount input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Claim</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-20 text-lg h-12"
                    max={camlyBalance}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                    onClick={() => setAmount(camlyBalance.toString())}
                  >
                    MAX
                  </Button>
                </div>
                {parseFloat(amount) > camlyBalance && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Insufficient balance
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2">
                {[10000, 50000, 100000].filter(a => a <= camlyBalance).map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    {quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>

              {/* Contract info */}
              <div className="text-xs text-center text-muted-foreground space-y-1">
                <p>CAMLY Token Contract (BSC):</p>
                <a
                  href={`https://bscscan.com/token/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-primary hover:underline inline-flex items-center gap-1"
                >
                  {shortenAddress(contractAddress)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Claim button */}
              <Button
                onClick={handleClaim}
                disabled={isClaiming || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > camlyBalance}
                className="w-full h-12 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sign in Wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Claim {amount ? parseFloat(amount).toLocaleString() : '0'} CAMLY
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
