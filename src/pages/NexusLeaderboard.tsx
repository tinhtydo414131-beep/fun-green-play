import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, TrendingUp, Calendar } from "lucide-react";
import { Navigation } from "@/components/Navigation";

interface LeaderboardEntry {
  id: string;
  score: number;
  highest_tile: number;
  level_reached: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function NexusLeaderboard() {
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [alltimeLeaderboard, setAlltimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setLoading(true);

    // Get start of current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];

    // Weekly leaderboard
    const { data: weeklyData } = await supabase
      .from('nexus_leaderboard')
      .select(`
        id,
        score,
        highest_tile,
        level_reached,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('week_start', weekStart)
      .order('score', { ascending: false })
      .limit(50);

    // All-time leaderboard
    const { data: alltimeData } = await supabase
      .from('nexus_leaderboard')
      .select(`
        id,
        score,
        highest_tile,
        level_reached,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order('score', { ascending: false })
      .limit(50);

    if (weeklyData) setWeeklyLeaderboard(weeklyData as any);
    if (alltimeData) setAlltimeLeaderboard(alltimeData as any);
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const LeaderboardTable = ({ data }: { data: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No entries yet. Be the first!</div>
      ) : (
        data.map((entry, index) => (
          <Card 
            key={entry.id} 
            className={`p-4 transition-all hover:scale-[1.02] ${
              index < 3 
                ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30' 
                : 'bg-background/50 border-border/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 text-center">
                {getRankIcon(index + 1)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg truncate">
                  {entry.profiles?.username || 'Anonymous'}
                </div>
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Level {entry.level_reached}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Best: {entry.highest_tile}
                  </Badge>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8 space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-fredoka font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            2048 NEXUS
          </h1>
          <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-foreground">
            Leaderboard
          </h2>
          <p className="text-muted-foreground">
            Compete with players worldwide for the top spot!
          </p>
        </div>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week
            </TabsTrigger>
            <TabsTrigger value="alltime" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              All Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <LeaderboardTable data={weeklyLeaderboard} />
          </TabsContent>

          <TabsContent value="alltime">
            <LeaderboardTable data={alltimeLeaderboard} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
