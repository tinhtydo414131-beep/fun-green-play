import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, X, Maximize2, Star, Users, Flame } from "lucide-react";
import { GamePreviewPlaceholder } from "@/components/GamePreviewPlaceholder";

interface FeaturedGame {
  id: string;
  title: string;
  thumbnail_path: string | null;
  external_url: string | null;
  play_count?: number;
  category: string;
}

export function FeaturedGamesSection() {
  const [games, setGames] = useState<FeaturedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<FeaturedGame | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchFeaturedGames();
  }, []);

  const fetchFeaturedGames = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_games')
        .select('id, title, thumbnail_path, external_url, category')
        .eq('status', 'approved')
        .not('external_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(8);

      if (!error && data) {
        setGames(data as FeaturedGame[]);
      }
    } catch (error) {
      console.error('Error fetching featured games:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThumbnailUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('uploaded-games').getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePlayGame = (game: FeaturedGame) => {
    setSelectedGame(game);
  };

  const closeGame = () => {
    setSelectedGame(null);
    setIsFullscreen(false);
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      puzzle: "🧩",
      adventure: "🗺️",
      casual: "🎮",
      educational: "📚",
      action: "⚡",
      racing: "🏎️",
      creative: "🎨",
    };
    return emojis[category] || "🎮";
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-video bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (games.length === 0) return null;

  return (
    <>
      <section id="featured-games" className="py-16 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full mb-4">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <span className="font-bold text-sm">HOT TODAY</span>
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
              Today's Featured Games 🎮
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Play instantly without leaving the page! No downloads, no registration required.
            </p>
          </motion.div>

          {/* Games Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="group relative overflow-hidden rounded-2xl border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:scale-105"
                  onClick={() => handlePlayGame(game)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    {getThumbnailUrl(game.thumbnail_path) ? (
                      <img
                        src={getThumbnailUrl(game.thumbnail_path)!}
                        alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <GamePreviewPlaceholder title={game.title} category={game.category} />
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Play Button */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-xl">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </motion.div>

                    {/* Category Badge */}
                    <Badge className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm">
                      {getCategoryEmoji(game.category)} {game.category}
                    </Badge>

                    {/* Hot Badge for first 3 */}
                    {index < 3 && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        🔥 HOT
                      </Badge>
                    )}
                  </div>

                  {/* Game Title */}
                  <div className="p-3 bg-card">
                    <h3 className="font-bold text-sm md:text-base truncate">{game.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>4.8</span>
                      <Users className="w-3 h-3 ml-2" />
                      <span>{Math.floor(Math.random() * 500) + 100}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('games-gallery')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-6 text-lg font-bold border-2 hover:bg-primary/10"
            >
              View All Games →
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Game Play Modal */}
      <AnimatePresence>
        {selectedGame && (
          <Dialog open={!!selectedGame} onOpenChange={() => closeGame()}>
            <DialogContent 
              className={`${isFullscreen ? 'max-w-[100vw] h-[100vh] m-0 rounded-none' : 'max-w-5xl h-[80vh]'} p-0 overflow-hidden`}
            >
              <DialogTitle className="sr-only">{selectedGame.title}</DialogTitle>
              
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-bold text-lg">{selectedGame.title}</h3>
                  <Badge className="bg-green-500 text-white">PLAYING</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={closeGame}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Game Iframe */}
              {selectedGame.external_url && (
                <iframe
                  src={selectedGame.external_url}
                  className="w-full h-full border-0"
                  title={selectedGame.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
