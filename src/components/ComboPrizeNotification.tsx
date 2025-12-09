import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Prize {
  id: string;
  period_type: string;
  highest_combo: number;
  prize_amount: number;
  period_start: string;
  period_end: string;
  claimed: boolean;
}

export const ComboPrizeNotification = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("combo_period_winners")
        .select("*")
        .eq("user_id", user.id)
        .eq("claimed", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error("Error fetching prizes:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimPrize = async (prizeId: string, amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Cộng tiền vào ví
      const { error: walletError } = await supabase.rpc('update_wallet_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_operation: 'add'
      });
      
      if (walletError) throw walletError;

      // 2. Ghi log giao dịch
      await supabase.from("camly_coin_transactions").insert({
        user_id: user.id,
        amount: amount,
        transaction_type: "combo_prize",
        description: `Nhận thưởng combo prize`
      });

      // 3. Đánh dấu đã claim
      const { error: claimError } = await supabase
        .from("combo_period_winners")
        .update({ claimed: true })
        .eq("id", prizeId);

      if (claimError) throw claimError;

      toast({
        title: "🎉 Đã nhận thưởng!",
        description: `+${amount.toLocaleString()} CAMLY đã được cộng vào ví!`,
      });

      // Remove from list
      setPrizes(prizes.filter((p) => p.id !== prizeId));
    } catch (error) {
      console.error("Error claiming prize:", error);
      toast({
        title: "Lỗi",
        description: "Không thể nhận thưởng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (loading || prizes.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {prizes.map((prize) => (
        <Card
          key={prize.id}
          className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50 animate-pulse-subtle"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-lg">
                    Chúc mừng! Bạn đã thắng {prize.period_type === 'daily' ? 'Daily' : 'Weekly'} Prize!
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {prize.highest_combo}x combo • {prize.prize_amount} tokens
                </p>
              </div>
            </div>
            <Button
              onClick={() => claimPrize(prize.id, prize.prize_amount)}
              className="font-bold"
            >
              <Gift className="w-4 h-4 mr-2" />
              Nhận thưởng
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
