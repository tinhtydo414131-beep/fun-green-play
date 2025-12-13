import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface FeaturedGame {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  total_plays: number;
  genre: string;
}

export const FeaturedGamesCarousel = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVN = i18n.language === 'vi';
  
  const [games, setGames] = useState<FeaturedGame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGame, setSelectedGame] = useState<FeaturedGame | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedGames();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (games.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % games.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [games.length]);

  const fetchFeaturedGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, title, description, thumbnail_url, total_plays, genre')
        .eq('is_active', true)
        .order('total_plays', { ascending: false })
        .limit(8);

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + games.length) % games.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % games.length);
  };

  const handlePlayGame = (game: FeaturedGame) => {
    setSelectedGame(game);
    setShowIframe(true);
  };

  const handleNavigateToGame = (gameId: string) => {
    setShowIframe(false);
    navigate(`/game/${gameId}`);
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-pulse flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-48 h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) return null;

  return (
    <>
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              {isVN ? '🔥 Game nổi bật hôm nay' : '🔥 Today\'s Featured Games'}
            </h2>
            <p className="text-muted-foreground">
              {isVN ? 'Chơi ngay bằng 1 click!' : 'Play instantly with 1 click!'}
            </p>
          </motion.div>

          <div className="relative">
            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Games carousel */}
            <div className="overflow-hidden px-8">
              <motion.div
                className="flex gap-4"
                animate={{ x: -currentIndex * 208 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="flex-shrink-0 w-48 cursor-pointer group"
                    onClick={() => handlePlayGame(game)}
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
                      {game.thumbnail_url ? (
                        <img
                          src={game.thumbnail_url}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl">
                          🎮
                        </div>
                      )}
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                        </div>
                      </div>

                      {/* Genre badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded-full text-white text-[10px] font-medium">
                        {game.genre}
                      </div>
                    </div>
                    
                    <h3 className="mt-2 font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {game.total_plays.toLocaleString()} {isVN ? 'lượt chơi' : 'plays'}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {games.slice(0, Math.min(8, games.length)).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'w-6 bg-primary' 
                      : 'bg-muted hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Game iframe modal */}
      <Dialog open={showIframe} onOpenChange={setShowIframe}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                🎮 {selectedGame?.title}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedGame && handleNavigateToGame(selectedGame.id)}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {isVN ? 'Toàn màn hình' : 'Fullscreen'}
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 h-full bg-black">
            {selectedGame && (
              <iframe
                src={`/game/${selectedGame.id}?embed=true`}
                className="w-full h-full border-0"
                title={selectedGame.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeaturedGamesCarousel;
