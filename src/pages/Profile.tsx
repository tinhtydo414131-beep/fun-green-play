import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { 
  Gamepad2, Users, MessageCircle, Trophy, 
  Edit2, Save, X, Wallet, Crown, Copy, Check,
  ArrowUpRight, ArrowDownLeft, Settings, LogOut, Share2,
  Sparkles, Flame, Calendar, History, Camera, MapPin,
  ThumbsUp, MessageSquare, MoreHorizontal, Image as ImageIcon,
  Video, Smile, Send, Heart, UserPlus, Phone, Plus,
  Bookmark, Flag, Bell, Gift, ShoppingBag, Newspaper,
  PlayCircle, Store, Globe, Zap, Star, Music, Film
} from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/AvatarUpload";
import { JoyBot } from "@/components/JoyBot";
import { HonorBoard } from "@/components/profile/HonorBoard";
import { FacebookFeatureMenu } from "@/components/profile/FacebookFeatureMenu";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { ClaimRewardsModal } from "@/components/ClaimRewardsModal";
import { Web3RewardNotification } from "@/components/Web3RewardNotification";
import { useWeb3Rewards } from "@/hooks/useWeb3Rewards";
import { useReferral } from "@/hooks/useReferral";
import { motion, AnimatePresence } from "framer-motion";
import camlyCoinPro from "@/assets/camly-coin-pro.png";

// Facebook-style Feature Button Component
const FeatureButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  gradient, 
  badge 
}: { 
  icon: any; 
  label: string; 
  onClick: () => void; 
  gradient?: string;
  badge?: number;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-all group relative"
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
      gradient || 'bg-gradient-to-br from-primary to-secondary'
    }`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    {badge && badge > 0 && (
      <span className="absolute top-1 right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
      {label}
    </span>
  </motion.button>
);

// Story Card Component
const StoryCard = ({ 
  imageUrl, 
  username, 
  isAdd, 
  avatarUrl,
  onClick 
}: { 
  imageUrl?: string; 
  username: string; 
  isAdd?: boolean; 
  avatarUrl?: string;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="relative w-28 h-48 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group"
  >
    <div className={`absolute inset-0 ${
      isAdd 
        ? 'bg-gradient-to-b from-muted to-muted/80' 
        : 'bg-gradient-to-b from-primary/60 via-secondary/40 to-accent/60'
    }`} />
    
    {isAdd ? (
      <>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Avatar className="w-16 h-16 border-4 border-background shadow-lg mb-2">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl">
              {username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center -mt-6 border-4 border-background">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-semibold mt-4 px-2 text-center">Create Story</span>
        </div>
      </>
    ) : (
      <>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {username}
          </span>
        </div>
      </>
    )}
    
    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.button>
);

// Reaction Button Component
const ReactionButton = ({ 
  icon: Icon, 
  label, 
  count, 
  active, 
  activeColor, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  count?: number; 
  active?: boolean; 
  activeColor?: string;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      active 
        ? `${activeColor || 'text-primary'} bg-primary/10` 
        : 'text-muted-foreground hover:bg-muted'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
    <span className="font-medium text-sm">{label}</span>
    {count !== undefined && count > 0 && (
      <span className="text-xs bg-muted px-1.5 rounded-full">{count}</span>
    )}
  </motion.button>
);

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

interface ChatPreview {
  id: string;
  username: string;
  avatar_url: string | null;
  lastMessage: string;
  unread: boolean;
  online: boolean;
}

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
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [postContent, setPostContent] = useState("");
  
  const { totalReferrals } = useReferral();
  const {
    camlyBalance,
    walletAddress,
    isConnected,
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
      fetchChatPreviews();
      fetchFriends();
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
        .limit(5);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchChatPreviews = async () => {
    try {
      const { data: friendsData } = await supabase
        .from("friends")
        .select(`
          friend:profiles!friends_friend_id_fkey(id, username, avatar_url)
        `)
        .eq("user_id", user?.id)
        .limit(8);

      if (friendsData) {
        const previews: ChatPreview[] = friendsData.map((f: any, index: number) => ({
          id: f.friend.id,
          username: f.friend.username,
          avatar_url: f.friend.avatar_url,
          lastMessage: "Click to chat",
          unread: index < 2,
          online: Math.random() > 0.5
        }));
        setChatPreviews(previews);
      }
    } catch (error) {
      console.error("Error fetching chat previews:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const { data } = await supabase
        .from("friends")
        .select(`
          friend:profiles!friends_friend_id_fkey(id, username, avatar_url)
        `)
        .eq("user_id", user?.id)
        .limit(9);

      if (data) {
        setFriends(data.map((f: any) => f.friend));
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
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
    <div className="min-h-screen bg-muted/30 pb-24">
      <Navigation />
      
      {/* Facebook-style Cover & Profile Header */}
      <div className="pt-16">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-72 lg:h-80 bg-gradient-to-r from-primary via-secondary to-accent">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute bottom-4 right-4 gap-2"
          >
            <Camera className="w-4 h-4" />
            Edit Cover
          </Button>
        </div>

        {/* Profile Info Bar */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-20 pb-4 border-b border-border">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden bg-background shadow-xl">
                <AvatarUpload 
                  currentAvatarUrl={profile.avatar_url}
                  onAvatarUpdate={(url) => setProfile({ ...profile, avatar_url: url })}
                />
              </div>
              {userRank <= 3 && userRank > 0 && (
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div className="flex-1 text-center md:text-left md:pb-4">
              {editing ? (
                <div className="space-y-2 max-w-sm mx-auto md:mx-0">
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Username"
                    className="text-lg font-bold"
                  />
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Bio..."
                    rows={2}
                  />
                  <div className="flex gap-2">
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
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {profile.username}
                  </h1>
                  <p className="text-muted-foreground">
                    {profile.total_friends} friends · Rank #{userRank}
                  </p>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:pb-4">
              <Button 
                onClick={() => setEditing(true)} 
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
              <Button variant="outline" onClick={() => navigate('/wallet')} className="gap-2">
                <Wallet className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto py-2 -mx-4 px-4 md:mx-0 md:px-0">
            {["Posts", "About", "Friends", "Games", "Wallet"].map((tab, i) => (
              <Button 
                key={tab}
                variant={i === 0 ? "default" : "ghost"}
                className={i === 0 ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Intro Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Intro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.bio && (
                  <p className="text-sm text-center text-muted-foreground">{profile.bio}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-primary">{camlyBalance.toLocaleString()} CAMLY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span>Rank #{userRank} on Leaderboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.total_plays} games played</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.total_friends} friends</span>
                  </div>
                  {isConnected && walletAddress && (
                    <button 
                      onClick={handleCopyAddress}
                      className="flex items-center gap-2 w-full text-left hover:bg-muted p-2 rounded-lg transition"
                    >
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-xs truncate">{shortenAddress(walletAddress)}</span>
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <Button variant="outline" className="w-full" onClick={() => setEditing(true)}>
                  Edit Details
                </Button>
              </CardContent>
            </Card>

            {/* Friends Mini Grid */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Friends</CardTitle>
                  <Button variant="link" size="sm" onClick={() => navigate('/friends')}>
                    See All
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{profile.total_friends} friends</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {friends.slice(0, 9).map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      className="text-center hover:bg-muted p-2 rounded-lg transition"
                    >
                      <Avatar className="w-full aspect-square mb-1 rounded-lg">
                        <AvatarImage src={friend.avatar_url || ""} />
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-secondary text-white text-lg">
                          {friend.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium truncate">{friend.username}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {tx.amount > 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    </div>
                    <span className="flex-1 truncate">{tx.description || tx.transaction_type}</span>
                    <span className={tx.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/rewards-history')}>
                  View All
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center Content - Posts/Feed */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Stories Section */}
            <Card className="shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {/* Create Story */}
                  <StoryCard
                    isAdd
                    username={profile.username}
                    avatarUrl={profile.avatar_url || ""}
                    onClick={() => toast.info("Story feature coming soon!")}
                  />
                  {/* Friend Stories */}
                  {friends.slice(0, 4).map((friend) => (
                    <StoryCard
                      key={friend.id}
                      username={friend.username}
                      avatarUrl={friend.avatar_url}
                      onClick={() => toast.info(`Viewing ${friend.username}'s story`)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Facebook-style Feature Buttons */}
            <FacebookFeatureMenu variant="grid" showQuickActions={true} />

            {/* Create Post */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {profile.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder={`What's on your mind, ${profile.username?.split(' ')[0]}?`}
                    className="flex-1 rounded-full bg-muted border-0"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                </div>
                <div className="flex justify-around mt-3 pt-3 border-t">
                  <Button variant="ghost" className="flex-1 gap-2 text-red-500 hover:bg-red-500/10">
                    <Video className="w-5 h-5" />
                    <span className="hidden sm:inline">Live Video</span>
                  </Button>
                  <Button variant="ghost" className="flex-1 gap-2 text-green-500 hover:bg-green-500/10">
                    <ImageIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Photo</span>
                  </Button>
                  <Button variant="ghost" className="flex-1 gap-2 text-yellow-500 hover:bg-yellow-500/10">
                    <Smile className="w-5 h-5" />
                    <span className="hidden sm:inline">Feeling</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sample Post with Reactions */}
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {/* Post Header */}
                <div className="flex items-center gap-3 p-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {profile.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{profile.username}</p>
                    <p className="text-xs text-muted-foreground">Just now · 🌍 Public</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Post Content */}
                <p className="px-4 pb-3">
                  🎮 Just reached Rank #{userRank} on FUN Planet! Thanks to all my {profile.total_friends} friends for the support! 
                  <span className="text-primary"> #FUNPlanet #Gaming #CAMLY</span>
                </p>
                
                {/* Post Image/Banner */}
                <div className="bg-gradient-to-r from-primary via-secondary to-accent h-48 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Trophy className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-2xl font-bold">Rank #{userRank}</p>
                    <p className="text-sm opacity-80">{camlyBalance.toLocaleString()} CAMLY</p>
                  </div>
                </div>
                
                {/* Reactions Count */}
                <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-b">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <ThumbsUp className="w-3 h-3 text-white fill-white" />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <span>You and {Math.floor(Math.random() * 50) + 10} others</span>
                  </div>
                  <span>{Math.floor(Math.random() * 10) + 1} comments</span>
                </div>
                
                {/* Reaction Buttons */}
                <div className="flex justify-around p-1 border-b">
                  <ReactionButton
                    icon={ThumbsUp}
                    label="Like"
                    active={true}
                    activeColor="text-blue-500"
                    onClick={() => toast.success("Liked!")}
                  />
                  <ReactionButton
                    icon={MessageSquare}
                    label="Comment"
                    onClick={() => toast.info("Comment feature coming soon!")}
                  />
                  <ReactionButton
                    icon={Share2}
                    label="Share"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied!");
                    }}
                  />
                </div>
                
                {/* Quick Comment */}
                <div className="flex items-center gap-2 p-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                      {profile.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder="Write a comment..."
                    className="flex-1 rounded-full bg-muted border-0 h-9"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Send className="w-4 h-4 text-primary" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Daily Check-in Card */}
            <Card className="shadow-sm border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Daily Check-in</p>
                    {dailyStreak > 0 && (
                      <p className="text-sm text-muted-foreground">
                        🔥 {dailyStreak}-day streak ({getStreakMultiplier(dailyStreak)}x bonus)
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={claimDailyCheckin}
                    disabled={!canClaimDailyCheckin()}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {canClaimDailyCheckin() ? 'Claim' : 'Claimed'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Card */}
            <Card className="shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <img src={camlyCoinPro} alt="CAMLY" className="w-12 h-12" />
                  <div>
                    <p className="text-white/80 text-sm">Your Balance</p>
                    <p className="text-3xl font-bold">{camlyBalance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/wallet')}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button 
                    onClick={() => navigate('/wallet')}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                </div>
              </div>
              {!isConnected && (
                <CardContent className="p-4">
                  <Button
                    onClick={() => setShowConnectModal(true)}
                    variant="outline"
                    className="w-full border-yellow-500/50 hover:bg-yellow-500/10"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet (+{REWARDS.FIRST_WALLET_CONNECT.toLocaleString()} CAMLY)
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                onClick={() => navigate("/games")}
                className="h-16 flex-col gap-1 bg-gradient-to-br from-primary to-secondary"
              >
                <Gamepad2 className="h-5 w-5" />
                <span className="text-xs">Play</span>
              </Button>
              <Button
                onClick={() => navigate("/friends")}
                variant="outline"
                className="h-16 flex-col gap-1"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Friends</span>
              </Button>
              <Button
                onClick={() => navigate("/chat")}
                variant="outline"
                className="h-16 flex-col gap-1"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">Chat</span>
              </Button>
              <Button
                onClick={() => navigate("/camly-leaderboard")}
                variant="outline"
                className="h-16 flex-col gap-1"
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs">Rank</span>
              </Button>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap gap-2 justify-center pt-4">
              <Button
                onClick={() => {
                  const url = `${window.location.origin}/profile/${profile.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Profile link copied!");
                }}
                variant="ghost"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Right Sidebar - Honor Board + Messaging */}
          <div className="lg:col-span-4 space-y-4">
            {/* Honor Board */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Honor Board
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <HonorBoard 
                  profile={{ ...profile, wallet_address: profile.wallet_address }} 
                  userRank={userRank}
                  compact={true}
                />
              </CardContent>
            </Card>

            {/* Messenger-style Chat List */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Messages
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Input 
                  placeholder="Search messages" 
                  className="mt-2 h-9 rounded-full bg-muted border-0"
                />
              </CardHeader>
              <CardContent className="space-y-1 max-h-[350px] overflow-y-auto">
                {chatPreviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => navigate('/friends')}
                      className="mt-2"
                    >
                      Find friends to chat
                    </Button>
                  </div>
                ) : (
                  chatPreviews.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => navigate('/chat')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition text-left ${
                        chat.unread ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={chat.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                            {chat.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${chat.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {chat.username}
                        </p>
                        <p className={`text-sm truncate ${chat.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                      {chat.unread && (
                        <div className="w-3 h-3 bg-primary rounded-full shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </CardContent>
              <div className="p-3 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate('/chat')}
                >
                  See All in Messenger
                </Button>
              </div>
            </Card>

            {/* Online Friends */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {friends.slice(0, 6).map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => navigate('/chat')}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition"
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={friend.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                          {friend.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <span className="text-sm font-medium">{friend.username}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Messenger Style */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3">
        <AnimatePresence>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/chat')}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl flex items-center justify-center text-white relative"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-background">
              5
            </span>
          </motion.button>
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/games')}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center text-white"
        >
          <Gamepad2 className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/wallet')}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg flex items-center justify-center text-white"
        >
          <Wallet className="w-5 h-5" />
        </motion.button>
      </div>

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
