import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Loader2, CheckCircle, Wallet, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import { useAccount } from "wagmi";
import { CAMLY_CONTRACT_ADDRESS, CAMLY_ABI, formatCamly, shortenAddress, appKit } from "@/lib/web3";
import { ethers } from "ethers";

const CLAIM_AMOUNT = 50000; // 50,000 CAMLY

export const ClaimCamlyOnChain = () => {
  const { t, i18n } = useTranslation();
  const isVN = i18n.language === 'vi';
  
  const { address, isConnected } = useAccount();
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [balance, setBalance] = useState('0');
  const [remainingPool, setRemainingPool] = useState('0');
  const [isCheckingClaim, setIsCheckingClaim] = useState(false);

  // Check claim status and balances using ethers directly
  useEffect(() => {
    const checkStatus = async () => {
      if (!address) return;
      
      try {
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org');
        const contract = new ethers.Contract(CAMLY_CONTRACT_ADDRESS, CAMLY_ABI, provider);
        
        // Check if claimed
        const claimed = await contract.hasClaimed(address);
        setHasClaimed(claimed);
        
        // Get balance
        const bal = await contract.balanceOf(address);
        setBalance(ethers.formatUnits(bal, 18));
        
        // Get remaining pool
        try {
          const pool = await contract.remainingAirdropPool();
          setRemainingPool(ethers.formatUnits(pool, 18));
        } catch {
          setRemainingPool('N/A');
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };
    
    checkStatus();
  }, [address, showSuccess]);

  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    appKit.open();
  };

  const handleClaim = async () => {
    if (!isConnected) {
      handleConnect();
      return;
    }

    setIsLoading(true);

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CAMLY_CONTRACT_ADDRESS, CAMLY_ABI, signer);
        
        toast.info(isVN ? 'Đang gửi giao dịch...' : 'Sending transaction...');
        const tx = await contract.claimAirdrop();
        setTxHash(tx.hash);
        
        toast.info(isVN ? 'Đang xác nhận...' : 'Confirming...');
        await tx.wait();
        
        setShowSuccess(true);
        setHasClaimed(true);

        // Diamond confetti!
        const duration = 3000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#00CED1', '#FFD700', '#FF69B4', '#00FF7F', '#FF6347']
          });
          confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#00CED1', '#FFD700', '#FF69B4', '#00FF7F', '#FF6347']
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();

        // Play bling sound
        try {
          const audio = new Audio('/sounds/bling.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}

        toast.success(
          isVN 
            ? `🎉💎 Chúc mừng! ${CLAIM_AMOUNT.toLocaleString()} CAMLY đã về ví bé rồi nè!` 
            : `🎉💎 Congratulations! ${CLAIM_AMOUNT.toLocaleString()} CAMLY is now in your wallet!`,
          { duration: 6000 }
        );
      }
    } catch (error: any) {
      console.error('Claim error:', error);
      if (error.message?.includes('Already claimed')) {
        toast.error(isVN ? 'Bạn đã claim rồi!' : 'You already claimed!');
      } else {
        toast.error(isVN ? 'Có lỗi xảy ra. Vui lòng thử lại!' : 'Something went wrong!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const alreadyClaimed = hasClaimed === true;
  const formattedBalance = balance;
  const formattedPool = remainingPool;

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {isVN ? 'Claim CAMLY On-Chain' : 'Claim CAMLY On-Chain'}
            </CardTitle>
            <CardDescription>
              {isVN ? 'Nhận token thật vào ví crypto của bạn' : 'Get real tokens to your crypto wallet'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 via-orange-500/10 to-yellow-500/10 border border-primary/20"
        >
          <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            {CLAIM_AMOUNT.toLocaleString()}
          </div>
          <div className="text-lg font-semibold text-muted-foreground">CAMLY</div>
          <Badge variant="secondary" className="mt-2">
            BSC Mainnet • {isVN ? 'Token thật' : 'Real Token'}
          </Badge>
        </motion.div>

        {/* Wallet Info */}
        {isConnected && address && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{shortenAddress(address)}</span>
            </div>
            <div className="text-sm font-medium">
              {parseFloat(formattedBalance).toLocaleString()} CAMLY
            </div>
          </div>
        )}

        {/* Remaining Pool */}
        <div className="text-center text-sm text-muted-foreground">
          {isVN ? 'Còn lại trong pool:' : 'Remaining in pool:'}{' '}
          <span className="font-semibold text-foreground">
            {formatCamly(parseFloat(formattedPool))} CAMLY
          </span>
        </div>

        {/* Action Button */}
        <AnimatePresence mode="wait">
          {showSuccess || alreadyClaimed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <span className="font-semibold text-green-500">
                {isVN ? 'Đã claim thành công!' : 'Successfully claimed!'}
              </span>
              {txHash && (
                <a
                  href={`https://bscscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {isVN ? 'Xem trên BscScan' : 'View on BscScan'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <Button
                onClick={handleClaim}
                disabled={isLoading}
                size="lg"
                className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 hover:from-pink-600 hover:via-orange-600 hover:to-yellow-600 text-white shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isVN ? 'Đang xử lý...' : 'Processing...'}
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="w-5 h-5" />
                    {isVN ? 'Kết nối Ví để Claim' : 'Connect Wallet to Claim'}
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    {isVN ? 'Claim CAMLY Ngay!' : 'Claim CAMLY Now!'}
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </Button>

              {/* Gas warning */}
              {isConnected && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {isVN 
                      ? 'Cần có một ít BNB trong ví để trả phí gas (~0.001 BNB)'
                      : 'You need some BNB in your wallet for gas fees (~0.001 BNB)'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <p className="text-xs text-center text-muted-foreground">
          {isVN 
            ? '💎 Mỗi ví chỉ claim được 1 lần. Token CAMLY thật trên BSC Mainnet!'
            : '💎 Each wallet can only claim once. Real CAMLY tokens on BSC Mainnet!'}
        </p>
      </CardContent>
    </Card>
  );
};
