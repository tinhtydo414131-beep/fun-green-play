import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { 
  Gamepad2, Users, MessageCircle, Trophy, Home, Upload, 
  Edit2, Save, X, Wallet, Crown, Music, Image as ImageIcon,
  TrendingUp, Medal, Star, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/AvatarUpload";
import { JoyBot } from "@/components/JoyBot";
import { HonorBoard } from "@/components/profile/HonorBoard";
import { ProfileBadges } from "@/components/profile/ProfileBadges";
import { ReferralTierProgress } from "@/components/ReferralTierProgress";
import { useReferral } from "@/hooks/useReferral";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";

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

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [userRank, setUserRank] = useState<number>(0);
  const { totalReferrals, referralEarnings } = useReferral();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserRank();
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
      // Get all users sorted by wallet_balance (total income)
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

  const shortenAddress = (address: string | null) => {
    if (!address) return "Not connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Gamepad2 className="w-16 h-16 text-primary animate-bounce mx-auto" />
          <p className="text-2xl font-fredoka text-primary">Loading your awesome profile... ⏳</p>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navigation />
      
      <section className="pt-24 md:pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header with Back & Theme Toggle */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="font-bold group"
            >
              <Home className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
              <span>Về Trang Chính</span>
            </Button>
            <ThemeToggle />
          </div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 border-4 border-primary/30 shadow-xl bg-gradient-to-br from-card to-primary/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
              <CardContent className="p-6 md:p-8 relative">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <AvatarUpload 
                      currentAvatarUrl={profile.avatar_url}
                      onAvatarUpdate={(url) => setProfile({ ...profile, avatar_url: url })}
                    />
                    {userRank <= 3 && userRank > 0 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center lg:text-left space-y-3">
                    {editing ? (
                      <div className="space-y-4 max-w-md">
                        <div>
                          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                          <Input
                            id="username"
                            value={editForm.username}
                            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                            className="mt-1"
                            placeholder="Your cool username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                          <Textarea
                            id="bio"
                            value={editForm.bio}
                            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                            className="mt-1"
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} disabled={saving} size="sm">
                            <Save className="w-4 h-4 mr-1" />
                            {saving ? "Saving..." : "Save"}
                          </Button>
                          <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 justify-center lg:justify-start">
                          <h1 className="text-3xl md:text-4xl font-fredoka font-bold text-primary">
                            {profile.username} 🎮
                          </h1>
                          <Button onClick={() => setEditing(true)} variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground font-comic">{profile.email}</p>
                        {profile.bio && (
                          <p className="text-sm text-foreground/80 max-w-md">{profile.bio}</p>
                        )}
                        <div className="flex items-center gap-2 justify-center lg:justify-start text-sm">
                          <Wallet className="w-4 h-4 text-secondary" />
                          <span className="font-mono text-muted-foreground">
                            {shortenAddress(profile.wallet_address)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Rank Display */}
                  <div className="text-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border-2 border-primary/20">
                    <p className="text-sm text-muted-foreground font-comic mb-1">Top User Rank</p>
                    <div className="text-5xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      #{userRank || "—"}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">Top Player!</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 h-auto p-1 bg-muted/50">
              <TabsTrigger value="overview" className="font-fredoka py-3">
                <Trophy className="w-4 h-4 mr-2" />
                Honor Board
              </TabsTrigger>
              <TabsTrigger value="badges" className="font-fredoka py-3">
                <Medal className="w-4 h-4 mr-2" />
                Badges
              </TabsTrigger>
              <TabsTrigger value="referral" className="font-fredoka py-3">
                <Users className="w-4 h-4 mr-2" />
                Referral
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <HonorBoard profile={profile} userRank={userRank} />
            </TabsContent>

            <TabsContent value="badges">
              <ProfileBadges totalReferrals={referralStats.totalReferrals} />
            </TabsContent>

            <TabsContent value="referral">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReferralTierProgress 
                  totalReferrals={referralStats.totalReferrals} 
                  referralEarnings={referralStats.referralEarnings} 
                />
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="font-fredoka flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Referral Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Total Invited</span>
                      <span className="font-bold text-xl text-primary">{referralStats.totalReferrals}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Total Earned</span>
                      <span className="font-bold text-xl text-yellow-500">
                        {referralStats.referralEarnings.toLocaleString()} CAMLY
                      </span>
                    </div>
                    <Button 
                      onClick={() => navigate("/dashboard")} 
                      className="w-full bg-gradient-to-r from-primary to-secondary"
                    >
                      View Full Referral Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              onClick={() => navigate("/games")}
              className="h-20 text-lg font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:scale-105 transition-all"
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Play 🎮
            </Button>
            <Button
              onClick={() => navigate("/friends")}
              variant="outline"
              className="h-20 text-lg font-fredoka font-bold border-2 border-accent/30 hover:border-accent hover:bg-accent/10"
            >
              <Users className="mr-2 h-5 w-5" />
              Friends 👋
            </Button>
            <Button
              onClick={() => navigate("/chat")}
              variant="outline"
              className="h-20 text-lg font-fredoka font-bold border-2 border-secondary/30 hover:border-secondary hover:bg-secondary/10"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat 💬
            </Button>
            <Button
              onClick={() => navigate("/camly-leaderboard")}
              variant="outline"
              className="h-20 text-lg font-fredoka font-bold border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Rank 🏆
            </Button>
          </motion.div>
        </div>
      </section>
      <JoyBot />
    </div>
  );
}
