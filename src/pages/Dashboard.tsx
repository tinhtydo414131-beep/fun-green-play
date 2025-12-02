import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Users, MessageCircle, Trophy, Home, Coins, History, Upload } from "lucide-react";
import { toast } from "sonner";
import { WalletConnect } from "@/components/WalletConnect";
import { AvatarUpload } from "@/components/AvatarUpload";
import { JoyBot } from "@/components/JoyBot";

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  wallet_address: string | null;
  wallet_balance: number;
  total_plays: number;
  total_likes: number;
  total_friends: number;
  total_messages: number;
  leaderboard_score: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
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
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Couldn't load your profile 😢");
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
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

          {/* Profile Header */}
          <Card className="mb-8 border-4 border-primary/30 shadow-xl bg-gradient-to-br from-background to-primary/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <AvatarUpload 
                  currentAvatarUrl={profile.avatar_url}
                  onAvatarUpdate={(url) => setProfile({ ...profile, avatar_url: url })}
                />
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-primary mb-2">
                    {profile.username} 🎮
                  </h1>
                  <p className="text-xl text-muted-foreground font-comic">{profile.email}</p>
                  {profile.wallet_address && (
                    <p className="text-sm text-muted-foreground mt-2 font-mono">
                      🔗 {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-comic mb-2">Leaderboard Rank</p>
                  <div className="text-5xl font-fredoka font-bold text-primary">
                    #{Math.floor(Math.random() * 100) + 1}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-2 border-primary/30 hover:border-primary transition-all hover:shadow-lg transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-fredoka text-muted-foreground">Games Played</CardTitle>
                <Gamepad2 className="w-6 h-6 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-fredoka font-bold text-primary">{profile.total_plays}</div>
                <p className="text-sm text-muted-foreground font-comic mt-1">Keep playing! 🎯</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/30 hover:border-accent transition-all hover:shadow-lg transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-fredoka text-muted-foreground">Friends</CardTitle>
                <Users className="w-6 h-6 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-fredoka font-bold text-accent">{profile.total_friends}</div>
                <p className="text-sm text-muted-foreground font-comic mt-1">Making friends! 👥</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/30 hover:border-secondary transition-all hover:shadow-lg transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-fredoka text-muted-foreground">Messages</CardTitle>
                <MessageCircle className="w-6 h-6 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-fredoka font-bold text-secondary">{profile.total_messages}</div>
                <p className="text-sm text-muted-foreground font-comic mt-1">Chat away! 💬</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 hover:border-primary transition-all hover:shadow-lg transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-fredoka text-muted-foreground">Total Score</CardTitle>
                <Trophy className="w-6 h-6 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-fredoka font-bold text-primary">{profile.leaderboard_score}</div>
                <p className="text-sm text-muted-foreground font-comic mt-1">You're awesome! ⭐</p>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Section */}
          <WalletConnect />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Button
              onClick={() => navigate("/games")}
              className="h-24 text-xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:scale-105 transition-all"
            >
              <Gamepad2 className="mr-2 h-6 w-6" />
              Play Games 🎮
            </Button>
            <Button
              onClick={() => navigate("/upload-game")}
              className="h-24 text-xl font-fredoka font-bold bg-gradient-to-r from-accent to-secondary hover:shadow-lg transform hover:scale-105 transition-all"
            >
              <Upload className="mr-2 h-6 w-6" />
              Upload Game 🎨
            </Button>
            <Button
              onClick={() => navigate("/my-games")}
              variant="outline"
              className="h-24 text-xl font-fredoka font-bold border-4 border-primary/30 hover:border-primary hover:bg-primary/10 transform hover:scale-105 transition-all"
            >
              <Gamepad2 className="mr-2 h-6 w-6" />
              My Games 📁
            </Button>
            <Button
              variant="outline"
              className="h-24 text-xl font-fredoka font-bold border-4 border-accent/30 hover:border-accent hover:bg-accent/10 transform hover:scale-105 transition-all"
            >
              <Users className="mr-2 h-6 w-6" />
              Find Friends 👋
            </Button>
            <Button
              variant="outline"
              className="h-24 text-xl font-fredoka font-bold border-4 border-secondary/30 hover:border-secondary hover:bg-secondary/10 transform hover:scale-105 transition-all"
            >
              <Trophy className="mr-2 h-6 w-6" />
              Leaderboard 🏆
            </Button>
          </div>
        </div>
      </section>
      <JoyBot />
    </div>
  );
}
