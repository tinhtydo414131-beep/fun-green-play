import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Trophy, Gamepad2, Users, Music, Upload, 
  Coins, Crown, Wallet, TrendingUp, Star, Sparkles,
  CheckCircle, Image as ImageIcon, RefreshCw, Zap, Medal
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

// NFT Contract addresses for game collection (example - replace with actual)
const GAME_NFT_CONTRACTS = [
  "0x1234567890123456789012345678901234567890", // Example contract
];

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

  const fetchHonorStats = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get all camly transactions for total income
      const { data: transactions } = await supabase
        .from("camly_coin_transactions")
        .select("amount, transaction_type")
        .eq("user_id", user.id);

      // Calculate total income from all transactions
      const totalFromTransactions = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Get uploaded games count
      const { count: gamesCount } = await supabase
        .from("uploaded_games")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get approved games for bonus calculation
      const { count: approvedGames } = await supabase
        .from("uploaded_games")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "approved");

      // Get uploaded music count (from healing_music if admin, or user music)
      const { count: musicCount } = await supabase
        .from("healing_music_432hz")
        .select("*", { count: "exact", head: true });

      // Get games played count from game_plays
      const { count: playsCount } = await supabase
        .from("game_plays")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Check how many upload bonuses already claimed
      const claimedBonuses = transactions?.filter(t => t.transaction_type === "game_upload_bonus") || [];
      const claimedUploadBonus = claimedBonuses.reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calculate unclaimed rewards (approved games * 1M each - already claimed)
      const totalPossibleBonus = (approvedGames || 0) * 1000000;
      const unclaimedRewards = Math.max(0, totalPossibleBonus - claimedUploadBonus);

      // Total income = wallet balance + transactions
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
        .order("wallet_balance", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopUsers(data || []);
    } catch (error) {
      console.error("Error fetching top users:", error);
    }
  }, []);

  const scanWalletNFTs = async () => {
    if (!profile.wallet_address) {
      toast.error("Connect your wallet first to scan NFTs");
      return;
    }

    setScanningNFTs(true);
    try {
      // Use ethers.js to scan for NFTs
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        
        // ERC721 interface for balanceOf
        const erc721ABI = ["function balanceOf(address owner) view returns (uint256)"];
        
        let totalNFTs = 0;
        
        for (const contractAddress of GAME_NFT_CONTRACTS) {
          try {
            const contract = new ethers.Contract(contractAddress, erc721ABI, provider);
            const balance = await contract.balanceOf(profile.wallet_address);
            totalNFTs += Number(balance);
          } catch (err) {
            // Contract might not exist on this network
            console.log(`Contract ${contractAddress} not found`);
          }
        }
        
        setStats(prev => ({ ...prev, nftCount: totalNFTs }));
        toast.success(`Found ${totalNFTs} NFTs in your collection! 🎨`);
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
      // Update wallet balance
      const { error } = await supabase
        .from("profiles")
        .update({ 
          wallet_balance: profile.wallet_balance + stats.unclaimedRewards 
        })
        .eq("id", user?.id);

      if (error) throw error;

      // Record transaction
      await supabase.from("camly_coin_transactions").insert({
        user_id: user?.id,
        amount: stats.unclaimedRewards,
        transaction_type: "game_upload_bonus",
        description: `Bonus for ${stats.approvedGames} approved games (1M each)`
      });

      toast.success(`Claimed ${stats.unclaimedRewards.toLocaleString()} CAMLY! 🎉`);
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

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchHonorStats();
      fetchTopUsers();
    }
  }, [user, fetchHonorStats, fetchTopUsers]);

  // Real-time updates for profiles changes
  useEffect(() => {
    const channel = supabase
      .channel('honor-board-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchTopUsers();
          fetchHonorStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'camly_coin_transactions',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchHonorStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uploaded_games',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchHonorStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_plays',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchHonorStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchHonorStats, fetchTopUsers]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: "🥇", color: "from-yellow-400 to-yellow-600", label: "Champion" };
    if (rank === 2) return { icon: "🥈", color: "from-gray-300 to-gray-500", label: "Runner-up" };
    if (rank === 3) return { icon: "🥉", color: "from-orange-400 to-orange-600", label: "Third" };
    if (rank <= 10) return { icon: "⭐", color: "from-blue-400 to-blue-600", label: "Top 10" };
    return { icon: "🎮", color: "from-primary to-secondary", label: "Player" };
  };

  const honorItems = [
    {
      icon: Crown,
      label: "Your Rank",
      value: `#${userRank || "—"}`,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      description: "Based on total income",
      badge: getRankBadge(userRank)
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
      description: `${stats.approvedGames} approved (1M each)`,
      badge: stats.approvedGames > 0 ? { icon: "✅", label: `${stats.approvedGames} approved` } : undefined
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
      label: "Music Uploaded",
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
    },
    {
      icon: ImageIcon,
      label: "NFTs Owned",
      value: stats.nftCount.toString(),
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-500/10",
      description: "Game collection NFTs",
      action: {
        label: scanningNFTs ? "Scanning..." : "Scan Wallet",
        onClick: scanWalletNFTs,
        loading: scanningNFTs,
        variant: "outline" as const
      }
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Users Leaderboard */}
      <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-card via-yellow-500/5 to-orange-500/5 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="font-fredoka flex items-center gap-2 text-xl">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Top Players Leaderboard
            <Badge variant="secondary" className="ml-2">
              <Zap className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {topUsers.map((topUser, index) => {
                const rankBadge = getRankBadge(index + 1);
                const isCurrentUser = topUser.id === user?.id;
                
                return (
                  <motion.div
                    key={topUser.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    layout
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isCurrentUser 
                        ? "bg-primary/20 border-2 border-primary/40 shadow-lg" 
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankBadge.color} flex items-center justify-center shadow-md`}>
                      <span className="text-lg">{rankBadge.icon}</span>
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={topUser.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                        {topUser.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-fredoka font-bold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                          {topUser.username}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                            You
                          </Badge>
                        )}
                        {index < 3 && (
                          <Crown className={`w-4 h-4 ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-500"}`} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {topUser.total_plays} games played
                      </p>
                    </div>
                    
                    {/* Income */}
                    <div className="text-right">
                      <p className="font-fredoka font-bold text-lg bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        {topUser.wallet_balance.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">CAMLY</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Personal Stats Grid */}
      <div>
        <h3 className="font-fredoka text-xl mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-primary" />
          Your Honor Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {honorItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <Card className={`border-2 border-transparent hover:border-primary/30 transition-all hover:shadow-lg transform hover:scale-[1.02] ${item.bgColor} h-full`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge.icon} {item.badge.label}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground font-medium mb-1">{item.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-fredoka font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.value}
                    </span>
                    {item.suffix && (
                      <span className="text-xs font-medium text-muted-foreground">{item.suffix}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{item.description}</p>
                  
                  {item.action && (
                    <Button
                      onClick={item.action.onClick}
                      disabled={item.action.loading}
                      size="sm"
                      variant={item.action.variant || "default"}
                      className={`w-full mt-3 ${!item.action.variant ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" : ""}`}
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
      </div>

      {/* Achievement Progress */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <CardTitle className="font-fredoka flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Games Master (Play 100 games)
              </span>
              <span className="font-bold text-primary">{Math.min(stats.gamesPlayed, 100)}/100</span>
            </div>
            <Progress value={Math.min((stats.gamesPlayed / 100) * 100, 100)} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Social Butterfly (10 friends)
              </span>
              <span className="font-bold text-primary">{Math.min(profile.total_friends, 10)}/10</span>
            </div>
            <Progress value={Math.min((profile.total_friends / 10) * 100, 100)} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Creator (Upload 5 games)
              </span>
              <span className="font-bold text-primary">{Math.min(stats.gamesUploaded, 5)}/5</span>
            </div>
            <Progress value={Math.min((stats.gamesUploaded / 5) * 100, 100)} className="h-3" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Wealthy (Earn 10M CAMLY)
              </span>
              <span className="font-bold text-primary">{Math.min(stats.totalIncome, 10000000).toLocaleString()}/10,000,000</span>
            </div>
            <Progress value={Math.min((stats.totalIncome / 10000000) * 100, 100)} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}