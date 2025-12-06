import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Medal, Star, Send, Copy, Check, Coins, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransferModal } from "@/components/TransferModal";
import { useAuth } from "@/hooks/useAuth";
const POINTS_TO_CAMLY_RATIO = 100; // 1 point = 100 Camly Coins

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  leaderboard_score: number;
  total_plays: number;
  total_likes: number;
  total_friends: number;
  wallet_address: string | null;
}
export default function Leaderboard() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    address: string;
    username: string;
  } | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  useEffect(() => {
    fetchLeaderboard();
  }, [user]);
  const fetchLeaderboard = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("profiles").select("id, username, avatar_url, leaderboard_score, total_plays, total_likes, total_friends, wallet_address").order("leaderboard_score", {
        ascending: false
      }).limit(100);
      if (error) throw error;
      setLeaders(data || []);

      // Find current user's rank and score
      if (user && data) {
        const userIndex = data.findIndex(l => l.id === user.id);
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
          setUserScore(data[userIndex].leaderboard_score);
        }
      }
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Couldn't load leaderboard 😢");
    } finally {
      setLoading(false);
    }
  };
  const calculateCamlyCoins = (points: number) => points * POINTS_TO_CAMLY_RATIO;
  const claimRankingReward = async () => {
    if (!user || userScore <= 0) {
      toast.error("No points to claim!");
      return;
    }
    setClaimingReward(true);
    try {
      const camlyAmount = calculateCamlyCoins(userScore);

      // Get current balance
      const {
        data: current
      } = await supabase.from('web3_rewards').select('camly_balance').eq('user_id', user.id).maybeSingle();
      const newBalance = (Number(current?.camly_balance) || 0) + camlyAmount;

      // Update or insert rewards
      await supabase.from('web3_rewards').upsert({
        user_id: user.id,
        camly_balance: newBalance
      }, {
        onConflict: 'user_id'
      });

      // Record transaction
      await supabase.from('web3_reward_transactions').insert({
        user_id: user.id,
        amount: camlyAmount,
        reward_type: 'ranking_reward',
        description: `Ranking reward: ${userScore} points × 100 = ${camlyAmount.toLocaleString()} Camly`
      });
      toast.success(`🎉 Claimed ${camlyAmount.toLocaleString()} Camly Coins!`);
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    } finally {
      setClaimingReward(false);
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
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <Trophy className="w-16 h-16 text-primary animate-bounce mx-auto mb-4" />
          <p className="text-2xl font-fredoka text-primary">Loading rankings... ⏳</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="pt-20 sm:pt-32 pb-16 sm:pb-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back to Home Button */}
          <div className="mb-4 sm:mb-8">
            <Button onClick={() => navigate("/")} variant="outline" size="default" className="font-bold group text-sm sm:text-base">
              
              <span>Về Trang Chính</span>
            </Button>
          </div>

          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <Trophy className="w-8 h-8 sm:w-16 sm:h-16 text-primary animate-bounce" />
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-fredoka font-bold text-primary">
                Kids Ranking! 🏆
              </h1>
              <Trophy className="w-8 h-8 sm:w-16 sm:h-16 text-secondary animate-bounce hidden sm:block" style={{
              animationDelay: '0.2s'
            }} />
            </div>
            <p className="text-base sm:text-xl text-muted-foreground font-comic max-w-2xl mx-auto px-4">Top 100 players with scores & wallet addresses! 1 Point = 100 Camly Coins </p>
          </div>

          {/* User's Ranking Reward Card */}
          {user && userRank && userScore > 0 && <Card className="mb-6 sm:mb-8 border-2 border-primary/50 bg-gradient-to-r from-primary/10 to-secondary/10 animate-fade-in">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-comic">Your Ranking Reward</p>
                      <p className="text-2xl sm:text-3xl font-fredoka font-bold text-primary">
                        {calculateCamlyCoins(userScore).toLocaleString()} <span className="text-base sm:text-lg">Camly</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rank #{userRank} • {userScore} points × 100
                      </p>
                    </div>
                  </div>
                  <Button onClick={claimRankingReward} disabled={claimingReward} className="w-full sm:w-auto" size="lg">
                    <Gift className="w-5 h-5 mr-2" />
                    {claimingReward ? 'Claiming...' : 'Claim Reward'}
                  </Button>
                </div>
              </CardContent>
            </Card>}

          {/* Top 3 Podium */}
          {leaders.length >= 3 && <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-12 max-w-4xl mx-auto">
              {/* 1st Place - Shows first on mobile */}
              <div className="animate-fade-in sm:order-2">
                <Card className="border-2 sm:border-4 border-yellow-500 shadow-2xl transform hover:scale-105 transition-all bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                      <Trophy className="w-10 h-10 sm:w-16 sm:h-16 text-yellow-500 animate-pulse sm:mb-3" />
                      <Avatar className="w-14 h-14 sm:w-24 sm:h-24 border-4 border-yellow-500 shadow-2xl sm:mb-3 shrink-0">
                        <AvatarImage src={leaders[0].avatar_url || undefined} alt={leaders[0].username} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-xl sm:text-4xl font-bold text-white">
                          {leaders[0].username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 sm:flex-none text-left sm:text-center">
                        <p className="font-fredoka font-bold text-base sm:text-2xl text-foreground truncate">{leaders[0].username}</p>
                        <p className="text-xl sm:text-4xl font-fredoka font-bold text-yellow-600">{leaders[0].leaderboard_score} <span className="text-xs sm:text-sm font-comic text-muted-foreground font-normal">points</span></p>
                        <p className="text-sm sm:text-lg font-comic text-primary flex items-center gap-1">
                          <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                          {calculateCamlyCoins(leaders[0].leaderboard_score).toLocaleString()} Camly
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500 text-white font-fredoka font-bold rounded-full text-xs sm:hidden shrink-0">👑</span>
                    </div>
                    <div className="hidden sm:block mt-3">
                      <span className="px-4 py-1 bg-yellow-500 text-white font-fredoka font-bold rounded-full text-sm">👑 Champion!</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 2nd Place */}
              <div className="animate-fade-in sm:order-1 sm:mt-8" style={{
            animationDelay: '0.2s'
          }}>
                <Card className="border-2 sm:border-4 border-gray-400 shadow-xl transform hover:scale-105 transition-all">
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                      <Medal className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 sm:mb-3" />
                      <Avatar className="w-12 h-12 sm:w-20 sm:h-20 border-4 border-gray-400 shadow-lg sm:mb-3 shrink-0">
                        <AvatarImage src={leaders[1].avatar_url || undefined} alt={leaders[1].username} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-500 text-lg sm:text-3xl font-bold text-white">
                          {leaders[1].username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 sm:flex-none text-left sm:text-center">
                        <p className="font-fredoka font-bold text-sm sm:text-xl text-foreground truncate">{leaders[1].username}</p>
                        <p className="text-lg sm:text-3xl font-fredoka font-bold text-gray-500">{leaders[1].leaderboard_score} <span className="text-xs sm:text-sm font-comic text-muted-foreground font-normal">points</span></p>
                        <p className="text-xs sm:text-base font-comic text-primary flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {calculateCamlyCoins(leaders[1].leaderboard_score).toLocaleString()} Camly
                        </p>
                      </div>
                      <span className="text-lg font-fredoka font-bold text-gray-400 sm:hidden shrink-0">#2</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="animate-fade-in sm:order-3 sm:mt-8" style={{
            animationDelay: '0.4s'
          }}>
                <Card className="border-2 sm:border-4 border-orange-600 shadow-xl transform hover:scale-105 transition-all">
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                      <Medal className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600 sm:mb-3" />
                      <Avatar className="w-12 h-12 sm:w-20 sm:h-20 border-4 border-orange-600 shadow-lg sm:mb-3 shrink-0">
                        <AvatarImage src={leaders[2].avatar_url || undefined} alt={leaders[2].username} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-lg sm:text-3xl font-bold text-white">
                          {leaders[2].username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 sm:flex-none text-left sm:text-center">
                        <p className="font-fredoka font-bold text-sm sm:text-xl text-foreground truncate">{leaders[2].username}</p>
                        <p className="text-lg sm:text-3xl font-fredoka font-bold text-orange-600">{leaders[2].leaderboard_score} <span className="text-xs sm:text-sm font-comic text-muted-foreground font-normal">points</span></p>
                        <p className="text-xs sm:text-base font-comic text-primary flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {calculateCamlyCoins(leaders[2].leaderboard_score).toLocaleString()} Camly
                        </p>
                      </div>
                      <span className="text-lg font-fredoka font-bold text-orange-600 sm:hidden shrink-0">#3</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>}

          {/* Full Leaderboard */}
          <Card className="border-2 sm:border-4 border-primary/30 shadow-2xl">
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {leaders.map((leader, index) => <div key={leader.id} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all hover:shadow-lg ${index < 3 ? 'bg-gradient-to-r ' + getRankColor(index + 1) + ' bg-opacity-10 border-current' : 'bg-muted/10 border-border/50 hover:border-primary/50'}`}>
                    {/* Mobile: Top row with rank, avatar, name, score */}
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 font-fredoka font-bold text-lg sm:text-2xl shrink-0">
                        {index < 3 ? getRankIcon(index + 1) : `#${index + 1}`}
                      </div>
                      
                      <Avatar className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-primary/30 shrink-0">
                        <AvatarImage src={leader.avatar_url || undefined} alt={leader.username} />
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

                      {/* Score & Camly - visible on all sizes */}
                      <div className="text-right shrink-0">
                        <p className="text-xl sm:text-3xl font-fredoka font-bold text-red-500">{leader.leaderboard_score}</p>
                        <p className="text-xs sm:text-sm font-comic text-muted-foreground">points</p>
                        <p className="text-xs sm:text-sm font-comic text-red-500 flex items-center justify-end gap-1">
                          <Coins className="w-3 h-3" />
                          {calculateCamlyCoins(leader.leaderboard_score).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Mobile: Bottom row with wallet & transfer */}
                    <div className="flex items-center justify-between gap-2 pl-11 sm:pl-0 sm:ml-auto">
                      <TooltipProvider>
                        <div className="flex items-center gap-1">
                          {leader.wallet_address ? <>
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
                              <Button size="sm" variant="ghost" className={`h-5 w-5 p-0 transition-colors duration-200 ${copiedAddress === leader.wallet_address ? 'text-green-500' : ''}`} onClick={() => copyToClipboard(leader.wallet_address!)}>
                                {copiedAddress === leader.wallet_address ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </> : <span className="text-xs font-mono text-muted-foreground/50 italic">
                              No wallet
                            </span>}
                        </div>
                      </TooltipProvider>
                      {leader.wallet_address && <Button size="sm" onClick={() => {
                    setSelectedRecipient({
                      address: leader.wallet_address!,
                      username: leader.username
                    });
                    setTransferModalOpen(true);
                  }} className="h-7 sm:h-8 text-xs sm:text-sm">
                          <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Transfer
                        </Button>}
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {leaders.length === 0 && <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-2xl font-fredoka text-muted-foreground">No rankings yet! Be the first! 🌟</p>
            </div>}
        </div>
      </section>

      {/* Transfer Modal */}
      {selectedRecipient && <TransferModal open={transferModalOpen} onOpenChange={setTransferModalOpen} recipientAddress={selectedRecipient.address} recipientUsername={selectedRecipient.username} />}
    </div>;
}