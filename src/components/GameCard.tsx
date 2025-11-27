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
    <Card className="group overflow-hidden border-[3px] border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-[0_20px_50px_rgba(139,70,255,0.3)] animate-fade-in transform hover:-translate-y-2 rounded-[24px]">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
        {game.thumbnail_url && !imageError ? (
          <img 
            src={game.thumbnail_url} 
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${genreColors[game.genre as keyof typeof genreColors] || 'from-primary to-secondary'} flex flex-col items-center justify-center gap-4 relative overflow-hidden`}>
            {/* Animated Background Circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Game Emoji */}
            <span className="text-8xl filter drop-shadow-2xl transform group-hover:scale-110 transition-all duration-500 relative z-10">
              {genreEmojis[game.genre as keyof typeof genreEmojis] || '🎮'}
            </span>
            
            {/* Game Title Overlay */}
            <div className="text-white text-xl font-fredoka font-bold text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10 bg-black/30 backdrop-blur-sm rounded-2xl py-2">
              {game.title}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary/95 p-5 rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        {/* Difficulty Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <Badge className={`${difficultyColors[game.difficulty as keyof typeof difficultyColors]} border-2 backdrop-blur-sm font-fredoka font-bold text-xs px-2.5 py-1 shadow-lg`}>
            {difficultyEmoji[game.difficulty as keyof typeof difficultyEmoji]} {game.difficulty}
          </Badge>
        </div>

        {/* Stats - Bottom Left */}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full border-2 border-primary/20 flex items-center gap-1 shadow-md">
            <Heart className="w-3.5 h-3.5 text-red-500" />
            <span className="font-fredoka font-bold text-xs text-foreground">{likes}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full border-2 border-accent/20 flex items-center gap-1 shadow-md">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <span className="font-fredoka font-bold text-xs text-foreground">{plays}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3 bg-white">
        <h3 className="text-xl font-fredoka font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {game.title}
        </h3>
        <p className="text-muted-foreground text-sm font-comic line-clamp-2 min-h-[40px]">
          {game.description}
        </p>

        <div className="flex gap-2 pt-1">
          <Link to={`/game/${game.id}`} className="flex-1">
            <Button className="w-full group/btn font-fredoka font-bold text-base py-5 bg-gradient-to-r from-[#8B46FF] via-secondary to-[#00F2FF] hover:shadow-xl transition-all rounded-[20px] border-0">
              <span className="mr-1.5">Play Now!</span>
              <span className="text-lg">🎮</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={handleLike}
            className={`border-2 transition-all transform hover:scale-110 w-12 h-12 rounded-[16px] flex-shrink-0 ${
              liked 
                ? 'bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600' 
                : 'border-primary/30 hover:border-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-white text-white' : 'text-red-500'}`} />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all transform hover:scale-110 w-12 h-12 rounded-[16px] flex-shrink-0"
              >
                <TrendingUp className="w-5 h-5 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="border-4 border-primary/30 max-w-[calc(100vw-2rem)] sm:max-w-2xl mx-4 rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="font-fredoka text-2xl text-primary">
                  How to Play {game.title} 🎮
                </DialogTitle>
                <DialogDescription className="font-comic text-base pt-4">
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
