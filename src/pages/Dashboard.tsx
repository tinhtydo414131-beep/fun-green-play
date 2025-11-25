import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Users, MessageCircle, Trophy, Wallet } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Profile Header */}
          <Card className="mb-8 border-4 border-primary/30 shadow-xl bg-gradient-to-br from-background to-primary/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl font-bold text-white shadow-lg">
                  {profile.username[0].toUpperCase()}
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <Card className="border-4 border-accent/30 shadow-xl bg-gradient-to-br from-background to-accent/5 mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-fredoka flex items-center gap-3">
                <Wallet className="w-8 h-8 text-accent" />
                Your Crypto Wallet 💰
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-comic">Balance</p>
                  <p className="text-4xl font-fredoka font-bold text-accent">
                    {profile.wallet_balance.toFixed(4)} ETH
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-accent to-secondary hover:shadow-lg transform hover:scale-105 transition-all text-lg font-bold px-6">
                  Connect Wallet 🔗
                </Button>
              </div>
              {!profile.wallet_address && (
                <p className="text-muted-foreground font-comic text-center p-4 bg-muted/30 rounded-lg">
                  Connect your MetaMask or WalletConnect to start earning crypto rewards! 🎁
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button
              onClick={() => navigate("/games")}
              className="h-24 text-xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:scale-105 transition-all"
            >
              <Gamepad2 className="mr-2 h-6 w-6" />
              Play Games 🎮
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
    </div>
  );
}
