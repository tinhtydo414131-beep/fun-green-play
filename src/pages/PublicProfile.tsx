import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Users, MessageCircle, Trophy, ArrowLeft, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { FriendActionButton } from "@/components/FriendActionButton";
import { useAuth } from "@/hooks/useAuth";

interface PublicProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  total_plays: number;
  total_likes: number;
  total_friends: number;
  total_messages: number;
  leaderboard_score: number;
}

interface FavoriteGame {
  game_id: string;
  games: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    genre: string;
  };
}

interface RecentGame {
  game_id: string;
  highest_level_completed: number;
  total_stars: number;
  updated_at: string;
  games: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    genre: string;
  };
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [favoriteGames, setFavoriteGames] = useState<FavoriteGame[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (user && userId === user.id) {
      navigate("/profile");
    }
  }, [user, userId, navigate]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchFavoriteGames();
      fetchRecentGames();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio, total_plays, total_likes, total_friends, total_messages, leaderboard_score")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Không thể tải thông tin profile!");
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteGames = async () => {
    try {
      const { data, error } = await supabase
        .from("game_ratings")
        .select(`
          game_id,
          games:game_id (
            id,
            title,
            thumbnail_url,
            genre
          )
        `)
        .eq("user_id", userId)
        .eq("liked", true)
        .limit(6);

      if (error) throw error;
      setFavoriteGames(data as FavoriteGame[] || []);
    } catch (error: any) {
      console.error("Error fetching favorite games:", error);
    }
  };

  const fetchRecentGames = async () => {
    try {
      const { data, error } = await supabase
        .from("game_progress")
        .select(`
          game_id,
          highest_level_completed,
          total_stars,
          updated_at,
          games:game_id (
            id,
            title,
            thumbnail_url,
            genre
          )
        `)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentGames(data as RecentGame[] || []);
    } catch (error: any) {
      console.error("Error fetching recent games:", error);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      toast.success("Đã copy link profile! 🎉");
    }).catch(() => {
      toast.error("Không thể copy link!");
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
          <p className="text-2xl font-fredoka text-primary">Đang tải profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center space-y-6">
          <div className="text-8xl mb-4">🤷</div>
          <h1 className="text-4xl font-fredoka text-primary font-bold">
            Không tìm thấy người dùng
          </h1>
          <p className="text-xl font-comic text-muted-foreground">
            Có thể người dùng này không tồn tại hoặc đã bị xóa
          </p>
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="font-fredoka font-bold text-lg"
          >
            <ArrowLeft className="mr-2" />
            Về Trang Chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back Button and Share Button */}
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="font-fredoka"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Quay lại
            </Button>
            <div className="flex items-center gap-2">
              {/* Friend Action Button */}
              {userId && profile && (
                <FriendActionButton 
                  targetUserId={userId} 
                  targetUsername={profile.username}
                  showMessage={true}
                />
              )}
              <Button
                onClick={handleShareProfile}
                variant="outline"
                className="font-fredoka"
              >
                <Share2 className="mr-2 w-4 h-4" />
                Chia sẻ
              </Button>
            </div>
          </div>

          {/* Profile Header */}
          <Card className="mb-8 border-4 border-primary/30 shadow-xl bg-gradient-to-br from-background to-primary/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-lg">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-5xl font-fredoka font-bold">
                    {profile.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-primary">
                    {profile.username} 🎮
                  </h1>
                  
                  {profile.bio && (
                    <p className="text-lg text-muted-foreground font-comic max-w-2xl">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                      <span className="font-comic">{profile.total_plays} trò chơi</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-5 h-5 text-accent" />
                      <span className="font-comic">{profile.total_friends} bạn bè</span>
                    </div>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="text-center bg-gradient-to-br from-primary to-secondary text-white rounded-2xl p-6 shadow-xl">
                  <p className="text-sm font-comic mb-1">Điểm số</p>
                  <div className="text-5xl font-fredoka font-bold">
                    {profile.leaderboard_score}
                  </div>
                  <Trophy className="w-6 h-6 mx-auto mt-2 opacity-80" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-primary/30 hover:border-primary transition-all hover:shadow-lg transform hover:scale-105">
              <CardContent className="p-6 text-center space-y-2">
                <Gamepad2 className="w-10 h-10 text-primary mx-auto" />
                <p className="text-sm font-comic text-muted-foreground">Trò chơi</p>
                <div className="text-4xl font-fredoka font-bold text-primary">
                  {profile.total_plays}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/30 hover:border-accent transition-all hover:shadow-lg transform hover:scale-105">
              <CardContent className="p-6 text-center space-y-2">
                <Users className="w-10 h-10 text-accent mx-auto" />
                <p className="text-sm font-comic text-muted-foreground">Bạn bè</p>
                <div className="text-4xl font-fredoka font-bold text-accent">
                  {profile.total_friends}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/30 hover:border-secondary transition-all hover:shadow-lg transform hover:scale-105">
              <CardContent className="p-6 text-center space-y-2">
                <MessageCircle className="w-10 h-10 text-secondary mx-auto" />
                <p className="text-sm font-comic text-muted-foreground">Tin nhắn</p>
                <div className="text-4xl font-fredoka font-bold text-secondary">
                  {profile.total_messages}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 hover:border-primary transition-all hover:shadow-lg transform hover:scale-105">
              <CardContent className="p-6 text-center space-y-2">
                <Trophy className="w-10 h-10 text-primary mx-auto" />
                <p className="text-sm font-comic text-muted-foreground">Tổng điểm</p>
                <div className="text-4xl font-fredoka font-bold text-primary">
                  {profile.leaderboard_score}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Favorite Games */}
          {favoriteGames.length > 0 && (
            <div className="mt-8">
              <h2 className="text-3xl font-fredoka font-bold text-primary mb-6 flex items-center gap-2">
                ❤️ Trò chơi yêu thích
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteGames.map((item) => (
                  <Card 
                    key={item.game_id}
                    className="border-2 border-primary/30 hover:border-primary transition-all hover:shadow-lg transform hover:scale-105 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/game/${item.game_id}`)}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={item.games.thumbnail_url || '/placeholder.svg'}
                        alt={item.games.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-fredoka font-bold text-lg text-primary mb-1">
                        {item.games.title}
                      </h3>
                      <p className="text-sm font-comic text-muted-foreground capitalize">
                        {item.games.genre}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recently Played Games */}
          {recentGames.length > 0 && (
            <div className="mt-8">
              <h2 className="text-3xl font-fredoka font-bold text-primary mb-6 flex items-center gap-2">
                🎯 Đã chơi gần đây
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentGames.map((item) => (
                  <Card 
                    key={item.game_id}
                    className="border-2 border-accent/30 hover:border-accent transition-all hover:shadow-lg transform hover:scale-105 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/game/${item.game_id}`)}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={item.games.thumbnail_url || '/placeholder.svg'}
                        alt={item.games.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-fredoka font-bold text-lg text-primary mb-2">
                        {item.games.title}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm font-comic">
                          <span className="text-muted-foreground">Level:</span>
                          <span className="font-bold text-primary">{item.highest_level_completed}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm font-comic">
                          <span className="text-muted-foreground">Sao:</span>
                          <span className="font-bold text-accent">⭐ {item.total_stars}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-6 bg-primary/5 border-2 border-primary/20 rounded-2xl text-center">
            <p className="text-sm font-comic text-muted-foreground">
              🎮 Profile công khai của <span className="font-bold text-primary">{profile.username}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
