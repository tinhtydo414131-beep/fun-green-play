import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Info, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Game {
  id: string;
  title: string;
  description: string;
  genre: string;
  difficulty: string;
  thumbnail_url: string | null;
  total_likes: number;
  total_plays: number;
  how_to_play: string | null;
}

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(game.total_likes);
  const [plays, setPlays] = useState(game.total_plays);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, game.id]);

  useEffect(() => {
    // Reset image error when game changes or thumbnail updates
    setImageError(false);
  }, [game.id, game.thumbnail_url]);

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("game_ratings")
        .select("id")
        .eq("game_id", game.id)
        .eq("user_id", user.id)
        .eq("liked", true)
        .single();

      if (data) {
        setLiked(true);
      }
    } catch (error: any) {
      // No rating found
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to like games! 😊");
      return;
    }

    try {
      if (liked) {
        // Unlike
        await supabase
          .from("game_ratings")
          .delete()
          .eq("game_id", game.id)
          .eq("user_id", user.id);

        await supabase
          .from("games")
          .update({ total_likes: Math.max(0, likes - 1) })
          .eq("id", game.id);

        setLiked(false);
        setLikes(Math.max(0, likes - 1));
        toast.success("Removed from favorites 💔");
      } else {
        // Like
        await supabase
          .from("game_ratings")
          .insert({
            game_id: game.id,
            user_id: user.id,
            liked: true,
          });

        await supabase
          .from("games")
          .update({ total_likes: likes + 1 })
          .eq("id", game.id);

        setLiked(true);
        setLikes(likes + 1);
        toast.success("Added to favorites! ❤️");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Something went wrong! 😢");
    }
  };

  const difficultyColors = {
    easy: 'bg-primary/30 text-primary border-primary/50',
    medium: 'bg-secondary/30 text-secondary border-secondary/50',
    hard: 'bg-accent/30 text-accent border-accent/50',
  };

  const difficultyEmoji = {
    easy: '😊',
    medium: '😎',
    hard: '🔥',
  };

  // Generate thumbnail placeholder based on game genre - Green & Orange Theme!
  const genreColors = {
    casual: 'from-primary via-secondary to-accent',
    brain: 'from-secondary via-accent to-primary',
    adventure: 'from-primary to-secondary',
    educational: 'from-accent to-primary',
    racing: 'from-secondary to-primary',
    puzzle: 'from-primary via-accent to-secondary',
  };

  const genreEmojis = {
    casual: '🎯',
    brain: '🧠',
    adventure: '🗺️',
    educational: '📚',
    racing: '🏎️',
    puzzle: '🧩',
  };

  return (
    <Card className="game-card overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-4 border-primary/20 hover:border-primary/40 group max-w-[320px] mx-auto">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 aspect-video">
        {game.thumbnail_url && !imageError ? (
          <img 
            src={game.thumbnail_url} 
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${genreColors[game.genre as keyof typeof genreColors] || 'from-primary to-secondary'} flex flex-col items-center justify-center gap-4 relative overflow-hidden`}>
            {/* Animated Background Circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Game Emoji */}
            <span className="text-9xl filter drop-shadow-2xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10">
              {genreEmojis[game.genre as keyof typeof genreEmojis] || '🎮'}
            </span>
            
            {/* Game Title Overlay */}
            <div className="text-white text-2xl font-fredoka font-bold text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10 bg-black/30 backdrop-blur-sm rounded-2xl py-2">
              {game.title}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary/90 p-6 rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={`${difficultyColors[game.difficulty as keyof typeof difficultyColors]} border backdrop-blur-sm font-fredoka font-bold`}>
            {difficultyEmoji[game.difficulty as keyof typeof difficultyEmoji]} {game.difficulty}
          </Badge>
        </div>

        {/* Stats */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border-2 border-primary/30 flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-fredoka font-bold text-sm">{likes}</span>
          </div>
          <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border-2 border-accent/30 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="font-fredoka font-bold text-sm">{plays}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="game-title text-lg line-clamp-1 flex-1">
            {game.title}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-all hover:scale-110 ${
                liked ? 'bg-primary/20 text-primary' : 'bg-muted hover:bg-muted/80'
              }`}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart
                className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
              />
            </button>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-all hover:scale-110"
                  aria-label="How to play"
                >
                  <Info className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] glass-card">
                <DialogHeader>
                  <DialogTitle className="game-title flex items-center gap-2">
                    <span>Cách Chơi</span>
                    <span className="text-3xl">{genreEmojis[game.genre as keyof typeof genreEmojis] || '🎮'}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="description-text">
                    {game.how_to_play || "Bắt đầu chơi và vui vẻ thôi! 🎮"}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <p className="description-text text-sm line-clamp-2 min-h-[2.5rem]">
          {game.description || "Một trò chơi thú vị đang chờ bé!"}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex flex-col gap-1 text-sm">
            <div className="description-text flex items-center gap-1">
              <span className="font-bold">Đã chơi {plays} lần!</span>
            </div>
            <div className="description-text text-xs">
              <span>Cố lên nào! ⭐</span>
            </div>
          </div>
          
          <Link to={`/play/${game.id}`}>
            <Button 
              size="sm"
              className="diamond-btn"
            >
              Chơi ngay! 🎮
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
