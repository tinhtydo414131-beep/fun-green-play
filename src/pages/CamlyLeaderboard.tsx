import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Trophy, Coins, Flame, Medal, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  user_id: string;
  camly_balance: number;
  daily_streak: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export default function CamlyLeaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('web3_rewards')
        .select(`
          user_id,
          camly_balance,
          daily_streak,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('camly_balance', { ascending: false })
        .limit(50);

      if (error) throw error;

      setLeaderboard(data || []);

      // Find user's rank
      if (user && data) {
        const rank = data.findIndex(entry => entry.user_id === user.id);
        setUserRank(rank !== -1 ? rank + 1 : null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-amber-600/30';
      default:
        return 'bg-muted/30 border-border/50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-24 md:pb-12 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              CAMLY Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground">Top earners across all users</p>
          </div>
        </div>

        {/* User's rank card */}
        {user && userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Rank</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">#{userRank}</span>
                    <span className="text-sm text-muted-foreground">of {leaderboard.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top 50 Earners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data yet</p>
            ) : (
              leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = user?.id === entry.user_id;
                
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBg(rank)} ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex justify-center">
                      {getRankIcon(rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-10 h-10 border-2 border-border">
                      <AvatarImage src={entry.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {entry.profiles?.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Username */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {entry.profiles?.username || 'Anonymous'}
                        {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                      </p>
                      {entry.daily_streak > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {entry.daily_streak}-day streak
                        </p>
                      )}
                    </div>

                    {/* Balance */}
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        {entry.camly_balance.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}