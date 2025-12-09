import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Loader2, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";

const MINT_COST = 1000; // 1,000 CAMLY to mint

interface NFTMintButtonProps {
  achievementType: string;
  achievementTitle: string;
  achievementImage?: string;
  className?: string;
}

export const NFTMintButton = ({ 
  achievementType, 
  achievementTitle,
  achievementImage,
  className 
}: NFTMintButtonProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [minted, setMinted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const isVN = i18n.language === 'vi';

  const checkIfMinted = async () => {
    if (!user) return false;
    
    const { data } = await supabase
      .from('minted_achievement_nfts')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_type', achievementType)
      .maybeSingle();
    
    return !!data;
  };

  const handleOpenMint = async () => {
    if (!user) {
      toast.error(isVN ? "Vui lòng đăng nhập trước!" : "Please login first!");
      return;
    }

    setIsOpen(true);
    
    // Check if already minted
    const alreadyMinted = await checkIfMinted();
    setMinted(alreadyMinted);
  };

  const handleMint = async () => {
    if (!user || minted) return;
    
    setIsLoading(true);
    
    try {
      // Check CAMLY balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance, wallet_address')
        .eq('id', user.id)
        .single();

      if (!profile?.wallet_address) {
        toast.error(isVN ? "Vui lòng kết nối ví trước!" : "Please connect wallet first!");
        setIsLoading(false);
        return;
      }

      const currentBalance = profile?.wallet_balance || 0;
      
      if (currentBalance < MINT_COST) {
        toast.error(
          isVN 
            ? `Cần ${MINT_COST.toLocaleString()} CAMLY để mint! Bạn có ${currentBalance.toLocaleString()}.`
            : `Need ${MINT_COST.toLocaleString()} CAMLY to mint! You have ${currentBalance.toLocaleString()}.`
        );
        setIsLoading(false);
        return;
      }

      // Check if already minted
      const alreadyMinted = await checkIfMinted();
      if (alreadyMinted) {
        setMinted(true);
        toast.error(isVN ? "NFT này đã được mint!" : "This NFT is already minted!");
        setIsLoading(false);
        return;
      }

      // Deduct CAMLY (burn)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: currentBalance - MINT_COST })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Generate mock tx hash (in real implementation, this would be from actual blockchain)
      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const mockTokenId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Record minted NFT
      const { error: mintError } = await supabase
        .from('minted_achievement_nfts')
        .insert({
          user_id: user.id,
          achievement_type: achievementType,
          wallet_address: profile.wallet_address,
          tx_hash: mockTxHash,
          token_id: mockTokenId
        });

      if (mintError) throw mintError;

      // Record burn transaction
      await supabase
        .from('web3_reward_transactions')
        .insert({
          user_id: user.id,
          amount: -MINT_COST,
          reward_type: 'nft_mint_burn',
          description: `Burned ${MINT_COST} CAMLY to mint ${achievementTitle} NFT`
        });

      // Success!
      setMinted(true);
      setTxHash(mockTxHash);
      
      // Fire confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9B59B6', '#3498DB', '#E74C3C', '#F1C40F']
      });

      toast.success(
        isVN 
          ? `🎨 NFT ${achievementTitle} đã được mint thành công!` 
          : `🎨 ${achievementTitle} NFT minted successfully!`
      );

    } catch (error) {
      console.error('Mint error:', error);
      toast.error(isVN ? "Có lỗi xảy ra!" : "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenMint}
        variant="outline"
        size="sm"
        className={`gap-2 border-purple-500/50 text-purple-500 hover:bg-purple-500/10 ${className}`}
      >
        <Award className="w-4 h-4" />
        {isVN ? 'Mint NFT' : 'Mint NFT'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-purple-500" />
              {isVN ? 'Mint Achievement NFT' : 'Mint Achievement NFT'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isVN 
                ? '🏆 Soulbound NFT - Chứng chỉ thành tựu không thể chuyển nhượng' 
                : '🏆 Soulbound NFT - Non-transferable achievement certificate'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* NFT Preview */}
            <div className="relative mx-auto w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/30">
              {achievementImage ? (
                <img 
                  src={achievementImage} 
                  alt={achievementTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Award className="w-20 h-20 text-purple-500/50" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white text-sm font-semibold text-center">{achievementTitle}</p>
              </div>
              {/* Soulbound badge */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                SOULBOUND
              </div>
            </div>

            {/* Cost Info */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                {isVN ? 'Chi phí mint (burn)' : 'Mint cost (burn)'}
              </p>
              <p className="text-2xl font-bold text-purple-500">
                {MINT_COST.toLocaleString()} CAMLY
              </p>
            </div>

            {/* Mint Button */}
            {minted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">
                    {isVN ? 'NFT đã được mint!' : 'NFT Minted!'}
                  </span>
                </div>
                {txHash && (
                  <a
                    href={`https://bscscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-sm text-blue-500 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {isVN ? 'Xem trên BscScan' : 'View on BscScan'}
                  </a>
                )}
              </motion.div>
            ) : (
              <Button
                onClick={handleMint}
                disabled={isLoading}
                className="w-full h-12 gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isVN ? 'Đang mint...' : 'Minting...'}
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    {isVN ? 'Mint NFT' : 'Mint NFT'}
                  </>
                )}
              </Button>
            )}

            {/* Info */}
            <p className="text-xs text-center text-muted-foreground">
              {isVN 
                ? '💡 Soulbound NFT không thể chuyển nhượng hoặc bán. Đây là chứng chỉ thành tựu cá nhân của bạn.'
                : '💡 Soulbound NFTs cannot be transferred or sold. This is your personal achievement certificate.'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
