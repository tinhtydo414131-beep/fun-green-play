import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Medal, Award, Search, ChevronDown, Sparkles, Trophy, Gamepad2, Upload, Users, Music, Coins, Wallet } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface HonorBoardProps {
  profile: {
    id: string;
    wallet_balance: number;
    wallet_address: string | null;
    total_plays: number;
    total_friends: number;
  };
  userRank: number;
  compact?: boolean;
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

const ITEMS_PER_PAGE = 10;

export function HonorBoard({ profile, userRank, compact = false }: HonorBoardProps) {
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 drop-shadow-lg animate-pulse" />;
    if (rank === 2) return <Medal className="w-8 h-8 md:w-10 md:h-10 text-gray-300 drop-shadow-lg" />;
    if (rank === 3) return <Award className="w-8 h-8 md:w-10 md:h-10 text-orange-500 drop-shadow-lg" />;
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
        #{rank}
      </div>
    );
  };

  const getRewardForRank = (rank: number) => {
    if (rank === 1) return "50,000 CAMLY";
    if (rank === 2) return "30,000 CAMLY";
    if (rank === 3) return "20,000 CAMLY";
    if (rank <= 10) return "10,000 CAMLY";
    return "5,000 CAMLY";
  };

  const filteredUsers = topUsers.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, displayCount);

  const top3Users = filteredUsers.slice(0, 3);
  const restUsers = filteredUsers.slice(3);

  const honorItems = [
    {
      icon: Crown,
      label: "Hạng của bạn",
      value: `#${userRank || "—"}`,
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30"
    },
    {
      icon: Coins,
      label: "Tổng thu nhập",
      value: stats.totalIncome.toLocaleString(),
      suffix: "CAMLY",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
    },
    {
      icon: Upload,
      label: "Game đã upload",
      value: stats.gamesUploaded.toString(),
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30"
    },
    {
      icon: Users,
      label: "Bạn bè",
      value: profile.total_friends.toString(),
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30"
    },
    {
      icon: Music,
      label: "Nhạc",
      value: stats.musicUploaded.toString(),
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30"
    },
    {
      icon: Gamepad2,
      label: "Lượt chơi",
      value: stats.gamesPlayed.toString(),
      color: "from-violet-400 to-purple-500",
      bgColor: "bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30"
    }
  ];

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-3xl h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          HONOR BOARD
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-lg text-muted-foreground mt-2">Top vui vẻ nhất Fun Planet!</p>
      </motion.div>

      {/* Search + Sort */}
      <motion.div 
        className="flex flex-col md:flex-row gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm tên người chơi..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-lg transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setSortBy(prev => prev === "score" ? "plays" : "score")}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg"
        >
          Sắp xếp theo {sortBy === "score" ? "điểm" : "lượt chơi"}
          <ChevronDown className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Top 3 Special Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[2, 1, 3].map((pos, gridIndex) => {
          const player = top3Users.find((_, idx) => idx + 1 === pos);
          if (!player) return null;
          const isCurrentUser = player.id === user?.id;
          
          return (
            <motion.div 
              key={pos} 
              className={`relative ${
                pos === 1 ? 'md:-mt-8 md:order-2' : pos === 2 ? 'md:mt-4 md:order-1' : 'md:mt-8 md:order-3'
              }`}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + gridIndex * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <div className={`
                bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden 
                border-4 transition-all duration-300
                ${pos === 1 ? 'border-yellow-400 shadow-yellow-400/30' : 
                  pos === 2 ? 'border-gray-300 dark:border-gray-500 shadow-gray-400/20' : 
                  'border-orange-400 shadow-orange-400/20'}
                ${isCurrentUser ? 'ring-4 ring-purple-500 ring-offset-2' : ''}
              `}>
                {/* Top Gradient Section */}
                <div className={`
                  p-6 text-center relative overflow-hidden
                  ${pos === 1 ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400' : 
                    pos === 2 ? 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-600 dark:via-gray-500 dark:to-gray-400' : 
                    'bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500'}
                `}>
                  {/* Sparkle effects */}
                  {pos === 1 && (
                    <>
                      <div className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full animate-ping" />
                      <div className="absolute top-6 right-6 w-3 h-3 bg-white rounded-full animate-pulse" />
                      <div className="absolute bottom-4 left-8 w-2 h-2 bg-white rounded-full animate-bounce" />
                    </>
                  )}
                  
                  <div className="relative z-10">
                    {getRankIcon(pos)}
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className={`
                    mx-auto mt-4 border-4 border-white shadow-xl
                    ${pos === 1 ? 'h-20 w-20' : 'h-16 w-16'}
                  `}>
                    <AvatarImage src={player.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-2xl">
                      {player.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Info Section */}
                <div className="p-6 text-center">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground truncate">
                    {player.username}
                  </h3>
                  {isCurrentUser && (
                    <span className="inline-block mt-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs font-bold rounded-full">
                      Đây là bạn!
                    </span>
                  )}
                  <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mt-3">
                    {player.wallet_balance.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">CAMLY</p>
                  <p className="text-lg font-bold text-green-500 mt-2 flex items-center justify-center gap-1">
                    <Trophy className="w-5 h-5" />
                    {getRewardForRank(pos)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Danh sách từ rank 4 trở xuống - Card list mobile friendly */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {restUsers.map((player, index) => {
            const actualRank = index + 4;
            const isCurrentUser = player.id === user?.id;
            
            return (
              <motion.div 
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className={`
                  bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex items-center gap-4 
                  hover:shadow-xl transition-all border-2 border-transparent
                  ${isCurrentUser ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'hover:border-purple-200 dark:hover:border-purple-700'}
                `}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(actualRank)}
                </div>
                
                <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-700 flex-shrink-0">
                  <AvatarImage src={player.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                    {player.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-foreground truncate flex items-center gap-2">
                    {player.username}
                    {isCurrentUser && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Bạn</span>
                    )}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {player.total_plays} lượt chơi
                  </p>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {player.wallet_balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">CAMLY</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {hasMore && filteredUsers.length >= displayCount && (
        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            onClick={loadMore}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-full hover:scale-110 hover:shadow-2xl transition-all duration-300 shadow-xl"
          >
            Xem thêm người chơi ✨
          </button>
        </motion.div>
      )}

      {/* Your Honor Stats Section - Horizontal Layout */}
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Medal className="w-8 h-8 text-purple-500" />
          Thành tích của bạn
        </h2>
        
        {/* Horizontal scrolling stats */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {honorItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -3 }}
              className="snap-center flex-shrink-0"
            >
              <Card className={`w-32 md:w-40 ${item.bgColor} border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-lg hover:shadow-xl`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate">{item.label}</p>
                  <p className={`text-lg md:text-xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.value}
                  </p>
                  {item.suffix && (
                    <p className="text-[10px] text-muted-foreground">{item.suffix}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Claim Rewards Button - Inline */}
        {stats.unclaimedRewards > 0 && (
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleClaimRewards}
              disabled={claiming}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-105 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto text-sm md:text-base"
            >
              <Wallet className="w-5 h-5" />
              {claiming ? "Đang nhận..." : `Nhận ${stats.unclaimedRewards.toLocaleString()} CAMLY`}
              <Sparkles className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Achievement Progress - Horizontal */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-center mb-4 text-foreground">Tiến độ thành tích</h3>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            <div className="snap-center flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-foreground text-sm">🎮 10 game</span>
                <span className="text-xs text-muted-foreground">{stats.gamesUploaded}/10</span>
              </div>
              <Progress value={Math.min((stats.gamesUploaded / 10) * 100, 100)} className="h-2" />
            </div>
            
            <div className="snap-center flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-foreground text-sm">🕹️ 100 lượt chơi</span>
                <span className="text-xs text-muted-foreground">{stats.gamesPlayed}/100</span>
              </div>
              <Progress value={Math.min((stats.gamesPlayed / 100) * 100, 100)} className="h-2" />
            </div>
            
            <div className="snap-center flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-foreground text-sm">👥 50 bạn bè</span>
                <span className="text-xs text-muted-foreground">{profile.total_friends}/50</span>
              </div>
              <Progress value={Math.min((profile.total_friends / 50) * 100, 100)} className="h-2" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
