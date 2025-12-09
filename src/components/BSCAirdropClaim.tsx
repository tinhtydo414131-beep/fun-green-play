import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Loader2, CheckCircle, Users, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// BSC Mainnet CAMLY Contract (placeholder - replace with real contract)
const CAMLY_CONTRACT = "0x0000000000000000000000000000000000000000"; // Deploy contract and update
const AIRDROP_AMOUNT = 10000; // 10,000 CAMLY
const TOTAL_AIRDROP = 1_000_000_000; // 1 Billion CAMLY

interface BSCAirdropClaimProps {
  variant?: "button" | "card";
}

export function BSCAirdropClaim({ variant = "button" }: BSCAirdropClaimProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'verify' | 'claim' | 'success'>('verify');
  const [isLoading, setIsLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [ageVerified, setAgeVerified] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClaimStats();
    }
  }, [isOpen, user]);

  const fetchClaimStats = async () => {
    // Get total claims count
    const { count } = await supabase
      .from('web3_reward_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('reward_type', 'bsc_airdrop_1b');
    
    setTotalClaimed(count || 0);

    // Check if user already claimed
    if (user) {
      const { data } = await supabase
        .from('web3_reward_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('reward_type', 'bsc_airdrop_1b')
        .maybeSingle();
      
      if (data) {
        setClaimed(true);
        setStep('success');
      }
    }
  };

  const verifyAge = () => {
    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (isNaN(year) || year < 1900 || year > currentYear) {
      toast.error("Năm sinh không hợp lệ");
      return;
    }

    if (age > 18) {
      toast.error("Airdrop này chỉ dành cho trẻ em dưới 18 tuổi 💝");
      return;
    }

    if (age < 3) {
      toast.error("Bạn cần ít nhất 3 tuổi để tham gia");
      return;
    }

    setAgeVerified(true);
    setStep('claim');
    toast.success("Xác minh tuổi thành công! ✨");
  };

  const handleClaimAirdrop = async () => {
    if (!user || claimed) return;

    // Validate wallet address
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Địa chỉ ví BSC không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      // Check if already claimed
      const { data: existing } = await supabase
        .from('web3_reward_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('reward_type', 'bsc_airdrop_1b')
        .maybeSingle();

      if (existing) {
        setClaimed(true);
        setStep('success');
        toast.error("Bạn đã nhận airdrop rồi!");
        setIsLoading(false);
        return;
      }

      // Update profile wallet balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      const currentBalance = profile?.wallet_balance || 0;

      await supabase
        .from('profiles')
        .update({ 
          wallet_balance: currentBalance + AIRDROP_AMOUNT,
          wallet_address: walletAddress
        })
        .eq('id', user.id);

      // Record airdrop claim
      await supabase
        .from('web3_reward_transactions')
        .insert({
          user_id: user.id,
          amount: AIRDROP_AMOUNT,
          reward_type: 'bsc_airdrop_1b',
          description: `BSC Mainnet CAMLY Airdrop - 1B Campaign - Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        });

      // Success!
      setClaimed(true);
      setStep('success');
      setTotalClaimed(prev => prev + 1);

      // Fire confetti!
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#F0B90B', '#FFD700', '#FFA500', '#FF6347', '#00FF00']
      });

      toast.success(`🎉 Bạn nhận được ${AIRDROP_AMOUNT.toLocaleString()} CAMLY!`);

    } catch (error) {
      console.error('Airdrop error:', error);
      toast.error("Có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const remainingTokens = TOTAL_AIRDROP - (totalClaimed * AIRDROP_AMOUNT);
  const claimProgress = (totalClaimed * AIRDROP_AMOUNT / TOTAL_AIRDROP) * 100;

  return (
    <>
      {variant === "button" ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>1B CAMLY Airdrop</span>
          <Gift className="w-5 h-5" />
        </motion.button>
      ) : (
        <motion.div
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.02 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">1B CAMLY Airdrop</h3>
              <p className="text-sm text-muted-foreground">BSC Mainnet • Cho trẻ em dưới 18</p>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
              style={{ width: `${Math.min(claimProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {totalClaimed.toLocaleString()} đã nhận • Còn {remainingTokens.toLocaleString()} CAMLY
          </p>
        </motion.div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Gift className="w-7 h-7 text-yellow-500" />
              1 Billion CAMLY Airdrop
            </DialogTitle>
            <DialogDescription className="text-center">
              🌟 Quà tặng đặc biệt cho trẻ em dưới 18 tuổi trên BSC Mainnet!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Progress */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span>Đã phát: {(totalClaimed * AIRDROP_AMOUNT).toLocaleString()} CAMLY</span>
                <span>{claimProgress.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(claimProgress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {totalClaimed.toLocaleString()} người đã nhận
                </span>
                <span>Tổng: 1,000,000,000 CAMLY</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 'verify' && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-500 mb-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Xác minh tuổi</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Airdrop này chỉ dành cho trẻ em từ 3-18 tuổi để đảm bảo quà đến đúng người.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Năm sinh của bạn</Label>
                    <Input
                      type="number"
                      placeholder="VD: 2010"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <Button
                    onClick={verifyAge}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                    disabled={!birthYear || !user}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Xác minh tuổi
                  </Button>

                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      Bạn cần đăng nhập để nhận airdrop
                    </p>
                  )}
                </motion.div>
              )}

              {step === 'claim' && (
                <motion.div
                  key="claim"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20">
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      {AIRDROP_AMOUNT.toLocaleString()}
                    </div>
                    <div className="text-lg font-semibold text-muted-foreground">CAMLY</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      ≈ $0.04 USD • BSC Mainnet
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Địa chỉ ví BSC của bạn</Label>
                    <Input
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Nhập địa chỉ ví BNB Chain (BSC) để nhận CAMLY
                    </p>
                  </div>

                  <Button
                    onClick={handleClaimAirdrop}
                    disabled={isLoading || !walletAddress}
                    className="w-full h-14 text-lg bg-gradient-to-r from-yellow-500 to-orange-500"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5 mr-2" />
                        Nhận {AIRDROP_AMOUNT.toLocaleString()} CAMLY
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-green-500">
                    Nhận airdrop thành công! 🎉
                  </h3>
                  <p className="text-muted-foreground">
                    {AIRDROP_AMOUNT.toLocaleString()} CAMLY đã được cộng vào ví của bạn.
                    Token sẽ được gửi đến ví BSC của bạn trong 24-48 giờ.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    Đóng
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-xs text-center text-muted-foreground">
              💝 Mỗi tài khoản chỉ được nhận 1 lần. CAMLY sẽ được gửi đến ví BSC của bạn.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
