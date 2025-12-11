import { useEffect, useRef, useCallback } from 'react';
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

interface UseTransactionNotificationsOptions {
  onNewTransaction?: () => void;
}

export const useTransactionNotifications = (
  userId: string | undefined,
  options?: UseTransactionNotificationsOptions
) => {
  const notifiedTransactionsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const handleNewTransaction = useCallback((transaction: Transaction) => {
    // Check if we've already notified about this transaction
    if (notifiedTransactionsRef.current.has(transaction.id)) {
      return;
    }

    // Mark as notified
    notifiedTransactionsRef.current.add(transaction.id);
    
    // Save to localStorage
    try {
      localStorage.setItem(
        'notified_transactions',
        JSON.stringify(Array.from(notifiedTransactionsRef.current))
      );
    } catch (e) {
      console.error('Error saving notified transactions:', e);
    }

    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Audio play failed (user interaction may be required):', err);
      });
    }

    // Show toast notification
    const amountFormatted = Number(transaction.amount).toLocaleString('en-US', { 
      minimumFractionDigits: 4, 
      maximumFractionDigits: 4 
    });
    
    toast.success(
      `💰 Money Received! +${amountFormatted} ${transaction.token_type}`,
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

    // Trigger callback to refresh transaction list
    if (options?.onNewTransaction) {
      setTimeout(() => {
        options.onNewTransaction?.();
      }, 500);
    }
  }, [options]);

  useEffect(() => {
    if (!userId) return;

    // Initialize audio
    audioRef.current = new Audio('https://media.funplanet.life/audio/rich1-5.mp3');
    audioRef.current.volume = 0.7;

    // Load notified transactions from localStorage
    const stored = localStorage.getItem('notified_transactions');
    if (stored) {
      try {
        notifiedTransactionsRef.current = new Set(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading notified transactions:', e);
      }
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
          handleNewTransaction(transaction);
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
  }, [userId, handleNewTransaction]);
};
