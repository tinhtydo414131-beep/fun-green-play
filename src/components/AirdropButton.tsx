import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Loader2, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";

const AIRDROP_AMOUNT = 10000; // 10,000 CAMLY per child

interface AirdropButtonProps {
  variant?: "default" | "compact";
  className?: string;
}

export const AirdropButton = ({ variant = "default", className }: AirdropButtonProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [totalClaimed, setTotalClaimed] = useState(0);

  const isVN = i18n.language === 'vi';

  const checkIfClaimed = async () => {
    if (!user) return false;
    
    const { data } = await supabase
      .from('web3_reward_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('reward_type', 'global_airdrop')
      .maybeSingle();
    
    return !!data;
  };

  const handleOpenAirdrop = async () => {
    if (!user) {
      toast.error(isVN ? "Vui lòng đăng nhập trước!" : "Please login first!");
      return;
    }

    setIsOpen(true);
    
    // Check if already claimed
    const alreadyClaimed = await checkIfClaimed();
    setClaimed(alreadyClaimed);

    // Get total claims count
    const { count } = await supabase
      .from('web3_reward_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('reward_type', 'global_airdrop');
    
    setTotalClaimed(count || 0);
  };

  const handleClaimAirdrop = async () => {
    if (!user || claimed) return;
    
    setIsLoading(true);
    
    try {
      // Check eligibility again
      const alreadyClaimed = await checkIfClaimed();
      if (alreadyClaimed) {
        setClaimed(true);
        toast.error(isVN ? "Bạn đã nhận airdrop rồi!" : "You've already claimed!");
        setIsLoading(false);
        return;
      }

      // Get current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      const currentBalance = profile?.wallet_balance || 0;

      // Update balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: currentBalance + AIRDROP_AMOUNT })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: txError } = await supabase
        .from('web3_reward_transactions')
        .insert({
          user_id: user.id,
          amount: AIRDROP_AMOUNT,
          reward_type: 'global_airdrop',
          description: 'Global CAMLY Airdrop for Children 🎁'
        });

      if (txError) throw txError;

      // Success!
      setClaimed(true);
      setTotalClaimed(prev => prev + 1);
      
      // Fire confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF6B35', '#4ECDC4', '#FFE66D', '#FF69B4']
      });

      toast.success(
        isVN 
          ? `🎉 Bạn nhận được ${AIRDROP_AMOUNT.toLocaleString()} CAMLY!` 
          : `🎉 You received ${AIRDROP_AMOUNT.toLocaleString()} CAMLY!`
      );

    } catch (error) {
      console.error('Airdrop error:', error);
      toast.error(isVN ? "Có lỗi xảy ra!" : "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {variant === "compact" ? (
        <Button
          onClick={handleOpenAirdrop}
          size="sm"
          className={`gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 ${className}`}
        >
          <Gift className="w-4 h-4" />
          <span className="hidden sm:inline">{isVN ? 'Airdrop' : 'Airdrop'}</span>
        </Button>
      ) : (
        <motion.button
          onClick={handleOpenAirdrop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all ${className}`}
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>{isVN ? 'Nhận Airdrop' : 'Claim Airdrop'}</span>
          <Gift className="w-5 h-5" />
        </motion.button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Gift className="w-7 h-7 text-pink-500" />
              {isVN ? 'Global CAMLY Airdrop' : 'Global CAMLY Airdrop'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isVN 
                ? '🎁 Quà tặng đặc biệt dành cho tất cả trẻ em dưới 18 tuổi!' 
                : '🎁 Special gift for all children under 18!'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Airdrop Amount */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-2xl border border-pink-500/20"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                {AIRDROP_AMOUNT.toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-muted-foreground">CAMLY</div>
              <div className="text-sm text-muted-foreground mt-2">
                {isVN ? 'Giá trị tương đương' : 'Equivalent value'}: ~$0.04 USD
              </div>
            </motion.div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{totalClaimed.toLocaleString()} {isVN ? 'đã nhận' : 'claimed'}</span>
              </div>
            </div>

            {/* Claim Button */}
            <AnimatePresence mode="wait">
              {claimed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-2 text-green-500"
                >
                  <CheckCircle className="w-12 h-12" />
                  <span className="font-semibold">
                    {isVN ? 'Bạn đã nhận thành công!' : 'Successfully claimed!'}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    onClick={handleClaimAirdrop}
                    disabled={isLoading}
                    className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isVN ? 'Đang xử lý...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        {isVN ? 'Nhận Ngay!' : 'Claim Now!'}
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info */}
            <p className="text-xs text-center text-muted-foreground">
              {isVN 
                ? '💝 Mỗi tài khoản chỉ được nhận 1 lần. CAMLY sẽ được cộng vào ví của bạn ngay lập tức.'
                : '💝 Each account can only claim once. CAMLY will be added to your wallet instantly.'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
