import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const DELETE_REWARD = 10000; // 10K CAMLY

export function useGameTrash() {
  const [isDeleting, setIsDeleting] = useState(false);

  const moveToTrash = useCallback(async (
    gameId: string, 
    reason: string, 
    detail: string,
    userId: string
  ): Promise<boolean> => {
    setIsDeleting(true);
    
    try {
      // Update game with soft delete
      const { error: updateError } = await supabase
        .from('uploaded_games')
        .update({
          deleted_at: new Date().toISOString(),
          delete_reason: reason,
          delete_reason_detail: detail || null
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      // Award 10K CAMLY for cleanup
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (!profileError && profile) {
        const newBalance = (profile.wallet_balance || 0) + DELETE_REWARD;
        
        await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', userId);

        // Record the transaction
        await supabase
          .from('camly_coin_transactions')
          .insert({
            user_id: userId,
            amount: DELETE_REWARD,
            transaction_type: 'game_cleanup',
            description: 'Phần thưởng dọn dẹp kho game'
          });
      }

      // Celebration effects
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4CAF50']
      });

      toast.success("🎉 Cảm ơn bạn đã dọn dẹp kho báu! +" + DELETE_REWARD.toLocaleString() + " CAMLY!", { duration: 5000 });

      return true;
    } catch (error: any) {
      console.error('Move to trash error:', error);
      toast.error(error.message || "Không thể đưa game vào thùng rác");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const permanentDelete = useCallback(async (gameId: string): Promise<boolean> => {
    try {
      // Get game info first
      const { data: game, error: fetchError } = await supabase
        .from('uploaded_games')
        .select('game_file_path, thumbnail_path')
        .eq('id', gameId)
        .single();

      if (fetchError) throw fetchError;

      // Delete files from storage
      if (game?.game_file_path) {
        await supabase.storage
          .from('uploaded-games')
          .remove([game.game_file_path]);
      }

      if (game?.thumbnail_path) {
        await supabase.storage
          .from('uploaded-games')
          .remove([game.thumbnail_path]);
      }

      // Delete database record
      const { error: deleteError } = await supabase
        .from('uploaded_games')
        .delete()
        .eq('id', gameId);

      if (deleteError) throw deleteError;

      return true;
    } catch (error: any) {
      console.error('Permanent delete error:', error);
      toast.error(error.message || "Không thể xóa vĩnh viễn game");
      return false;
    }
  }, []);

  return {
    moveToTrash,
    permanentDelete,
    isDeleting
  };
}
