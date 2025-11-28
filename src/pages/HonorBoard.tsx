import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Globe, MapPin, School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  leaderboard_score: number;
  wallet_balance: number;
  total_plays: number;
}

const HonorBoard = () => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [vnLeaderboard, setVnLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);

      // Global Top 100
      const { data: globalData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, leaderboard_score, wallet_balance, total_plays")
        .order("leaderboard_score", { ascending: false })
        .limit(100);

      // VN Top 50 (placeholder - filter by location in production)
      const { data: vnData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, leaderboard_score, wallet_balance, total_plays")
        .order("leaderboard_score", { ascending: false })
        .limit(50);

      // School Top 10 (placeholder - filter by school in production)
      const { data: schoolData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, leaderboard_score, wallet_balance, total_plays")
        .order("leaderboard_score", { ascending: false })
        .limit(10);

      setGlobalLeaderboard(globalData || []);
      setVnLeaderboard(vnData || []);
      setSchoolLeaderboard(schoolData || []);
    } catch (error) {
      console.error("Error loading leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center font-black text-foreground">#{rank}</span>;
  };

  const LeaderboardTable = ({ entries, title }: { entries: LeaderboardEntry[]; title: string }) => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-foreground flex items-center gap-2">
          {title === "Global" && <Globe className="w-6 h-6 text-primary" />}
          {title === "Vietnam" && <MapPin className="w-6 h-6 text-primary" />}
          {title === "School" && <School className="w-6 h-6 text-primary" />}
          {title} Rankings
        </CardTitle>
        <CardDescription className="text-foreground/70 font-bold">
          Top performers by CAMLY earned
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground font-bold">No rankings yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    isTopThree
                      ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-2 border-primary/30"
                      : "bg-muted/30 border border-border/50"
                  }`}
                >
                  <div className="flex-shrink-0">{getRankIcon(rank)}</div>
                  
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-black">
                      {entry.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground truncate">{entry.username}</p>
                    <p className="text-sm text-foreground/70 font-bold">{entry.total_plays} games played</p>
                  </div>

                  <div className="text-right">
                    <Badge className="bg-primary/90 text-primary-foreground font-black text-base px-3 py-1">
                      💎 {(entry.wallet_balance || 0).toLocaleString()} CAMLY
                    </Badge>
                    <p className="text-xs text-foreground/70 font-bold mt-1">
                      {entry.leaderboard_score.toLocaleString()} points
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
            🏆 Honor Board
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 font-bold max-w-2xl mx-auto">
            Build Your Planet – Play & Earn Joy! Compete with players worldwide!
          </p>
        </div>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8 bg-background border-2 border-primary/20">
            <TabsTrigger value="global" className="font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe className="w-4 h-4 mr-2" />
              Global Top 100
            </TabsTrigger>
            <TabsTrigger value="vietnam" className="font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              VN Top 50
            </TabsTrigger>
            <TabsTrigger value="school" className="font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <School className="w-4 h-4 mr-2" />
              School Top 10
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <LeaderboardTable entries={globalLeaderboard} title="Global" />
          </TabsContent>

          <TabsContent value="vietnam">
            <LeaderboardTable entries={vnLeaderboard} title="Vietnam" />
          </TabsContent>

          <TabsContent value="school">
            <LeaderboardTable entries={schoolLeaderboard} title="School" />
          </TabsContent>
        </Tabs>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default HonorBoard;
