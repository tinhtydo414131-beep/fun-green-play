import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Trophy, Gamepad2, Users, Music, Upload, Image, 
  Coins, Crown, Wallet, TrendingUp, Star, Sparkles,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface HonorBoardProps {
  profile: {
    id: string;
    wallet_balance: number;
    total_plays: number;
    total_friends: number;
  };
  userRank: number;
}

interface HonorStats {
  totalIncome: number;
  gamesUploaded: number;
  musicUploaded: number;
  nftCount: number;
  unclaimedRewards: number;
}

export function HonorBoard({ profile, userRank }: HonorBoardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<HonorStats>({
    totalIncome: 0,
    gamesUploaded: 0,
    musicUploaded: 0,
    nftCount: 0,
    unclaimedRewards: 0
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHonorStats();
    }
  }, [user]);

  const fetchHonorStats = async () => {
    try {
      // Get total income from web3_rewards
      const { data: rewards } = await supabase
        .from("web3_rewards")
        .select("camly_balance, referral_earnings")
        .eq("user_id", user?.id)
        .single();

      // Get uploaded games count
      const { count: gamesCount } = await supabase
        .from("uploaded_games")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      // Get approved games for bonus calculation
      const { count: approvedGames } = await supabase
        .from("uploaded_games")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("status", "approved");

      // Get uploaded music count
      const { count: musicCount } = await supabase
        .from("user_music")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      // Calculate total income
      const totalIncome = (rewards?.camly_balance || 0) + (rewards?.referral_earnings || 0) + profile.wallet_balance;

      // Calculate unclaimed (approved games * 1M each)
      const unclaimedRewards = (approvedGames || 0) * 1000000;

      setStats({
        totalIncome,
        gamesUploaded: gamesCount || 0,
        musicUploaded: musicCount || 0,
        nftCount: 0, // Will be fetched from wallet if connected
        unclaimedRewards
      });
    } catch (error) {
      console.error("Error fetching honor stats:", error);
    } finally {
      setLoading(false);
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
        description: `Bonus for ${stats.gamesUploaded} approved games`
      });

      toast.success(`Claimed ${stats.unclaimedRewards.toLocaleString()} CAMLY! 🎉`);
      setStats(prev => ({ ...prev, unclaimedRewards: 0 }));
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards");
    } finally {
      setClaiming(false);
    }
  };

  const honorItems = [
    {
      icon: Crown,
      label: "Top User Rank",
      value: `#${userRank || "—"}`,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      description: "Sorted by total income"
    },
    {
      icon: Coins,
      label: "Total Income",
      value: stats.totalIncome.toLocaleString(),
      suffix: "CAMLY",
      color: "from-primary to-secondary",
      bgColor: "bg-primary/10",
      description: "All earnings combined",
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
      description: "1M CAMLY per approved game",
      bonus: stats.gamesUploaded > 0 ? "🎮" : undefined
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
      description: "Share your tunes"
    },
    {
      icon: Gamepad2,
      label: "Games Played",
      value: profile.total_plays.toString(),
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10",
      description: "Keep playing!"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {honorItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`border-2 border-transparent hover:border-primary/30 transition-all hover:shadow-lg transform hover:scale-[1.02] ${item.bgColor}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  {item.bonus && (
                    <span className="text-2xl animate-bounce">{item.bonus}</span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground font-medium mb-1">{item.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-fredoka font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.value}
                  </span>
                  {item.suffix && (
                    <span className="text-sm font-medium text-muted-foreground">{item.suffix}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
                
                {item.action && (
                  <Button
                    onClick={item.action.onClick}
                    disabled={item.action.loading}
                    size="sm"
                    className="w-full mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    {item.action.loading ? (
                      <span className="animate-spin mr-2">⏳</span>
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
              <span className="text-muted-foreground">Games Master (Play 100 games)</span>
              <span className="font-bold text-primary">{Math.min(profile.total_plays, 100)}/100</span>
            </div>
            <Progress value={Math.min((profile.total_plays / 100) * 100, 100)} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Social Butterfly (10 friends)</span>
              <span className="font-bold text-primary">{Math.min(profile.total_friends, 10)}/10</span>
            </div>
            <Progress value={Math.min((profile.total_friends / 10) * 100, 100)} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Creator (Upload 5 games)</span>
              <span className="font-bold text-primary">{Math.min(stats.gamesUploaded, 5)}/5</span>
            </div>
            <Progress value={Math.min((stats.gamesUploaded / 5) * 100, 100)} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
