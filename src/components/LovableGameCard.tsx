import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, User, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LovableGame {
  id: string;
  title: string;
  description: string | null;
  project_url: string;
  image_url: string | null;
  user_id: string | null;
  created_at: string;
}

interface GameAuthor {
  username: string;
  avatar_url: string | null;
}

interface LovableGameCardProps {
  game: LovableGame;
  onPlay: (game: LovableGame) => void;
}

export const LovableGameCard = ({ game, onPlay }: LovableGameCardProps) => {
  const [author, setAuthor] = useState<GameAuthor | null>(null);

  useEffect(() => {
    fetchAuthor();
  }, [game.user_id]);

  const fetchAuthor = async () => {
    if (!game.user_id) {
      setAuthor({ username: "FUN Planet Team", avatar_url: null });
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', game.user_id)
      .maybeSingle();

    if (data) {
      setAuthor(data);
    }
  };

  return (
    <Card className="group overflow-hidden border-2 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-purple-600 to-pink-600">
            🎮
          </div>
        )}
        
        {/* Lovable Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            ✨ Lovable
          </Badge>
        </div>

        {/* New Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-green-500 text-white border-0 animate-pulse">
            🆕 NEW
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-bold text-foreground group-hover:text-purple-500 transition-colors line-clamp-1">
          {game.title}
        </h3>
        
        {/* Author Info */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-purple-500" />
          <span className="text-muted-foreground">Tạo bởi:</span>
          <span className="font-semibold text-purple-500 truncate">
            {author?.username || 'Loading...'}
          </span>
        </div>

        {game.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {game.description}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => onPlay(game)}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Chơi Ngay
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => window.open(game.project_url, '_blank')}
            className="border-purple-500/30 hover:border-purple-500"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
