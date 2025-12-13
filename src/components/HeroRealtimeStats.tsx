import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, Trophy, TrendingUp, Users, Gamepad2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface RealtimeStats {
  totalGames: number;
  totalPlayers: number;
  totalCamlyEarned: number;
  onlineNow: number;
}

export const HeroRealtimeStats = () => {
  const { i18n } = useTranslation();
  const isVN = i18n.language === 'vi';
  
  const [stats, setStats] = useState<RealtimeStats>({
    totalGames: 0,
    totalPlayers: 0,
    totalCamlyEarned: 0,
    onlineNow: 0
  });
  const [animatedStats, setAnimatedStats] = useState(stats);

  useEffect(() => {
    fetchStats();
    
    // Subscribe to realtime updates
    const gamesChannel = supabase
      .channel('stats_games')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'uploaded_games' },
        () => fetchStats()
      )
      .subscribe();

    const usersChannel = supabase
      .channel('stats_users')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gamesChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);

  // Animate number changes
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 30;
    const stepDuration = duration / steps;

    const startStats = { ...animatedStats };
    const endStats = { ...stats };
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedStats({
        totalGames: Math.round(startStats.totalGames + (endStats.totalGames - startStats.totalGames) * progress),
        totalPlayers: Math.round(startStats.totalPlayers + (endStats.totalPlayers - startStats.totalPlayers) * progress),
        totalCamlyEarned: Math.round(startStats.totalCamlyEarned + (endStats.totalCamlyEarned - startStats.totalCamlyEarned) * progress),
        onlineNow: Math.round(startStats.onlineNow + (endStats.onlineNow - startStats.onlineNow) * progress)
      });

      if (step >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

  const fetchStats = async () => {
    try {
      // Count games
      const { count: gamesCount } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: uploadedCount } = await supabase
        .from('uploaded_games')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Count users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Sum wallet balances
      const { data: balanceData } = await supabase
        .from('profiles')
        .select('wallet_balance');

      const totalBalance = balanceData?.reduce((sum, p) => sum + (p.wallet_balance || 0), 0) || 0;

      // Random online count (simulation)
      const onlineCount = Math.floor(Math.random() * 50) + 20;

      setStats({
        totalGames: (gamesCount || 0) + (uploadedCount || 0),
        totalPlayers: usersCount || 0,
        totalCamlyEarned: totalBalance,
        onlineNow: onlineCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const statItems = [
    {
      icon: Gamepad2,
      value: animatedStats.totalGames,
      label: isVN ? 'Trò chơi' : 'Games',
      color: 'from-blue-500 to-cyan-500',
      emoji: '🎮'
    },
    {
      icon: Users,
      value: animatedStats.totalPlayers,
      label: isVN ? 'Người chơi' : 'Players',
      color: 'from-green-500 to-emerald-500',
      emoji: '👥'
    },
    {
      icon: Diamond,
      value: animatedStats.totalCamlyEarned,
      label: 'CAMLY',
      color: 'from-yellow-500 to-orange-500',
      emoji: '💎'
    },
    {
      icon: Star,
      value: animatedStats.onlineNow,
      label: isVN ? 'Đang online' : 'Online now',
      color: 'from-pink-500 to-rose-500',
      emoji: '🌟',
      pulse: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl opacity-20 blur group-hover:opacity-30 transition-opacity`} />
          
          <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 text-center hover:border-primary/40 transition-all">
            {/* Icon */}
            <motion.div
              animate={item.pulse ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: item.pulse ? Infinity : 0 }}
              className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center`}
            >
              <item.icon className="w-5 h-5 text-white" />
            </motion.div>

            {/* Value */}
            <AnimatePresence mode="wait">
              <motion.p
                key={animatedStats[item.label as keyof RealtimeStats] || item.value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                {formatNumber(item.value)}
              </motion.p>
            </AnimatePresence>

            {/* Label */}
            <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </p>

            {/* Pulse indicator for online */}
            {item.pulse && (
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HeroRealtimeStats;
