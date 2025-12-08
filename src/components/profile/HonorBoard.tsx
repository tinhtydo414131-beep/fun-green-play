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

      // Updated: 500,000 CAMLY per approved game
      const totalPossibleBonus = (approvedGames || 0) * 500000;
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

  // ============= DỮ LIỆU CHO RANK BAR (6 ô nằm ngang) =============
  const honorItems = [
    {
      key: "H",
      icon: Crown,
      label: "Hạng",
      value: `#${userRank || "—"}`,
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-gradient-to-b from-yellow-300 to-orange-400"
    },
    {
      key: "T",
      icon: Coins,
      label: "CAMLY",
      value: stats.totalIncome.toLocaleString(),
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-b from-purple-400 to-purple-600"
    },
    {
      key: "G",
      icon: Upload,
      label: "Game",
      value: stats.gamesUploaded.toString(),
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-gradient-to-b from-green-300 to-green-500"
    },
    {
      key: "B",
      icon: Users,
      label: "Bạn bè",
      value: profile.total_friends.toString(),
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-gradient-to-b from-blue-300 to-cyan-500"
    },
    {
      key: "N",
      icon: Music,
      label: "Nhạc",
      value: stats.musicUploaded.toString(),
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-gradient-to-b from-pink-300 to-pink-500"
    },
    {
      key: "L",
      icon: Gamepad2,
      label: "Lượt chơi",
      value: stats.gamesPlayed.toString(),
      color: "from-violet-400 to-purple-500",
      bgColor: "bg-gradient-to-b from-violet-400 to-purple-500"
    }
  ];

  // ============= DỮ LIỆU CHO TIẾN ĐỘ THÀNH TÍCH (3 ô nằm ngang) =============
  const progressItems = [
    {
      icon: Gamepad2,
      label: "game",
      target: 10,
      current: stats.gamesUploaded,
      color: "text-purple-500"
    },
    {
      icon: Gamepad2,
      label: "lượt chơi",
      target: 100,
      current: stats.gamesPlayed,
      color: "text-red-500"
    },
    {
      icon: Users,
      label: "bạn bè",
      target: 50,
      current: profile.total_friends,
      color: "text-blue-500"
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

      {/* Top 3 Special Cards - Always Horizontal */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
        {[2, 1, 3].map((pos, gridIndex) => {
          const player = top3Users.find((_, idx) => idx + 1 === pos);
          if (!player) return null;
          const isCurrentUser = player.id === user?.id;
          
          return (
            <motion.div 
              key={pos} 
              className={`relative ${
                pos === 1 ? '-mt-2 md:-mt-4 order-2' : pos === 2 ? 'mt-2 md:mt-4 order-1' : 'mt-4 md:mt-6 order-3'
              }`}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + gridIndex * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <div className={`
                bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden 
                border-2 md:border-4 transition-all duration-300
                ${pos === 1 ? 'border-yellow-400 shadow-yellow-400/30' : 
                  pos === 2 ? 'border-gray-300 dark:border-gray-500 shadow-gray-400/20' : 
                  'border-orange-400 shadow-orange-400/20'}
                ${isCurrentUser ? 'ring-2 md:ring-4 ring-purple-500 ring-offset-1 md:ring-offset-2' : ''}
              `}>
                {/* Top Gradient Section - Horizontal */}
                <div className={`
                  p-2 md:p-4 relative overflow-hidden flex items-center justify-center gap-2 md:gap-3
                  ${pos === 1 ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400' : 
                    pos === 2 ? 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-600 dark:via-gray-500 dark:to-gray-400' : 
                    'bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500'}
                `}>
                  {/* Sparkle effects */}
                  {pos === 1 && (
                    <>
                      <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
                    </>
                  )}
                  
                  <div className="relative z-10 scale-75 md:scale-100">
                    {getRankIcon(pos)}
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className={`
                    border-2 md:border-4 border-white shadow-lg
                    ${pos === 1 ? 'h-12 w-12 md:h-16 md:w-16' : 'h-10 w-10 md:h-14 md:w-14'}
                  `}>
                    <AvatarImage src={player.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm md:text-xl">
                      {player.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Info Section */}
                <div className="p-2 md:p-4 text-center">
                  <h3 className="text-xs md:text-lg font-bold text-foreground truncate">
                    {player.username}
                  </h3>
                  {isCurrentUser && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-[8px] md:text-xs font-bold rounded-full">
                      Bạn
                    </span>
                  )}
                  <p className="text-sm md:text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mt-1">
                    {player.wallet_balance.toLocaleString()}
                  </p>
                  <p className="text-[8px] md:text-xs text-muted-foreground">CAMLY</p>
                  <p className="text-[10px] md:text-sm font-bold text-green-500 mt-1 flex items-center justify-center gap-0.5">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">{getRewardForRank(pos)}</span>
                    <span className="md:hidden">{pos === 1 ? '50K' : pos === 2 ? '30K' : '20K'}</span>
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

      {/* ============= PHẦN THÀNH TÍCH CỦA BẠN - LAYOUT NGANG ============= */}
      <motion.div 
        className="mt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Header thành tích */}
        <h2 className="text-lg md:text-xl font-bold text-center mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Medal className="w-5 h-5 text-purple-500" />
          Thành tích của bạn
        </h2>
        
        {/* ============= RANK BAR - 6 Ô NẰM NGANG ============= */}
        {/* Cho phép scroll ngang trên mobile, grid 6 cột trên desktop */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide md:grid md:grid-cols-6 md:overflow-visible">
          {honorItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex-shrink-0 w-[72px] md:w-auto"
            >
              {/* Card thành tích với gradient */}
              <div className={`${item.bgColor} rounded-xl p-2 md:p-3 text-center shadow-md hover:shadow-lg transition-all h-full`}>
                {/* Icon trên cùng */}
                <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1 rounded-lg bg-white/30 flex items-center justify-center">
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-white drop-shadow" />
                </div>
                {/* Chữ key (H, T, G, B, N, L) */}
                <p className="text-white font-bold text-lg md:text-xl drop-shadow">{item.key}</p>
                {/* Giá trị */}
                <p className="text-white/90 text-xs md:text-sm font-semibold truncate">{item.value}</p>
                {/* Label */}
                <p className="text-white/70 text-[9px] md:text-[10px] truncate">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Nút nhận thưởng */}
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
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:scale-105 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto text-sm"
            >
              <Wallet className="w-4 h-4" />
              {claiming ? "Đang nhận..." : `Nhận ${stats.unclaimedRewards.toLocaleString()} CAMLY`}
              <Sparkles className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* ============= TIẾN ĐỘ THÀNH TÍCH - 3 Ô NẰM NGANG ============= */}
        <motion.div 
          className="mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-base font-bold text-center mb-3 text-foreground">Tiến độ thành tích</h3>
          
          {/* 3 ô tiến độ luôn nằm ngang */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {progressItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-2 md:p-3 shadow-md text-center"
              >
                {/* Icon */}
                <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-1 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                {/* Số target */}
                <p className="font-bold text-foreground text-base md:text-lg">{item.target}</p>
                {/* Label */}
                <p className="text-[10px] md:text-xs text-muted-foreground">{item.label}</p>
                {/* Progress text */}
                <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 inline-block">
                  {item.current}/{item.target}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
