import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

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

    const { data, error } = await supabase
      .from("game_ratings")
      .select("id")
      .eq("game_id", game.id)
      .eq("user_id", user.id)
      .eq("liked", true)
      .maybeSingle();

    if (error) {
      console.error("Error checking if liked:", error);
      return;
    }

    if (data) {
      setLiked(true);
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
    <Card 
      className="group overflow-hidden border-0 animate-fade-in h-full flex flex-col relative rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, hsl(280, 90%, 65%), hsl(190, 100%, 60%), hsl(280, 85%, 55%))',
        backgroundSize: '200% 200%',
        animation: 'gradient-flow 4s ease infinite',
        padding: '5px',
        boxShadow: '0 0 30px hsla(280, 90%, 65%, 0.5), 0 0 60px hsla(190, 100%, 60%, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.6)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-[calc(1.5rem-5px)] h-full flex flex-col">
      <div 
        className="relative aspect-video overflow-hidden transition-all duration-500"
        style={{
          transform: isHovered 
            ? `perspective(1000px) rotateX(${(mousePosition.y - 0.5) * 10}deg) rotateY(${(mousePosition.x - 0.5) * -10}deg) translateZ(20px)` 
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {game.thumbnail_url && !imageError ? (
          <>
            <img 
              src={game.thumbnail_url} 
              alt={game.title}
              className="w-full h-full object-cover transition-all duration-700"
              style={{
                filter: 'contrast(1.45) saturate(1.8) brightness(1.25) drop-shadow(0 8px 20px rgba(0,0,0,0.5)) sharpen(1.2)',
                imageRendering: 'crisp-edges',
                transform: isHovered 
                  ? `scale(1.15) translateX(${(mousePosition.x - 0.5) * 20}px) translateY(${(mousePosition.y - 0.5) * 20}px) translateZ(30px)` 
                  : 'scale(1) translateX(0) translateY(0) translateZ(0)',
                transformStyle: 'preserve-3d',
                animation: 'breathing 4s ease-in-out infinite',
              }}
              onError={() => setImageError(true)}
            />
            {/* Animated light overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease',
                mixBlendMode: 'overlay',
                transformStyle: 'preserve-3d',
                transform: 'translateZ(40px)',
              }}
            />
            {/* Particle effects */}
            {isHovered && (
              <>
                <div className="absolute top-[10%] left-[20%] w-2 h-2 bg-primary/60 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-secondary/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-[30%] left-[60%] w-2 h-2 bg-accent/60 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[80%] left-[30%] w-2 h-2 bg-primary/60 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
              </>
            )}
          </>
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
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
        
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
      
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        <h3 className="text-xl font-fredoka font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {game.title}
        </h3>
        <p className="text-muted-foreground text-base font-comic line-clamp-3 leading-relaxed flex-1">
          {game.description}
        </p>

        <div className="flex items-center gap-2 pt-2">
          <Link to={`/game/${game.id}`} className="flex-1">
            <Button className="w-full h-14 group/btn font-fredoka font-bold text-base">
              <span>Play Now!</span>
              <span className="ml-1">🎮</span>
              <Play className="ml-2 w-5 h-5 transition-transform group-hover/btn:scale-125" />
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="icon"
            onClick={handleLike}
            className={`h-14 w-14 shrink-0 ${
              liked 
                ? 'opacity-100' 
                : 'opacity-80 hover:opacity-100'
            }`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-white text-white' : 'text-white'}`} />
          </Button>
        </div>
      </CardContent>
      </div>
    </Card>
  );
};
