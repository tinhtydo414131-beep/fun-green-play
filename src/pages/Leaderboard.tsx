import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeaderboardEntry {
  id: string;
  username: string;
  leaderboard_score: number;
  total_plays: number;
  total_likes: number;
  total_friends: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, leaderboard_score, total_plays, total_likes, total_friends")
        .order("leaderboard_score", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLeaders(data || []);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Couldn't load leaderboard 😢");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-8 h-8 text-orange-600" />;
    return <Star className="w-6 h-6 text-primary" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-orange-400 to-orange-600";
    return "from-primary to-secondary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <Trophy className="w-16 h-16 text-primary animate-bounce mx-auto mb-4" />
          <p className="text-2xl font-fredoka text-primary">Loading rankings... ⏳</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-16 h-16 text-primary animate-bounce" />
              <h1 className="text-5xl md:text-6xl font-fredoka font-bold text-primary">
                Kids Ranking! 🏆
              </h1>
              <Trophy className="w-16 h-16 text-secondary animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="text-xl text-muted-foreground font-comic max-w-2xl mx-auto">
              See who's the top player! Keep playing to climb the ranks! 🌟
            </p>
          </div>

          {/* Top 3 Podium */}
          {leaders.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Card className="border-4 border-gray-400 shadow-xl transform hover:scale-105 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <Medal className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      {leaders[1].username[0].toUpperCase()}
                    </div>
                    <p className="font-fredoka font-bold text-xl text-foreground mb-1">{leaders[1].username}</p>
                    <p className="text-3xl font-fredoka font-bold text-gray-500">{leaders[1].leaderboard_score}</p>
                    <p className="text-sm font-comic text-muted-foreground">points</p>
                  </CardContent>
                </Card>
              </div>

              {/* 1st Place */}
              <div className="animate-fade-in">
                <Card className="border-4 border-yellow-500 shadow-2xl transform hover:scale-105 transition-all bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <Trophy className="w-16 h-16 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                      {leaders[0].username[0].toUpperCase()}
                    </div>
                    <p className="font-fredoka font-bold text-2xl text-foreground mb-1">{leaders[0].username}</p>
                    <p className="text-4xl font-fredoka font-bold text-yellow-600">{leaders[0].leaderboard_score}</p>
                    <p className="text-sm font-comic text-muted-foreground">points</p>
                    <div className="mt-3">
                      <span className="px-4 py-1 bg-yellow-500 text-white font-fredoka font-bold rounded-full text-sm">👑 Champion!</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Card className="border-4 border-orange-600 shadow-xl transform hover:scale-105 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <Medal className="w-12 h-12 text-orange-600" />
                    </div>
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      {leaders[2].username[0].toUpperCase()}
                    </div>
                    <p className="font-fredoka font-bold text-xl text-foreground mb-1">{leaders[2].username}</p>
                    <p className="text-3xl font-fredoka font-bold text-orange-600">{leaders[2].leaderboard_score}</p>
                    <p className="text-sm font-comic text-muted-foreground">points</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <Card className="border-4 border-primary/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                {leaders.map((leader, index) => (
                  <div
                    key={leader.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-lg transform hover:scale-102 ${
                      index < 3 ? 'bg-gradient-to-r ' + getRankColor(index + 1) + ' bg-opacity-10 border-current' : 'bg-muted/30 border-border hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 font-fredoka font-bold text-2xl">
                      {index < 3 ? getRankIcon(index + 1) : `#${index + 1}`}
                    </div>
                    
                    <Avatar className="w-14 h-14 border-2 border-primary/30">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-fredoka font-bold text-xl">
                        {leader.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p className="font-fredoka font-bold text-lg text-foreground">{leader.username}</p>
                      <p className="text-sm font-comic text-muted-foreground">
                        🎮 {leader.total_plays} plays • ❤️ {leader.total_likes} likes • 👥 {leader.total_friends} friends
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-fredoka font-bold text-primary">{leader.leaderboard_score}</p>
                      <p className="text-sm font-comic text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {leaders.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-2xl font-fredoka text-muted-foreground">No rankings yet! Be the first! 🌟</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
