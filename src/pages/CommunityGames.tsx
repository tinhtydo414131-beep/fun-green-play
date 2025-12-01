import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Play, Search, TrendingUp, Clock, Star, Download, X } from "lucide-react";

interface CommunityGame {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_path: string | null;
  game_file_path: string;
  play_count: number;
  rating: number;
  download_count: number;
  created_at: string;
  profiles: {
    username: string;
  };
}

const CommunityGames = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<CommunityGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<CommunityGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [playingGame, setPlayingGame] = useState<CommunityGame | null>(null);
  const [gameUrl, setGameUrl] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    filterAndSortGames();
  }, [games, searchQuery, selectedCategory, sortBy]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_games')
        .select(`
          *,
          profiles!uploaded_games_user_id_fkey (username)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGames = () => {
    let filtered = games;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(g => g.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.play_count - a.play_count);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredGames(filtered);
  };

  const handlePlayGame = async (game: CommunityGame) => {
    if (!user) {
      toast.error("Please sign in to play games");
      return;
    }

    try {
      // Check balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.wallet_balance || 0) < 10000) {
        toast.error("Insufficient Camly Coins! You need 10,000 coins to play.");
        return;
      }

      // Deduct coins
      await supabase
        .from('profiles')
        .update({ 
          wallet_balance: (profile.wallet_balance || 0) - 10000
        })
        .eq('id', user.id);

      // Record play
      await supabase
        .from('game_plays')
        .insert({
          game_id: game.id,
          user_id: user.id
        });

      // Update play count
      await supabase
        .from('uploaded_games')
        .update({ 
          play_count: game.play_count + 1
        })
        .eq('id', game.id);

      // Get game URL
      const { data } = supabase.storage
        .from('uploaded-games')
        .getPublicUrl(game.game_file_path);

      setGameUrl(data.publicUrl);
      setPlayingGame(game);
      toast.success("🎮 Game started! -10,000 Camly Coins");
    } catch (error: any) {
      console.error("Play error:", error);
      toast.error("Failed to start game");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Games</h1>
          <p className="text-muted-foreground">Play games created by our community!</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="puzzle">Puzzle</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="racing">Racing</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="arcade">Arcade</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground">No games found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Card key={game.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  {game.thumbnail_path ? (
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/uploaded-games/${game.thumbnail_path}`}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-6xl">🎮</span>
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2">{game.category}</Badge>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {game.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    by {game.profiles.username}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {game.play_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {game.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {game.download_count}
                    </span>
                  </div>

                  <Button
                    onClick={() => handlePlayGame(game)}
                    className="w-full"
                    disabled={!user}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play (10K Coins)
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Game Player Dialog */}
      <Dialog open={!!playingGame} onOpenChange={() => setPlayingGame(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{playingGame?.title}</DialogTitle>
              <Button
                onClick={() => setPlayingGame(null)}
                variant="ghost"
                size="icon"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          {gameUrl && (
            <iframe
              src={gameUrl}
              className="w-full h-[70vh] border-0 rounded-lg"
              title={playingGame?.title}
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityGames;
