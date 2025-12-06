import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Trophy, Gamepad2, Users, Music, Upload, 
  Coins, Crown, Wallet, TrendingUp, Star, Sparkles,
  CheckCircle, Image as ImageIcon, RefreshCw, Zap, Medal,
  Search, SortDesc
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";

interface HonorBoardProps {
  profile: {
    id: string;
    wallet_balance: number;
    wallet_address: string | null;
    total_plays: number;
    total_friends: number;
  };
  userRank: number;
}

interface HonorStats {
  totalIncome: number;
  gamesUploaded: number;
  approvedGames: number;
  musicUploaded: number;
  gamesPlayed: number;
  nftCount: number;
  unclaimedRewards: number;
  claimedUploadBonus: number;
}

interface TopUser {
  id: string;
  username: string;
  avatar_url: string | null;
  wallet_balance: number;
  total_plays: number;
}

const GAME_NFT_CONTRACTS = [
  "0x1234567890123456789012345678901234567890",
];

const ITEMS_PER_PAGE = 10;

export function HonorBoard({ profile, userRank }: HonorBoardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<HonorStats>({
    totalIncome: 0,
    gamesUploaded: 0,
    approvedGames: 0,
    musicUploaded: 0,
    gamesPlayed: 0,
    nftCount: 0,
    unclaimedRewards: 0,
    claimedUploadBonus: 0
  });
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [scanningNFTs, setScanningNFTs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "plays">("score");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [hasMore, setHasMore] = useState(true);

  const fetchHonorStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: transactions } = await supabase
        .from("camly_coin_transactions")
        .select("amount, transaction_type")
        .eq("user_id", user.id);

      const totalFromTransactions = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const { count: gamesCount } = await supabase
        .from("uploaded_games")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: approvedGames } = await supabase
        .from("uploaded_games")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "approved");

      const { count: musicCount } = await supabase
        .from("healing_music_432hz")
        .select("*", { count: "exact", head: true });

      const { count: playsCount } = await supabase
        .from("game_plays")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const claimedBonuses = transactions?.filter(t => t.transaction_type === "game_upload_bonus") || [];
      const claimedUploadBonus = claimedBonuses.reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalPossibleBonus = (approvedGames || 0) * 1000000;
      const unclaimedRewards = Math.max(0, totalPossibleBonus - claimedUploadBonus);

      const totalIncome = profile.wallet_balance + totalFromTransactions;

      setStats({
        totalIncome,
        gamesUploaded: gamesCount || 0,
        approvedGames: approvedGames || 0,
        musicUploaded: musicCount || 0,
        gamesPlayed: playsCount || profile.total_plays || 0,
        nftCount: 0,
        unclaimedRewards,
        claimedUploadBonus
      });
    } catch (error) {
      console.error("Error fetching honor stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user, profile.wallet_balance, profile.total_plays]);

  const fetchTopUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, wallet_balance, total_plays")
        .order(sortBy === "score" ? "wallet_balance" : "total_plays", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTopUsers(data || []);
      setHasMore((data?.length || 0) > displayCount);
    } catch (error) {
      console.error("Error fetching top users:", error);
    }
  }, [sortBy, displayCount]);

  const scanWalletNFTs = async () => {
    if (!profile.wallet_address) {
      toast.error("Connect your wallet first to scan NFTs");
      return;
    }

    setScanningNFTs(true);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const erc721ABI = ["function balanceOf(address owner) view returns (uint256)"];
        
        let totalNFTs = 0;
        
        for (const contractAddress of GAME_NFT_CONTRACTS) {
          try {
            const contract = new ethers.Contract(contractAddress, erc721ABI, provider);
            const balance = await contract.balanceOf(profile.wallet_address);
            totalNFTs += Number(balance);
          } catch (err) {
            console.log(`Contract ${contractAddress} not found`);
          }
        }
        
        setStats(prev => ({ ...prev, nftCount: totalNFTs }));
        toast.success(`Found ${totalNFTs} NFTs in your collection!`);
      } else {
        toast.error("Please install MetaMask to scan NFTs");
      }
    } catch (error) {
      console.error("Error scanning NFTs:", error);
      toast.error("Failed to scan NFTs");
    } finally {
      setScanningNFTs(false);
    }
  };

  const handleClaimRewards = async () => {
    if (stats.unclaimedRewards <= 0) {
      toast.info("No rewards to claim!");
      return;
    }

    setClaiming(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ wallet_balance: profile.wallet_balance + stats.unclaimedRewards })
        .eq("id", user?.id);

      if (error) throw error;

      await supabase.from("camly_coin_transactions").insert({
        user_id: user?.id,
        amount: stats.unclaimedRewards,
        transaction_type: "game_upload_bonus",
        description: `Bonus for ${stats.approvedGames} approved games (1M each)`
      });

      toast.success(`Claimed ${stats.unclaimedRewards.toLocaleString()} CAMLY!`);
      setStats(prev => ({ 
        ...prev, 
        unclaimedRewards: 0,
        totalIncome: prev.totalIncome + prev.unclaimedRewards,
        claimedUploadBonus: prev.claimedUploadBonus + prev.unclaimedRewards
      }));
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards");
    } finally {
      setClaiming(false);
    }
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  useEffect(() => {
    if (user) {
      fetchHonorStats();
      fetchTopUsers();
    }
  }, [user, fetchHonorStats, fetchTopUsers]);

  useEffect(() => {
    const channel = supabase
      .channel('honor-board-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchTopUsers();
        fetchHonorStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'camly_coin_transactions', filter: `user_id=eq.${user?.id}` }, () => {
        fetchHonorStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'uploaded_games', filter: `user_id=eq.${user?.id}` }, () => {
        fetchHonorStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_plays', filter: `user_id=eq.${user?.id}` }, () => {
        fetchHonorStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchHonorStats, fetchTopUsers]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: "🥇", color: "rank-badge-1", label: "Champion" };
    if (rank === 2) return { icon: "🥈", color: "rank-badge-2", label: "Runner-up" };
    if (rank === 3) return { icon: "🥉", color: "rank-badge-3", label: "Third" };
    return { icon: `${rank}`, color: "rank-badge-regular", label: "Player" };
  };

  const filteredUsers = topUsers.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, displayCount);

  const honorItems = [
    {
      icon: Crown,
      label: "Your Rank",
      value: `#${userRank || "—"}`,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      description: "Based on total income"
    },
    {
      icon: Coins,
      label: "Total Income",
      value: stats.totalIncome.toLocaleString(),
      suffix: "CAMLY",
      color: "from-primary to-secondary",
      bgColor: "bg-primary/10",
      description: "Points + Rewards combined",
      action: stats.unclaimedRewards > 0 ? {
        label: `Claim ${stats.unclaimedRewards.toLocaleString()}`,
        onClick: handleClaimRewards,
        loading: claiming
      } : undefined
    },
    {
      icon: Upload,
      label: "Games Uploaded",
      value: stats.gamesUploaded.toString(),
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      description: `${stats.approvedGames} approved`
    },
    {
      icon: Users,
      label: "Friends",
      value: profile.total_friends.toString(),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      description: "Your gaming buddies"
    },
    {
      icon: Music,
      label: "Music",
      value: stats.musicUploaded.toString(),
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      description: "Shared tunes"
    },
    {
      icon: Gamepad2,
      label: "Games Played",
      value: stats.gamesPlayed.toString(),
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10",
      description: "Play sessions"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-xl h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-16">
      {/* Top Players Leaderboard - Card-based design */}
      <section>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-inter font-bold text-xl md:text-2xl flex items-center gap-3">
              <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
              Top Players
              <Badge variant="secondary" className="ml-2 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </h2>
          </div>
          
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl text-base"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSortBy(prev => prev === "score" ? "plays" : "score")}
              className="h-12 rounded-xl gap-2 font-semibold"
            >
              <SortDesc className="w-5 h-5" />
              Sort by {sortBy === "score" ? "Score" : "Plays"}
            </Button>
          </div>
        </div>

        {/* Leaderboard Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((topUser, index) => {
              const rank = index + 1;
              const rankBadge = getRankBadge(rank);
              const isCurrentUser = topUser.id === user?.id;
              const isTopThree = rank <= 3;
              
              return (
                <motion.div
                  key={topUser.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  layout
                  className={`
                    honor-card
                    ${isTopThree ? `honor-card-top honor-card-${rank}` : 'honor-card-regular'}
                    ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                  `}
                >
                  {/* Rank Badge */}
                  <div className={`rank-badge ${rankBadge.color} shrink-0`}>
                    {isTopThree ? (
                      <span className="text-2xl">{rankBadge.icon}</span>
                    ) : (
                      <span className="font-bold">{rank}</span>
                    )}
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-background shrink-0">
                    <AvatarImage src={topUser.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-lg">
                      {topUser.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-inter font-bold text-base truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                        {topUser.username}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs border-primary text-primary font-semibold">
                          You
                        </Badge>
                      )}
                      {isTopThree && (
                        <Crown className={`w-5 h-5 ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-orange-500'}`} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {topUser.total_plays} games played
                    </p>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="font-inter font-extrabold text-lg md:text-xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      {topUser.wallet_balance.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">CAMLY</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {hasMore && filteredUsers.length >= displayCount && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              className="h-12 px-8 rounded-xl font-semibold"
            >
              Load More
            </Button>
          </div>
        )}
      </section>

      {/* Personal Stats Grid */}
      <section>
        <h3 className="font-inter font-bold text-xl md:text-2xl mb-6 flex items-center gap-3">
          <Medal className="w-6 h-6 text-primary" />
          Your Honor Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {honorItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <Card className={`h-full border-2 border-transparent hover:border-primary/30 transition-all hover:shadow-lg hover:scale-[1.02] ${item.bgColor}`}>
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                      <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-medium mb-1">{item.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl md:text-3xl font-inter font-extrabold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.value}
                    </span>
                    {item.suffix && (
                      <span className="text-xs font-medium text-muted-foreground">{item.suffix}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                  
                  {item.action && (
                    <Button
                      onClick={item.action.onClick}
                      disabled={item.action.loading}
                      size="sm"
                      className="w-full mt-4 h-11 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 font-semibold"
                    >
                      {item.action.loading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wallet className="w-4 h-4 mr-2" />
                      )}
                      {item.action.label}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Achievement Progress */}
      <section>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="font-inter font-bold text-xl flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-500" />
              Achievement Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Gamepad2 className="w-5 h-5" />
                  Games Master (Play 100 games)
                </span>
                <span className="font-bold text-primary">{Math.min(stats.gamesPlayed, 100)}/100</span>
              </div>
              <Progress value={Math.min((stats.gamesPlayed / 100) * 100, 100)} className="h-3" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Users className="w-5 h-5" />
                  Social Butterfly (10 friends)
                </span>
                <span className="font-bold text-primary">{Math.min(profile.total_friends, 10)}/10</span>
              </div>
              <Progress value={Math.min((profile.total_friends / 10) * 100, 100)} className="h-3" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Upload className="w-5 h-5" />
                  Creator (Upload 5 games)
                </span>
                <span className="font-bold text-primary">{Math.min(stats.gamesUploaded, 5)}/5</span>
              </div>
              <Progress value={Math.min((stats.gamesUploaded / 5) * 100, 100)} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Coins className="w-5 h-5" />
                  Wealthy (Earn 10M CAMLY)
                </span>
                <span className="font-bold text-primary">{Math.min(stats.totalIncome, 10000000).toLocaleString()}/10,000,000</span>
              </div>
              <Progress value={Math.min((stats.totalIncome / 10000000) * 100, 100)} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
