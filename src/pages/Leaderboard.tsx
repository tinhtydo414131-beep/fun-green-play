import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Medal, Star, Home, Send, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransferModal } from "@/components/TransferModal";

interface LeaderboardEntry {
  id: string;
  username: string;
  leaderboard_score: number;
  total_plays: number;
  total_likes: number;
  total_friends: number;
  wallet_address: string | null;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{ address: string; username: string } | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, leaderboard_score, total_plays, total_likes, total_friends, wallet_address")
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

  const shortenAddress = (address: string | null) => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 sm:w-8 sm:h-8 text-orange-600" />;
    return <Star className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />;
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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="pt-20 sm:pt-32 pb-16 sm:pb-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back to Home Button */}
          <div className="mb-4 sm:mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="default"
              className="font-bold group text-sm sm:text-base"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-primary group-hover:scale-110 transition-transform" />
              <span>Về Trang Chính</span>
            </Button>
          </div>

          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <Trophy className="w-8 h-8 sm:w-16 sm:h-16 text-primary animate-bounce" />
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-fredoka font-bold text-primary">
                Kids Ranking! 🏆
              </h1>
              <Trophy className="w-8 h-8 sm:w-16 sm:h-16 text-secondary animate-bounce hidden sm:block" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="text-base sm:text-xl text-muted-foreground font-comic max-w-2xl mx-auto px-4">
              See who's the top player! Keep playing to climb the ranks! 🌟
            </p>
          </div>

          {/* Top 3 Podium */}
          {leaders.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-12 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="mt-4 sm:mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Card className="border-2 sm:border-4 border-gray-400 shadow-xl transform hover:scale-105 transition-all">
                  <CardContent className="p-2 sm:p-6 text-center">
                    <div className="flex justify-center mb-1 sm:mb-3">
                      <Medal className="w-6 h-6 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <div className="w-10 h-10 sm:w-20 sm:h-20 mx-auto mb-1 sm:mb-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-sm sm:text-3xl font-bold text-white shadow-lg">
                      {leaders[1].username[0].toUpperCase()}
                    </div>
                    <p className="font-fredoka font-bold text-xs sm:text-xl text-foreground mb-0.5 sm:mb-1 truncate px-1">{leaders[1].username}</p>
                    <p className="text-sm sm:text-3xl font-fredoka font-bold text-gray-500">{leaders[1].leaderboard_score}</p>
                    <p className="text-[10px] sm:text-sm font-comic text-muted-foreground">points</p>
                  </CardContent>
                </Card>
              </div>

              {/* 1st Place */}
              <div className="animate-fade-in">
                <Card className="border-2 sm:border-4 border-yellow-500 shadow-2xl transform hover:scale-105 transition-all bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardContent className="p-2 sm:p-6 text-center">
                    <div className="flex justify-center mb-1 sm:mb-3">
                      <Trophy className="w-8 h-8 sm:w-16 sm:h-16 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="w-12 h-12 sm:w-24 sm:h-24 mx-auto mb-1 sm:mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-base sm:text-4xl font-bold text-white shadow-2xl">
                      {leaders[0].username[0].toUpperCase()}
                    </div>
                    <p className="font-fredoka font-bold text-xs sm:text-2xl text-foreground mb-0.5 sm:mb-1 truncate px-1">{leaders[0].username}</p>
                    <p className="text-base sm:text-4xl font-fredoka font-bold text-yellow-600">{leaders[0].leaderboard_score}</p>
                    <p className="text-[10px] sm:text-sm font-comic text-muted-foreground">points</p>
                    <div className="mt-1 sm:mt-3">
                      <span className="px-2 sm:px-4 py-0.5 sm:py-1 bg-yellow-500 text-white font-fredoka font-bold rounded-full text-[10px] sm:text-sm">👑 Champion!</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="mt-4 sm:mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Card className="border-2 sm:border-4 border-orange-600 shadow-xl transform hover:scale-105 transition-all">
                  <CardContent className="p-2 sm:p-6 text-center">
                    <div className="flex justify-center mb-1 sm:mb-3">
                      <Medal className="w-6 h-6 sm:w-12 sm:h-12 text-orange-600" />
                    </div>
                    <div className="w-10 h-10 sm:w-20 sm:h-20 mx-auto mb-1 sm:mb-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm sm:text-3xl font-bold text-white shadow-lg">
                      {leaders[2].username[0].toUpperCase()}
                    </div>
                    <p className="font-fredoka font-bold text-xs sm:text-xl text-foreground mb-0.5 sm:mb-1 truncate px-1">{leaders[2].username}</p>
                    <p className="text-sm sm:text-3xl font-fredoka font-bold text-orange-600">{leaders[2].leaderboard_score}</p>
                    <p className="text-[10px] sm:text-sm font-comic text-muted-foreground">points</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <Card className="border-2 sm:border-4 border-primary/30 shadow-2xl">
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {leaders.map((leader, index) => (
                  <div
                    key={leader.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all hover:shadow-lg ${
                      index < 3 ? 'bg-gradient-to-r ' + getRankColor(index + 1) + ' bg-opacity-10 border-current' : 'bg-muted/30 border-border hover:border-primary'
                    }`}
                  >
                    {/* Mobile: Top row with rank, avatar, name, score */}
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 font-fredoka font-bold text-lg sm:text-2xl shrink-0">
                        {index < 3 ? getRankIcon(index + 1) : `#${index + 1}`}
                      </div>
                      
                      <Avatar className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-primary/30 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-fredoka font-bold text-base sm:text-xl">
                          {leader.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-fredoka font-bold text-base sm:text-lg text-foreground truncate">{leader.username}</p>
                        <p className="text-xs sm:text-sm font-comic text-muted-foreground truncate">
                          🎮 {leader.total_plays} • ❤️ {leader.total_likes} • 👥 {leader.total_friends}
                        </p>
                      </div>

                      {/* Score - visible on all sizes */}
                      <div className="text-right shrink-0">
                        <p className="text-xl sm:text-3xl font-fredoka font-bold text-primary">{leader.leaderboard_score}</p>
                        <p className="text-xs sm:text-sm font-comic text-muted-foreground">points</p>
                      </div>
                    </div>

                    {/* Mobile: Bottom row with wallet & transfer */}
                    {leader.wallet_address && (
                      <div className="flex items-center justify-between gap-2 pl-11 sm:pl-0 sm:ml-auto">
                        <TooltipProvider>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs font-mono text-muted-foreground/80 cursor-help">
                                  {shortenAddress(leader.wallet_address)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">{leader.wallet_address}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-5 w-5 p-0 transition-colors duration-200 ${
                                copiedAddress === leader.wallet_address
                                  ? 'text-green-500'
                                  : ''
                              }`}
                              onClick={() => copyToClipboard(leader.wallet_address!)}
                            >
                              {copiedAddress === leader.wallet_address ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TooltipProvider>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRecipient({
                              address: leader.wallet_address!,
                              username: leader.username
                            });
                            setTransferModalOpen(true);
                          }}
                          className="h-7 sm:h-8 text-xs sm:text-sm"
                        >
                          <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Transfer
                        </Button>
                      </div>
                    )}
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

      {/* Transfer Modal */}
      {selectedRecipient && (
        <TransferModal
          open={transferModalOpen}
          onOpenChange={setTransferModalOpen}
          recipientAddress={selectedRecipient.address}
          recipientUsername={selectedRecipient.username}
        />
      )}
    </div>
  );
}
