import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCamly } from '@/lib/web3-bsc';

export function CharityCounter() {
  const [totalDonated, setTotalDonated] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    fetchCharityStats();
  }, []);

  // Animate counter
  useEffect(() => {
    if (totalDonated === 0) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = totalDonated / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= totalDonated) {
        setDisplayValue(totalDonated);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalDonated]);

  const fetchCharityStats = async () => {
    try {
      const { data, error } = await supabase
        .from('charity_wallet_stats')
        .select('total_donated')
        .limit(1)
        .single();

      if (!error && data) {
        setTotalDonated(Number(data.total_donated));
      }
    } catch (error) {
      console.error('Error fetching charity stats:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-pink-500/30"
    >
      <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
      <span className="text-sm font-medium text-muted-foreground">
        Charity: <span className="font-bold text-pink-500">{formatCamly(displayValue)}</span> CAMLY
      </span>
    </motion.div>
  );
}
