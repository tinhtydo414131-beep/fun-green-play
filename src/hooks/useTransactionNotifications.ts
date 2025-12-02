import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface Transaction {
  id: string;
  amount: number;
  token_type: string;
  to_user_id: string;
  transaction_hash: string;
  created_at: string;
}

export const useTransactionNotifications = (userId: string | undefined) => {
  const notifiedTransactionsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Initialize audio
    audioRef.current = new Audio('/audio/rich1-5.mp3');
    audioRef.current.volume = 0.7;

    // Load notified transactions from localStorage
    const stored = localStorage.getItem('notified_transactions');
    if (stored) {
      notifiedTransactionsRef.current = new Set(JSON.parse(stored));
    }

    // Subscribe to new transactions where user is the recipient
    const channel = supabase
      .channel('wallet_transactions_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `to_user_id=eq.${userId}`
        },
        (payload) => {
          const transaction = payload.new as Transaction;
          
          // Check if we've already notified about this transaction
          if (notifiedTransactionsRef.current.has(transaction.id)) {
            return;
          }

          // Mark as notified
          notifiedTransactionsRef.current.add(transaction.id);
          
          // Save to localStorage
          localStorage.setItem(
            'notified_transactions',
            JSON.stringify(Array.from(notifiedTransactionsRef.current))
          );

          // Play sound
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => {
              console.log('Audio play failed:', err);
            });
          }

          // Show toast notification with animation
          toast.success(
            `💰 Money Received! +${Number(transaction.amount).toLocaleString('en-US', { 
              minimumFractionDigits: 4, 
              maximumFractionDigits: 4 
            })} ${transaction.token_type}`,
            {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }
            }
          );

          // Trigger confetti celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#4ade80', '#86efac']
          });

          console.log('🎉 New transaction received:', transaction);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [userId]);
};
