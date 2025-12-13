import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { GameCard } from "@/components/GameCard";
import { UploadedGameCard } from "@/components/UploadedGameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonFacets } from "@/components/ui/button-facets";
import { supabase } from "@/integrations/supabase/client";
import { Search, Home, Upload, Sparkles, Star, Flame, X, Play, Users, Coins, Baby, Rocket, Sparkle, Heart, Globe, Palette, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import { useLegendStatus } from "@/hooks/useLegendStatus";
import LegendParticleEffect from "@/components/LegendParticleEffect";
import { AIGameSuggestions } from "@/components/AIGameSuggestions";

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
  created_at?: string;
}

interface LovableGame {
  id: string;
  title: string;
  description: string | null;
  project_url: string;
  image_url: string | null;
  user_id: string | null;
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface Game {
  id: string;
  title: string;
  description: string;
  genre: string;
  difficulty: string;
  thumbnail_url: string | null;
  component_name: string;
  total_likes: number;
  total_plays: number;
  how_to_play: string | null;
  updated_at: string | null;
}

// Age filter options
const ageFilters = [
  { id: 'all', label: 'Tất cả', emoji: '🌈', icon: Sparkles },
  { id: '4-7', label: '4-7 tuổi', emoji: '🍼', icon: Baby },
  { id: '8-12', label: '8-12 tuổi', emoji: '🚀', icon: Rocket },
  { id: '13+', label: '13+ tuổi', emoji: '✨', icon: Sparkle },
];

// Topic filter options
const topicFilters = [
  { id: 'creative', label: 'Sáng tạo', emoji: '🎨', icon: Palette, color: 'from-pink-500 to-rose-500' },
  { id: 'brain', label: 'Trí tuệ', emoji: '🧩', icon: Brain, color: 'from-purple-500 to-violet-500' },
  { id: 'adventure', label: 'Vũ trụ', emoji: '🚀', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
  { id: 'casual', label: 'Tình bạn', emoji: '🤗', icon: Heart, color: 'from-orange-500 to-amber-500' },
  { id: 'educational', label: 'Biết ơn', emoji: '💖', icon: Heart, color: 'from-red-500 to-pink-500' },
  { id: 'racing', label: 'Trái Đất', emoji: '🌍', icon: Globe, color: 'from-green-500 to-emerald-500' },
];

// Play bling sound
const playBlingSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1056, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log('Audio not supported');
  }
};

// Diamond confetti effect
const fireDiamondConfetti = () => {
  const colors = ['#00D4FF', '#FFD700', '#FF69B4', '#00FF88', '#9B59B6'];
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors,
    shapes: ['star'],
    scalar: 1.2,
  });
  playBlingSound();
};

const Games = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState<Game[]>([]);
  const [uploadedGames, setUploadedGames] = useState<UploadedGame[]>([]);
  const [lovableGames, setLovableGames] = useState<LovableGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [specialFilter, setSpecialFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const { isLegend } = useLegendStatus();
  
  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Fullscreen game
  const [fullscreenGame, setFullscreenGame] = useState<Game | UploadedGame | LovableGame | null>(null);
  
  // Realtime players count
  const [playersOnline, setPlayersOnline] = useState<Record<string, number>>({});
  
  useScrollAnimation();
  
  useEffect(() => {
    fetchGames();
    fetchUploadedGames();
    fetchLovableGames();
    
    // Simulate realtime player counts
    const interval = setInterval(() => {
      setPlayersOnline(prev => {
        const newCounts: Record<string, number> = {};
        games.forEach(game => {
          newCounts[game.id] = Math.floor(Math.random() * 50) + 1;
        });
        return newCounts;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterGames();
    setVisibleCount(12);
  }, [games, selectedAge, selectedTopics, specialFilter, searchQuery, favoriteGameIds]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredGames.length) {
          setVisibleCount(prev => Math.min(prev + 8, filteredGames.length));
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [visibleCount, filteredGames.length]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("total_likes", { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      console.error("Error fetching games:", error);
      toast.error("Couldn't load games 😢");
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedGames = async () => {
    try {
      const { data, error } = await supabase
        .from("uploaded_games")
        .select("*")
        .eq("status", "approved")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUploadedGames(data || []);
    } catch (error: any) {
      console.error("Error fetching uploaded games:", error);
    }
  };

  const fetchLovableGames = async () => {
    try {
      const { data, error } = await supabase
        .from("lovable_games")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const gamesWithProfiles = await Promise.all(
        (data || []).map(async (game) => {
          if (game.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", game.user_id)
              .maybeSingle();
            return { ...game, profiles: profile };
          }
          return { ...game, profiles: null };
        })
      );
      
      setLovableGames(gamesWithProfiles);
    } catch (error: any) {
      console.error("Error fetching lovable games:", error);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("game_ratings")
        .select("game_id")
        .eq("user_id", user.id)
        .eq("liked", true);

      if (error) throw error;
      
      const favoriteIds = new Set(data?.map(rating => rating.game_id) || []);
      setFavoriteGameIds(favoriteIds);
    } catch (error: any) {
      console.error("Error fetching favorites:", error);
    }
  };

  const filterGames = () => {
    let filtered = games;

    // Filter by topic
    if (selectedTopics.size > 0) {
      filtered = filtered.filter(game => selectedTopics.has(game.genre));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(query) ||
        (game.description && game.description.toLowerCase().includes(query)) ||
        game.genre.toLowerCase().includes(query)
      );
    }

    // Special filters
    if (specialFilter === 'new') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(game => 
        game.updated_at && new Date(game.updated_at) > oneWeekAgo
      );
    } else if (specialFilter === 'hot') {
      filtered = filtered.filter(game => (game.total_plays || 0) > 100);
    }

    // Sort by popularity
    const sorted = [...filtered].sort((a, b) => {
      return (b.total_plays || 0) - (a.total_plays || 0);
    });

    setFilteredGames(sorted);
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const handlePlayGame = (game: Game | UploadedGame | LovableGame) => {
    fireDiamondConfetti();
    
    // Built-in games with component_name navigate to GamePlay page
    if ('component_name' in game) {
      navigate(`/game/${game.id}`);
      return;
    }
    
    // Uploaded community games use the dedicated GameDetails page
    if ('category' in game) {
      navigate(`/game-details/${game.id}`);
      return;
    }

    // Lovable games (external project URLs) open in fullscreen overlay
    if ('project_url' in game) {
      setFullscreenGame(game);
      return;
    }
  };

  const getGameUrl = (game: Game | UploadedGame | LovableGame): string => {
    if ('component_name' in game) {
      return `/game/${game.id}`;
    } else if ('project_url' in game) {
      return game.project_url;
    }
    // Fallback (should not normally be used for uploaded games)
    return `/game-details/${game.id}`;
  };

  const totalGames = games.length + uploadedGames.length + lovableGames.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="text-8xl mb-6 inline-block"
          >
            💎
          </motion.div>
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Đang mở Kho Báu Ánh Sáng... ✨
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background pb-safe">
      <LegendParticleEffect isLegend={isLegend} />
      <Navigation />
      
      {/* Fullscreen Game Modal */}
      <AnimatePresence>
        {fullscreenGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <Button
              onClick={() => setFullscreenGame(null)}
              className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 rounded-full p-3"
            >
              <X className="w-6 h-6" />
            </Button>
            <iframe
              src={'project_url' in fullscreenGame ? fullscreenGame.project_url : getGameUrl(fullscreenGame)}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <section className="pt-20 md:pt-24 pb-20 px-4 pb-safe">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full border border-yellow-400/30 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="text-sm font-bold text-yellow-600">KHO BÁU ÁNH SÁNG</span>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Khám phá Kho Báu Game Ánh Sáng!
              </span>
              <span className="ml-2">🌟</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Hiện có <span className="font-bold text-primary text-2xl">{totalGames}</span> game hướng thượng chờ bé khám phá!
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="rounded-full px-6 font-bold border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Về Trang Chính
              </Button>
              
              <Button
                onClick={() => navigate('/sample-games')}
                variant="outline"
                className="rounded-full px-6 font-bold border-2 border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-yellow-600"
              >
                <Star className="w-4 h-4 mr-2" />
                5 Sample Games ⭐
              </Button>
              
              <Button
                onClick={() => navigate('/upload-game')}
                className="rounded-full px-6 font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
              >
                <Upload className="w-4 h-4 mr-2" />
                Tải Game Lên +500K 💎
              </Button>
            </div>
          </motion.div>

          {/* AI Game Suggestions */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-lg mx-auto mb-8"
            >
              <AIGameSuggestions />
            </motion.div>
          )}

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/40 transition-all">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="🔍 Tìm game yêu thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-0 bg-transparent focus-visible:ring-0"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="mr-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Age Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-center text-sm font-bold text-muted-foreground mb-3">🎂 ĐỘ TUỔI</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {ageFilters.map((filter) => {
                const Icon = filter.icon;
                const isDiamond = filter.id === 'all';
                return (
                  <motion.button
                    key={filter.id}
                    whileHover={{ scale: 1.05, rotate: isDiamond ? 3 : 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAge(filter.id)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-bold text-sm sm:text-base transition-all ${
                      isDiamond 
                        ? 'rounded-xl rotate-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white shadow-lg shadow-cyan-500/40 border-2 border-white/30'
                        : selectedAge === filter.id
                          ? 'rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                          : 'rounded-full bg-card border-2 border-primary/20 hover:border-primary/50 text-foreground'
                    }`}
                    style={isDiamond ? {
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      padding: '1.5rem 2rem',
                    } : undefined}
                  >
                    {isDiamond ? (
                      <span className="text-xl">💎</span>
                    ) : (
                      <>
                        <span className="text-lg">{filter.emoji}</span>
                        <span className="hidden sm:inline">{filter.label}</span>
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Topic Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <p className="text-center text-sm font-bold text-muted-foreground mb-3">📚 CHỦ ĐỀ</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {topicFilters.map((filter) => {
                const Icon = filter.icon;
                const isSelected = selectedTopics.has(filter.id);
                return (
                  <motion.button
                    key={filter.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTopic(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all ${
                      isSelected
                        ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                        : 'bg-card border-2 border-primary/20 hover:border-primary/50 text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{filter.emoji}</span>
                    <span className="hidden sm:inline">{filter.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Special Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-3 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSpecialFilter(specialFilter === 'new' ? null : 'new')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base transition-all ${
                specialFilter === 'new'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-blue-500/10 border-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/20'
              }`}
            >
              <Flame className="w-5 h-5" />
              Game mới 🔥
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSpecialFilter(specialFilter === 'hot' ? null : 'hot')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base transition-all ${
                specialFilter === 'hot'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-orange-500/10 border-2 border-orange-500/30 text-orange-600 hover:bg-orange-500/20'
              }`}
            >
              <Star className="w-5 h-5" />
              Game hot ⭐
            </motion.button>
          </motion.div>

          {/* Games Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {/* Community Games First */}
            {lovableGames.slice(0, Math.ceil(visibleCount / 3)).map((game, index) => (
              <LightTreasureCard
                key={`lovable-${game.id}`}
                game={game}
                type="lovable"
                index={index}
                playersOnline={Math.floor(Math.random() * 30) + 1}
                onPlay={() => handlePlayGame(game)}
              />
            ))}
            
            {uploadedGames.slice(0, Math.ceil(visibleCount / 3)).map((game, index) => (
              <LightTreasureCard
                key={`uploaded-${game.id}`}
                game={game}
                type="uploaded"
                index={index + lovableGames.length}
                playersOnline={Math.floor(Math.random() * 30) + 1}
                onPlay={() => handlePlayGame(game)}
              />
            ))}
            
            {/* Official Games */}
            {filteredGames.slice(0, visibleCount).map((game, index) => (
              <LightTreasureCard
                key={game.id}
                game={game}
                type="official"
                index={index + lovableGames.length + uploadedGames.length}
                playersOnline={playersOnline[game.id] || Math.floor(Math.random() * 50) + 1}
                onPlay={() => handlePlayGame(game)}
              />
            ))}
          </motion.div>
          
          {/* Load More Trigger */}
          {visibleCount < filteredGames.length && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                💎
              </motion.div>
            </div>
          )}
          
          {/* Empty State */}
          {filteredGames.length === 0 && uploadedGames.length === 0 && lovableGames.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-muted-foreground mb-2">
                Chưa tìm thấy game nào
              </h3>
              <p className="text-muted-foreground mb-6">
                Thử tìm kiếm với từ khóa khác nhé!
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTopics(new Set());
                  setSpecialFilter(null);
                }}
                className="rounded-full"
              >
                Xem tất cả game
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

// Light Treasure Card Component
interface LightTreasureCardProps {
  game: Game | UploadedGame | LovableGame;
  type: 'official' | 'uploaded' | 'lovable';
  index: number;
  playersOnline: number;
  onPlay: () => void;
}

const LightTreasureCard = ({ game, type, index, playersOnline, onPlay }: LightTreasureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getThumbnail = () => {
    if ('thumbnail_url' in game && game.thumbnail_url) return game.thumbnail_url;
    if ('image_url' in game && game.image_url) return game.image_url;
    if ('thumbnail_path' in game && game.thumbnail_path) {
      return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/game-thumbnails/${game.thumbnail_path}`;
    }
    return null;
  };
  
  const getBadge = () => {
    if (type === 'lovable') return { text: 'Cộng đồng', color: 'from-purple-500 to-pink-500' };
    if (type === 'uploaded') return { text: 'Mới tải', color: 'from-green-500 to-emerald-500' };
    if ('total_plays' in game && (game.total_plays || 0) > 100) {
      return { text: 'Hot 🔥', color: 'from-orange-500 to-red-500' };
    }
    return { text: 'Hướng thượng 100%', color: 'from-blue-500 to-cyan-500' };
  };
  
  const getGamePath = () => {
    if ('component_name' in game) return `/game/${game.id}`;
    if ('project_url' in game) return `/lovable-game/${game.id}`;
    // Uploaded HTML games go to the details/play page
    return `/game-details/${game.id}`;
  };

  const badge = getBadge();
  const thumbnail = getThumbnail();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Link to={getGamePath()} className="block">
        <motion.div
          animate={{
            y: isHovered ? -8 : 0,
            rotateY: isHovered ? 5 : 0,
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-primary/10 hover:border-primary/30"
        >
          {/* Diamond sparkle effect on hover */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none z-10"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: [0, Math.random() * 40 - 20],
                    y: [0, Math.random() * 40 - 20],
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                  className="absolute text-2xl"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                >
                  💎
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/20 relative overflow-hidden">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={game.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🎮</span>
              </div>
            )}
            
            {/* Badge */}
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs font-bold shadow-lg`}>
              {badge.text}
            </div>
            
            {/* Genre/Category badge */}
            {'genre' in game && game.genre && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold">
                {game.genre}
              </div>
            )}
            {'category' in game && (game as UploadedGame).category && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold">
                {(game as UploadedGame).category}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
              {game.title}
            </h3>
            
            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-green-500">
                <Users className="w-4 h-4" />
                <span className="font-bold">{playersOnline} bé đang chơi</span>
              </div>
              
              <div className="flex items-center gap-1 text-yellow-500">
                <Coins className="w-4 h-4" />
                <span className="font-bold">+10K</span>
                <span className="text-lg">💎</span>
              </div>
            </div>
            
            {/* Play Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                onPlay();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
            >
              <ButtonFacets />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ transform: 'skewX(-20deg)' }}
              />
              <Play className="w-5 h-5 fill-current relative z-10" />
              <span className="relative z-10">Chơi ngay!</span>
              <span className="text-lg relative z-10">💎</span>
            </motion.button>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default Games;
