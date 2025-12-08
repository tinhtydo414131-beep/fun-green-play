import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Download, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UploadedGame {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnail_path: string | null;
  play_count: number;
  download_count: number;
  rating: number | null;
  user_id: string;
  status: string;
}

interface GameAuthor {
  username: string;
  avatar_url: string | null;
  wallet_address: string | null;
}

interface UploadedGameCardProps {
  game: UploadedGame;
}

export const UploadedGameCard = ({ game }: UploadedGameCardProps) => {
  const [author, setAuthor] = useState<GameAuthor | null>(null);

  useEffect(() => {
    fetchAuthor();
  }, [game.user_id]);

  const fetchAuthor = async () => {
    if (!game.user_id) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, wallet_address')
      .eq('id', game.user_id)
      .maybeSingle();

    if (data) {
      setAuthor(data);
    }
  };

  const getThumbnailUrl = (path: string) => {
    const { data } = supabase.storage
      .from('uploaded-games')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAuthorDisplay = () => {
    if (!author) return 'Loading...';
    if (author.username) return author.username;
    if (author.wallet_address) return shortenAddress(author.wallet_address);
    return 'Anonymous';
  };

  return (
    <Card className="group overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl rounded-2xl">
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        {game.thumbnail_path ? (
          <img
            src={getThumbnailUrl(game.thumbnail_path)}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎮
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={game.status === 'approved' ? 'default' : 'secondary'}
            className={game.status === 'approved' ? 'bg-green-500' : ''}
          >
            {game.status === 'approved' ? '✅ Live' : '⏳ Pending'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Play className="w-3 h-3" />
            {game.play_count}
          </div>
          <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Download className="w-3 h-3" />
            {game.download_count}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {game.title}
        </h3>
        
        {/* Author Info - Key Feature */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Tạo bởi:</span>
          <span className="font-semibold text-primary truncate">
            {getAuthorDisplay()}
          </span>
        </div>

        {game.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {game.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {game.category}
          </Badge>
          {game.rating && game.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{game.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <Link to={`/game-details/${game.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-primary to-secondary">
            <Play className="w-4 h-4 mr-2" />
            Play Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
