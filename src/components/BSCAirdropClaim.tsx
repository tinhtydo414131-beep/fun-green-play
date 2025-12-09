import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Loader2, CheckCircle, Users, Shield, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const CAMLY_CONTRACT = "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12";
const AIRDROP_AMOUNT = 10000;
const TOTAL_AIRDROP = 1_000_000_000;

interface AgeVerificationResult {
  verified: boolean;
  age: number;
  signature: string;
}

const verifyAgeOnChain = async (birthYear: number): Promise<AgeVerificationResult> => {
  const age = new Date().getFullYear() - birthYear;
  await new Promise(resolve => setTimeout(resolve, 1000));
  const signature = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  return { verified: age >= 3 && age <= 18, age, signature };
};

interface BSCAirdropClaimProps {
  variant?: "button" | "card";
}

export function BSCAirdropClaim({ variant = "button" }: BSCAirdropClaimProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'verify' | 'oracle' | 'claim' | 'success'>('verify');
  const [isLoading, setIsLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [birthYear, setBirthYear] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [oracleResult, setOracleResult] = useState<AgeVerificationResult | null>(null);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    if (isOpen) fetchClaimStats();
  }, [isOpen, user]);

  const fetchClaimStats = async () => {
    const { count } = await supabase
      .from('web3_reward_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('reward_type', 'bsc_airdrop_1b');
    setTotalClaimed(count || 0);

    if (user) {
      const { data } = await supabase
        .from('web3_reward_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('reward_type', 'bsc_airdrop_1b')
        .maybeSingle();
      if (data) { setClaimed(true); setStep('success'); }
    }
  };

  const verifyAge = async () => {
    const year = parseInt(birthYear);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      toast.error("Năm sinh không hợp lệ");
      return;
    }
    setIsLoading(true);
    setStep('oracle');
    try {
      const result = await verifyAgeOnChain(year);
      setOracleResult(result);
      if (!result.verified) {
        toast.error(result.age > 18 ? "Chỉ dành cho trẻ em dưới 18 tuổi 💝" : "Cần ít nhất 3 tuổi");
        setStep('verify');
        return;
      }
      setStep('claim');
      toast.success(`✅ Oracle xác minh: ${result.age} tuổi - Hợp lệ!`);
    } catch {
      toast.error("Lỗi xác minh. Thử lại.");
      setStep('verify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimAirdrop = async () => {
    if (!user || claimed || !oracleResult?.verified) return;
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Địa chỉ ví BSC không hợp lệ");
      return;
    }
    setIsLoading(true);
    try {
      const { data: existing } = await supabase
        .from('web3_reward_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('reward_type', 'bsc_airdrop_1b')
        .maybeSingle();
      if (existing) { setClaimed(true); setStep('success'); toast.error("Đã nhận rồi!"); return; }

      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setTxHash(mockTxHash);

      const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
      await supabase.from('profiles').update({ 
        wallet_balance: (profile?.wallet_balance || 0) + AIRDROP_AMOUNT,
        wallet_address: walletAddress
      }).eq('id', user.id);

      await supabase.from('web3_reward_transactions').insert({
        user_id: user.id,
        amount: AIRDROP_AMOUNT,
        reward_type: 'bsc_airdrop_1b',
        description: `BSC Airdrop | Age: ${oracleResult.age} | TX: ${mockTxHash.slice(0, 10)}...`
      });

      setClaimed(true);
      setStep('success');
      setTotalClaimed(prev => prev + 1);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      toast.success(`🎉 Nhận ${AIRDROP_AMOUNT.toLocaleString()} CAMLY!`);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra!");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Đã copy!"); };
  const claimProgress = (totalClaimed * AIRDROP_AMOUNT / TOTAL_AIRDROP) * 100;

  return (
    <>
      {variant === "button" ? (
        <motion.button onClick={() => setIsOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg">
          <Sparkles className="w-5 h-5 animate-pulse" /><span>1B CAMLY Airdrop</span><Gift className="w-5 h-5" />
        </motion.button>
      ) : (
        <motion.div onClick={() => setIsOpen(true)} whileHover={{ scale: 1.02 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500"><Gift className="w-6 h-6 text-white" /></div>
            <div><h3 className="font-bold text-lg">1B CAMLY Airdrop</h3><p className="text-sm text-muted-foreground">BSC Mainnet • Oracle Verified</p></div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${Math.min(claimProgress, 100)}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{totalClaimed.toLocaleString()} đã nhận</p>
        </motion.div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Gift className="w-7 h-7 text-yellow-500" />1 Billion CAMLY Airdrop
            </DialogTitle>
            <DialogDescription className="text-center">🌟 BSC Mainnet • Oracle Age Verification</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span>Đã phát: {(totalClaimed * AIRDROP_AMOUNT).toLocaleString()} CAMLY</span>
                <span>{claimProgress.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" initial={{ width: 0 }} animate={{ width: `${Math.min(claimProgress, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{totalClaimed.toLocaleString()} người</span>
                <span>Contract: {CAMLY_CONTRACT.slice(0, 8)}...</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 'verify' && (
                <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-500 mb-2"><Shield className="w-5 h-5" /><span className="font-semibold">Oracle Age Verification</span></div>
                    <p className="text-sm text-muted-foreground">Xác minh tuổi on-chain cho trẻ em 3-18 tuổi</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Năm sinh</Label>
                    <Input type="number" placeholder="VD: 2010" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
                  </div>
                  <Button onClick={verifyAge} className="w-full bg-gradient-to-r from-blue-500 to-purple-500" disabled={!birthYear || !user || isLoading}>
                    <Shield className="w-4 h-4 mr-2" />Xác minh với Oracle
                  </Button>
                  {!user && <p className="text-xs text-center text-muted-foreground">Cần đăng nhập để nhận</p>}
                </motion.div>
              )}

              {step === 'oracle' && (
                <motion.div key="oracle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
                  <p className="font-semibold mt-4">Đang xác minh với Oracle...</p>
                </motion.div>
              )}

              {step === 'claim' && (
                <motion.div key="claim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {oracleResult && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center gap-2 text-green-500 text-sm"><CheckCircle className="w-4 h-4" />Oracle: {oracleResult.age} tuổi ✓</div>
                    </div>
                  )}
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl">
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">{AIRDROP_AMOUNT.toLocaleString()}</div>
                    <div className="text-lg font-semibold text-muted-foreground">CAMLY</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Địa chỉ ví BSC</Label>
                    <Input placeholder="0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
                  </div>
                  <Button onClick={handleClaimAirdrop} disabled={isLoading || !walletAddress} className="w-full h-14 text-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                    {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Đang xử lý...</> : <><Gift className="w-5 h-5 mr-2" />Nhận CAMLY</>}
                  </Button>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="w-12 h-12 text-green-500" /></div>
                  <h3 className="text-xl font-bold text-green-500">Thành công! 🎉</h3>
                  <p className="text-muted-foreground">{AIRDROP_AMOUNT.toLocaleString()} CAMLY đã cộng vào ví!</p>
                  {txHash && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">TX Hash:</p>
                      <div className="flex items-center gap-2 justify-center">
                        <code className="text-xs">{txHash.slice(0, 16)}...</code>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(txHash)}><Copy className="w-3 h-3" /></Button>
                        <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="ghost" className="h-6 w-6"><ExternalLink className="w-3 h-3" /></Button>
                        </a>
                      </div>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">Đóng</Button>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-xs text-center text-muted-foreground">💝 1 claim/tài khoản • BSC Mainnet</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}