import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getCurrentTier } from '@/utils/referralTiers';

export const useLegendStatus = () => {
  const { user } = useAuth();
  const [isLegend, setIsLegend] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLegendStatus = async () => {
      if (!user) {
        setIsLegend(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data: rewards } = await supabase
          .from('web3_rewards')
          .select('total_referrals')
          .eq('user_id', user.id)
          .maybeSingle();

        const totalReferrals = rewards?.total_referrals || 0;
        const currentTier = getCurrentTier(totalReferrals);
        
        setIsLegend(currentTier.id === 'legend');
      } catch (error) {
        console.error('Error checking legend status:', error);
        setIsLegend(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLegendStatus();
  }, [user]);

  return { isLegend, isLoading };
};
