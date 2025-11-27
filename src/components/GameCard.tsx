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
    <Card className="group overflow-hidden border-0 bg-card rounded-[24px] hover:shadow-[0_20px_50px_rgba(139,70,255,0.25)] animate-fade-in transform hover:-translate-y-2 transition-all duration-300">
      {/* Game Preview Image */}
      <div className="relative aspect-video overflow-hidden rounded-t-[24px]">
        {game.thumbnail_url && !imageError ? (
          <img 
            src={game.thumbnail_url} 
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${genreColors[game.genre as keyof typeof genreColors] || 'from-primary to-secondary'} flex flex-col items-center justify-center gap-4 relative overflow-hidden`}>
            {/* Animated Background Circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Game Emoji */}
            <span className="text-7xl sm:text-9xl filter drop-shadow-2xl transform group-hover:scale-110 transition-all duration-500 relative z-10">
              {genreEmojis[game.genre as keyof typeof genreEmojis] || '🎮'}
            </span>
          </div>
        )}

        {/* Top Stats - Heart & Play Count (Top Left) */}
        <div className="absolute top-3 left-3 flex gap-2">
          <button
            onClick={handleLike}
            className={`bg-white rounded-full p-2 shadow-lg transition-all transform hover:scale-110 ${
              liked ? 'bg-red-500' : 'bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-white text-white' : 'text-red-500'}`} />
          </button>
          <div className="bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-1">
            <span className="font-fredoka font-bold text-sm text-foreground">{likes}</span>
          </div>
          <button className="bg-white rounded-full p-2 shadow-lg flex items-center gap-1 px-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="font-fredoka font-bold text-sm text-foreground">{plays}</span>
          </button>
        </div>

        {/* Difficulty Badge (Top Right) */}
        <div className="absolute top-3 right-3">
          <Badge className={`${difficultyColors[game.difficulty as keyof typeof difficultyColors]} border-2 backdrop-blur-sm font-fredoka font-bold rounded-full px-3 py-1`}>
            {difficultyEmoji[game.difficulty as keyof typeof difficultyEmoji]} {game.difficulty}
          </Badge>
        </div>
      </div>
      
      {/* Card Content */}
      <CardContent className="p-5 space-y-3 bg-white">
        <h3 className="text-xl font-fredoka font-bold text-foreground line-clamp-1">
          {game.title}
        </h3>
        <p className="text-muted-foreground text-sm font-comic line-clamp-2 min-h-[40px]">
          {game.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link to={`/game/${game.id}`} className="flex-1">
            <Button className="w-full group/btn font-fredoka font-bold text-base py-5 bg-gradient-to-r from-[#8B46FF] to-[#00F2FF] hover:shadow-lg transition-all rounded-[20px] border-0">
              <span className="mr-2">🎮</span>
              Play Now!
              <Play className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all transform hover:scale-110 min-w-[48px] min-h-[48px] rounded-[16px]"
              >
                <Heart className="w-5 h-5 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="border-4 border-primary/30 max-w-[calc(100vw-2rem)] sm:max-w-2xl mx-4 rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-fredoka text-xl sm:text-3xl text-primary">
                  How to Play {game.title} 🎮
                </DialogTitle>
                <DialogDescription className="font-comic text-sm sm:text-lg pt-4">
                  {game.how_to_play ? (
                    <div className="space-y-2 text-left">
                      {game.how_to_play.split('\n').map((line, i) => (
                        <p key={i} className="text-foreground">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Click "Play Now" to start the game and learn as you play! Have fun! 🌟
                    </p>
                  )}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
