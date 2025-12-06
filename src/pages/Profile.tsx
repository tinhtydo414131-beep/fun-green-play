import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Gamepad2, Users, MessageCircle, Trophy, Home, 
  Edit2, Save, X, Wallet, Crown, Copy, Check,
  ArrowUpRight, ArrowDownLeft, Settings, LogOut, Share2,
  Sparkles, TrendingUp, Flame, Calendar, History, Medal, Star
} from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/AvatarUpload";
import { JoyBot } from "@/components/JoyBot";
import { HonorBoard } from "@/components/profile/HonorBoard";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { ClaimRewardsModal } from "@/components/ClaimRewardsModal";
import { Web3RewardNotification } from "@/components/Web3RewardNotification";
import { useWeb3Rewards } from "@/hooks/useWeb3Rewards";
import { useReferral } from "@/hooks/useReferral";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import camlyCoinPro from "@/assets/camly-coin-pro.png";
import bnbLogo from "@/assets/tokens/bnb-logo.png";
import ethLogo from "@/assets/tokens/eth-logo.png";
import usdtLogo from "@/assets/tokens/usdt-logo.png";

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  wallet_address: string | null;
  wallet_balance: number;
  total_plays: number;
  total_likes: number;
  total_friends: number;
  total_messages: number;
  leaderboard_score: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
}

const tokens = [
  { symbol: "CAMLY", name: "CAMLY", gradient: "from-pink-400 via-yellow-300 to-pink-500", image: camlyCoinPro },
  { symbol: "BNB", name: "BNB", gradient: "from-yellow-400 to-yellow-600", image: bnbLogo },
  { symbol: "ETH", name: "ETH", gradient: "from-blue-400 to-purple-600", image: ethLogo },
  { symbol: "USDT", name: "USDT", gradient: "from-green-400 to-green-600", image: usdtLogo },
];

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [userRank, setUserRank] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  
  const { totalReferrals } = useReferral();
  const {
    camlyBalance,
    walletAddress,
    isConnected,
    isLoading: web3Loading,
    dailyStreak,
    pendingReward,
    connectWallet,
    claimDailyCheckin,
    claimToWallet,
    canClaimDailyCheckin,
    clearPendingReward,
    REWARDS,
    getStreakMultiplier,
    CAMLY_CONTRACT_ADDRESS,
  } = useWeb3Rewards();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserRank();
      fetchTransactions();
      generateChartData();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditForm({ username: data.username, bio: data.bio || "" });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Couldn't load your profile 😢");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, wallet_balance")
        .order("wallet_balance", { ascending: false });

      if (error) throw error;
      const rank = data?.findIndex(p => p.id === user?.id) ?? -1;
      setUserRank(rank + 1);
    } catch (error) {
      console.error("Error fetching rank:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("camly_coin_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const generateChartData = () => {
    // Generate sample chart data
    const data = [];
    const now = Date.now();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        price: 0.000004 + Math.random() * 0.000001
      });
    }
    setChartData(data);
  };

  const handleSaveProfile = async () => {
    if (!editForm.username.trim()) {
      toast.error("Username cannot be empty!");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          username: editForm.username.trim(),
          bio: editForm.bio.trim() || null
        })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { 
        ...prev, 
        username: editForm.username.trim(),
        bio: editForm.bio.trim() || null
      } : null);
      setEditing(false);
      toast.success("Profile updated! 🎉");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Couldn't save profile 😢");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied! 📋");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenAddress = (address: string | null) => {
    if (!address) return "Not connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Gamepad2 className="w-16 h-16 text-primary animate-bounce mx-auto" />
          <p className="text-2xl font-fredoka text-primary">Loading... ⏳</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <p className="text-2xl font-fredoka text-muted-foreground">Profile not found 😢</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-24">
      <Navigation />
      
      <section className="pt-24 md:pt-32 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          
          {/* ═══════════ HERO SECTION ═══════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col items-center text-center gap-4">
                  {/* Avatar + Name */}
                  <div className="relative">
                    <AvatarUpload 
                      currentAvatarUrl={profile.avatar_url}
                      onAvatarUpdate={(url) => setProfile({ ...profile, avatar_url: url })}
                    />
                    {userRank <= 3 && userRank > 0 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-y-3 w-full max-w-sm">
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Username"
                        className="text-center text-lg"
                      />
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Bio..."
                        rows={2}
                      />
                      <div className="flex gap-2 justify-center">
                        <Button onClick={handleSaveProfile} disabled={saving} size="sm">
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-fredoka font-bold text-foreground">
                          {profile.username}
                        </h1>
                        <Button onClick={() => setEditing(true)} variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {profile.bio && (
                        <p className="text-muted-foreground text-sm max-w-md">{profile.bio}</p>
                      )}
                    </>
                  )}

                  {/* Balance Display */}
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Tổng số dư CAMLY</p>
                    <motion.p
                      key={camlyBalance}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-4xl md:text-5xl font-fredoka font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent"
                    >
                      {camlyBalance.toLocaleString()}
                    </motion.p>
                    {isConnected && walletAddress && (
                      <button 
                        onClick={handleCopyAddress}
                        className="flex items-center gap-2 mx-auto mt-2 text-sm text-muted-foreground hover:text-foreground transition"
                      >
                        <span className="font-mono">{shortenAddress(walletAddress)}</span>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Send / Receive Buttons */}
                  <div className="flex gap-3 mt-4 w-full max-w-xs">
                    <Button 
                      onClick={() => navigate('/wallet')}
                      className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-2xl shadow-lg"
                    >
                      <ArrowUpRight className="w-5 h-5 mr-2" />
                      Send
                    </Button>
                    <Button 
                      onClick={() => navigate('/wallet')}
                      className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl shadow-lg"
                    >
                      <ArrowDownLeft className="w-5 h-5 mr-2" />
                      Receive
                    </Button>
                  </div>

                  {/* Connect Wallet if not connected */}
                  {!isConnected && (
                    <Button
                      onClick={() => setShowConnectModal(true)}
                      variant="outline"
                      className="mt-2 border-yellow-500/50 hover:bg-yellow-500/10"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet (+{REWARDS.FIRST_WALLET_CONNECT.toLocaleString()} CAMLY)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══════════ COIN CHART ═══════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="font-fredoka text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Token Prices
                  </CardTitle>
                  <div className="flex gap-1 flex-wrap">
                    {tokens.map((token) => (
                      <Button
                        key={token.symbol}
                        variant={selectedToken.symbol === token.symbol ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedToken(token)}
                        className={`h-8 px-3 rounded-full ${
                          selectedToken.symbol === token.symbol 
                            ? `bg-gradient-to-r ${token.gradient}` 
                            : ''
                        }`}
                      >
                        <img src={token.image} alt={token.symbol} className="w-4 h-4 mr-1 rounded-full" />
                        {token.symbol}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[150px] md:h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v.toFixed(6)} width={60} />
                      <Tooltip formatter={(v: number) => ['$' + v.toFixed(6), 'Price']} />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="url(#colorGradient)" 
                        strokeWidth={3}
                        dot={false}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f472b6" />
                          <stop offset="50%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══════════ MAIN CONTENT GRID ═══════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-secondary/20 shadow-xl h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="font-fredoka text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-secondary" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {transactions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                    ) : (
                      transactions.map((tx) => (
                        <div 
                          key={tx.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.amount > 0 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{tx.description || tx.transaction_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <p className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <Button 
                    onClick={() => navigate('/rewards-history')}
                    variant="ghost" 
                    className="w-full mt-3"
                  >
                    View All History
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mini Honor Board */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-accent/20 shadow-xl h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="font-fredoka text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Honor Board
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HonorBoard 
                    profile={{ ...profile, wallet_address: profile.wallet_address }} 
                    userRank={userRank}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ═══════════ DAILY CHECK-IN ═══════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="border-2 border-yellow-500/30 shadow-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-fredoka font-bold text-lg">Daily Check-in</p>
                      {dailyStreak > 0 && (
                        <p className="text-sm text-muted-foreground">
                          🔥 {dailyStreak}-day streak ({getStreakMultiplier(dailyStreak)}x bonus)
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={claimDailyCheckin}
                    disabled={!canClaimDailyCheckin()}
                    className="md:ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 h-12 px-8 text-lg font-bold rounded-2xl"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    {canClaimDailyCheckin() ? `Claim +${Math.floor(REWARDS.DAILY_CHECKIN * getStreakMultiplier(dailyStreak + 1)).toLocaleString()} CAMLY` : 'Already Claimed'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══════════ QUICK ACTIONS ═══════════ */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => navigate("/games")}
              className="h-16 text-base font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-lg rounded-2xl"
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Play 🎮
            </Button>
            <Button
              onClick={() => navigate("/friends")}
              variant="outline"
              className="h-16 text-base font-bold border-2 rounded-2xl"
            >
              <Users className="mr-2 h-5 w-5" />
              Friends
            </Button>
            <Button
              onClick={() => navigate("/chat")}
              variant="outline"
              className="h-16 text-base font-bold border-2 rounded-2xl"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat
            </Button>
            <Button
              onClick={() => navigate("/camly-leaderboard")}
              variant="outline"
              className="h-16 text-base font-bold border-2 rounded-2xl"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Rank
            </Button>
          </motion.div>

          {/* ═══════════ FOOTER BUTTONS ═══════════ */}
          <motion.div 
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => {
                const url = `${window.location.origin}/profile/${profile.id}`;
                navigator.clipboard.writeText(url);
                toast.success("Profile link copied!");
              }}
              variant="ghost"
              className="text-muted-foreground"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
            <Button
              onClick={() => navigate("/settings")}
              variant="ghost"
              className="text-muted-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={connectWallet}
        isConnected={isConnected}
        walletAddress={walletAddress}
      />

      <ClaimRewardsModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        camlyBalance={camlyBalance}
        walletAddress={walletAddress}
        onClaim={claimToWallet}
        contractAddress={CAMLY_CONTRACT_ADDRESS}
      />

      <Web3RewardNotification
        isOpen={!!pendingReward}
        amount={pendingReward?.amount || 0}
        description={pendingReward?.description || ''}
        onClose={clearPendingReward}
      />

      <JoyBot />
    </div>
  );
}