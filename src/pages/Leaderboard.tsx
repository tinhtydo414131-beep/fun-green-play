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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back to Home Button */}
          <div className="mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="font-bold group"
            >
              <Home className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
              <span>Về Trang Chính</span>
            </Button>
          </div>

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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-comic text-muted-foreground">
                          🎮 {leader.total_plays} plays • ❤️ {leader.total_likes} likes • 👥 {leader.total_friends} friends
                        </p>
                        {leader.wallet_address && (
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
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {leader.wallet_address && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRecipient({
                              address: leader.wallet_address!,
                              username: leader.username
                            });
                            setTransferModalOpen(true);
                          }}
                          className="h-8"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Transfer
                        </Button>
                      )}
                      <div className="text-right">
                        <p className="text-3xl font-fredoka font-bold text-primary">{leader.leaderboard_score}</p>
                        <p className="text-sm font-comic text-muted-foreground">points</p>
                      </div>
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
