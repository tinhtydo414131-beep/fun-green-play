import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Medal, Users, Coins, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { getCurrentTier } from '@/utils/referralTiers';
import { startOfWeek, format } from 'date-fns';

interface ReferralLeaderboardEntry {
  user_id: string;
  total_referrals: number;
  referral_earnings: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface WeeklyReferralEntry extends ReferralLeaderboardEntry {
  weekly_referrals: number;
}

export const ReferralLeaderboard = () => {
  const { user } = useAuth();
  const [allTimeData, setAllTimeData] = useState<ReferralLeaderboardEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyReferralEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<{ allTime: number | null; weekly: number | null }>({
    allTime: null,
    weekly: null,
  });

  useEffect(() => {
    fetchLeaderboards();
  }, [user]);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      // Fetch all-time leaderboard
      const { data: allTime, error: allTimeError } = await supabase
        .from('web3_rewards')
        .select(`
          user_id,
          total_referrals,
          referral_earnings,
          profiles (
            username,
            avatar_url
          )
        `)
        .gt('total_referrals', 0)
        .order('total_referrals', { ascending: false })
        .limit(50);

      if (allTimeError) throw allTimeError;
      setAllTimeData(allTime || []);

      // Calculate user's all-time rank
      if (user && allTime) {
        const rank = allTime.findIndex(entry => entry.user_id === user.id);
        setUserRank(prev => ({ ...prev, allTime: rank !== -1 ? rank + 1 : null }));
      }

      // Fetch weekly referrals
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const { data: weeklyReferrals, error: weeklyError } = await supabase
        .from('referrals')
        .select('referrer_id')
        .gte('completed_at', weekStart.toISOString());

      if (weeklyError) throw weeklyError;

      // Count weekly referrals per user
      const weeklyCount: Record<string, number> = {};
      weeklyReferrals?.forEach(ref => {
        weeklyCount[ref.referrer_id] = (weeklyCount[ref.referrer_id] || 0) + 1;
      });

      // Create weekly leaderboard with user details
      const weeklyUserIds = Object.keys(weeklyCount);
      if (weeklyUserIds.length > 0) {
        const { data: weeklyUsers } = await supabase
          .from('web3_rewards')
          .select(`
            user_id,
            total_referrals,
            referral_earnings,
            profiles (
              username,
              avatar_url
            )
          `)
          .in('user_id', weeklyUserIds);

        const weeklyLeaderboard = (weeklyUsers || [])
          .map(u => ({
            ...u,
            weekly_referrals: weeklyCount[u.user_id] || 0,
          }))
          .sort((a, b) => b.weekly_referrals - a.weekly_referrals)
          .slice(0, 50);

        setWeeklyData(weeklyLeaderboard);

        // Calculate user's weekly rank
        if (user) {
          const rank = weeklyLeaderboard.findIndex(entry => entry.user_id === user.id);
          setUserRank(prev => ({ ...prev, weekly: rank !== -1 ? rank + 1 : null }));
        }
      }
    } catch (error) {
      console.error('Error fetching referral leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-6 h-6 text-yellow-500" />
          </motion.div>
        );
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">
            {rank}
          </span>
        );
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border-yellow-500/50 shadow-lg shadow-yellow-500/20';
      case 2:
        return 'bg-gradient-to-r from-gray-300/30 to-gray-400/30 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-500/50';
      default:
        return 'bg-muted/30 border-border/50';
    }
  };

  const renderLeaderboardItem = (
    entry: ReferralLeaderboardEntry | WeeklyReferralEntry,
    index: number,
    showWeekly = false
  ) => {
    const rank = index + 1;
    const isCurrentUser = user?.id === entry.user_id;
    const tier = getCurrentTier(entry.total_referrals);
    const referralCount = showWeekly 
      ? (entry as WeeklyReferralEntry).weekly_referrals 
      : entry.total_referrals;

    return (
      <motion.div
        key={entry.user_id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${getRankStyle(rank)} ${
          isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
      >
        {/* Rank with special effects for top 3 */}
        <div className="w-10 flex justify-center relative">
          {rank <= 3 && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ 
                boxShadow: rank === 1 
                  ? ['0 0 10px #fbbf24', '0 0 20px #fbbf24', '0 0 10px #fbbf24']
                  : undefined 
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {getRankIcon(rank)}
        </div>

        {/* Avatar with tier badge */}
        <div className="relative">
          <Avatar className={`w-12 h-12 border-2 ${rank <= 3 ? 'border-primary' : 'border-border'}`}>
            <AvatarImage src={entry.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {entry.profiles?.username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          {tier.id !== 'none' && (
            <span className="absolute -bottom-1 -right-1 text-lg">{tier.icon}</span>
          )}
        </div>

        {/* Username and tier */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate flex items-center gap-1">
            {entry.profiles?.username || 'Anonymous'}
            {isCurrentUser && <span className="text-primary text-xs">(Bạn)</span>}
            {rank === 1 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </motion.span>
            )}
          </p>
          {tier.id !== 'none' && (
            <Badge variant="secondary" className={`text-xs ${tier.color}`}>
              {tier.badge}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="text-right space-y-1">
          <div className="flex items-center gap-1 justify-end">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {referralCount}
            </span>
          </div>
          <div className="flex items-center gap-1 justify-end text-sm">
            <Coins className="w-3 h-3 text-yellow-500" />
            <span className="text-muted-foreground">
              {Number(entry.referral_earnings).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Top Người Mời Bạn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="weekly">🔥 Tuần này</TabsTrigger>
            <TabsTrigger value="alltime">🏆 Tất cả</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-2">
            {userRank.weekly && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4"
              >
                <p className="text-sm text-center">
                  🎯 Hạng của bạn tuần này: <span className="font-bold text-primary">#{userRank.weekly}</span>
                </p>
              </motion.div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : weeklyData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Chưa có ai mời bạn tuần này 🌱
              </p>
            ) : (
              weeklyData.map((entry, index) => renderLeaderboardItem(entry, index, true))
            )}
          </TabsContent>

          <TabsContent value="alltime" className="space-y-2">
            {userRank.allTime && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4"
              >
                <p className="text-sm text-center">
                  🏆 Hạng của bạn: <span className="font-bold text-primary">#{userRank.allTime}</span>
                </p>
              </motion.div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : allTimeData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Chưa có dữ liệu 🌱
              </p>
            ) : (
              allTimeData.map((entry, index) => renderLeaderboardItem(entry, index))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
