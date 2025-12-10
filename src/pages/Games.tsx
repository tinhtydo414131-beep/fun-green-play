import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { GameCard } from "@/components/GameCard";
import { UploadedGameCard } from "@/components/UploadedGameCard";
import { Button } from "@/components/ui/button";
import { DiamondButton } from "@/components/ui/diamond-button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Home, ArrowUpDown, Users, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { toast } from "sonner";

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
}

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>('popular');
  const { isLegend } = useLegendStatus();
  
  useScrollAnimation();
  
  const categories = [
    { id: 'all', label: 'All Games 🎮', emoji: '🎮' },
    { id: 'favorites', label: 'My Favorites', emoji: '❤️', requiresAuth: true },
    { id: 'casual', label: 'Casual', emoji: '🎯' },
    { id: 'brain', label: 'Brain', emoji: '🧠' },
    { id: 'adventure', label: 'Adventure', emoji: '🗺️' },
    { id: 'educational', label: 'Educational', emoji: '📚' },
    { id: 'racing', label: 'Racing', emoji: '🏎️' },
  ];

  useEffect(() => {
    fetchGames();
    fetchUploadedGames();
    fetchLovableGames();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterGames();
  }, [games, selectedCategory, searchQuery, sortBy, favoriteGameIds]);

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
      
      // Fetch creator profiles for games with user_id
      const gamesWithProfiles = await Promise.all(
        (data || []).map(async (game) => {
          if (game.user_id) {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", game.user_id)
              .maybeSingle();
            
            if (profileError) {
              console.error("Error fetching profile:", profileError);
              return { ...game, profiles: null };
            }
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

    // Filter by category
    if (selectedCategory === 'favorites') {
      // Show only favorite games
      filtered = filtered.filter(game => favoriteGameIds.has(game.id));
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.genre === selectedCategory);
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

    // Sort games - Always put 2048 Nexus at the top
    const sorted = [...filtered].sort((a, b) => {
      // 2048 Nexus always comes first
      const aIs2048 = a.title.toLowerCase().includes('2048');
      const bIs2048 = b.title.toLowerCase().includes('2048');
      if (aIs2048 && !bIs2048) return -1;
      if (!aIs2048 && bIs2048) return 1;
      
      switch (sortBy) {
        case 'popular':
          return (b.total_plays || 0) - (a.total_plays || 0);
        case 'liked':
          return (b.total_likes || 0) - (a.total_likes || 0);
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    setFilteredGames(sorted);
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    
    if (category?.requiresAuth && !user) {
      toast.error("Please log in to view your favorites! 😊");
      return;
    }
    
    setSelectedCategory(categoryId);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterGames();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <div className="animate-bounce text-6xl mb-4">🎮</div>
          <p className="text-2xl font-fredoka text-primary">Loading awesome games... ⏳</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* Legend Particle Effect */}
      <LegendParticleEffect isLegend={isLegend} />
      
      <Navigation />
      
      <section className="pt-20 md:pt-24 pb-20 px-4 pb-safe">
        <div className="container mx-auto">
          {/* Action Buttons */}
          <div className="mb-6 sm:mb-8 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="font-bold group min-w-[48px] rounded-[20px] sm:rounded-2xl"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-0 sm:mr-2 text-primary group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline sm:inline">Về Trang Chính</span>
            </Button>
            
            <DiamondButton
              onClick={() => navigate('/upload-game')}
              size="lg"
              className="min-w-[48px]"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-0 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Tải Game Lên</span>
            </DiamondButton>
          </div>

          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4 animate-slide-up">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-fredoka font-bold text-primary">
              Game Library 🎮
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground font-comic max-w-2xl mx-auto">
              {games.length} amazing games waiting for you! 🌟
            </p>
          </div>

          {/* AI Game Suggestions */}
          {user && (
            <div className="max-w-lg mx-auto mb-8 sm:mb-12 animate-slide-up">
              <AIGameSuggestions />
            </div>
          )}

          {/* Search Bar - Mobile Optimized */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 sm:mb-12 animate-slide-up stagger-1">
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search for games... 🔍"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 sm:pl-14 pr-20 sm:pr-4 py-4 sm:py-6 text-base sm:text-lg font-comic border-4 border-primary/50 focus:border-primary rounded-2xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all focus:ring-4 focus:ring-primary/20"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 font-fredoka font-bold px-4 sm:px-6 py-3 sm:py-5 text-sm sm:text-base bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:scale-105 transition-all rounded-xl sm:rounded-2xl"
              >
                Search
              </Button>
            </div>
          </form>
          
          {/* Category Filters - Mobile Optimized */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 animate-slide-up stagger-2">
            {categories.map((category) => {
              const isFavorites = category.id === 'favorites';
              const isDisabled = isFavorites && !user;
              
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => handleCategoryChange(category.id)}
                  disabled={isDisabled}
                  className={`font-fredoka font-bold text-sm sm:text-lg px-4 sm:px-8 py-3 sm:py-6 border-3 sm:border-4 transform hover:scale-105 sm:hover:scale-110 transition-all rounded-[20px] sm:rounded-2xl ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary to-secondary shadow-lg'
                      : isDisabled
                      ? 'border-muted-foreground/20 opacity-50 cursor-not-allowed'
                      : 'border-primary/30 hover:border-primary hover:bg-primary/10'
                  }`}
                >
                  <span className="mr-1 sm:mr-2">{category.emoji}</span>
                  <span className="hidden xs:inline">{category.label}</span>
                  {isFavorites && favoriteGameIds.size > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {favoriteGameIds.size}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 sm:mb-12 animate-slide-up stagger-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              <span className="font-fredoka font-bold text-primary text-sm sm:text-base">Sắp xếp:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] sm:w-[250px] font-comic border-2 border-primary/30 focus:border-primary rounded-xl">
                <SelectValue placeholder="Chọn cách sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular" className="font-comic">🔥 Phổ biến nhất</SelectItem>
                <SelectItem value="liked" className="font-comic">❤️ Được yêu thích nhất</SelectItem>
                <SelectItem value="az" className="font-comic">🔤 Tên A-Z</SelectItem>
                <SelectItem value="za" className="font-comic">🔤 Tên Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* All Games Section */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-fredoka font-bold text-primary mb-2">
                🎮 All Games 🎮
              </h2>
            </div>
          )}

          {/* Community Uploaded Games Section */}
          {(uploadedGames.length > 0 || lovableGames.length > 0) && selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="mb-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-fredoka font-bold text-primary mb-2">
                  🌟 Community Games 🌟
                </h2>
                <p className="text-muted-foreground font-comic">Games uploaded by our amazing community!</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {/* Lovable Games */}
                {lovableGames.map((game, index) => (
                  <div 
                    key={`lovable-${game.id}`} 
                    className="fade-in-on-scroll game-card"
                    style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
                  >
                    <Link 
                      to={`/lovable-game/${game.id}`}
                      className="block group"
                    >
                      <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] border-2 border-primary/20 group-hover:border-primary/50">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                          {game.image_url ? (
                            <img 
                              src={game.image_url} 
                              alt={game.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-5xl">🎮</span>
                          )}
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-fredoka font-bold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                            {game.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                            {game.description || 'A fun game from Lovable!'}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-1">
                            <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                              ❤️ Lovable
                            </span>
                            {game.profiles?.username && (
                              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                by {game.profiles.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
                {/* Uploaded Games */}
                {uploadedGames.map((game, index) => (
                  <div 
                    key={game.id} 
                    className="fade-in-on-scroll game-card"
                    style={{ animationDelay: `${Math.min((lovableGames.length + index) * 0.03, 0.3)}s` }}
                  >
                    <UploadedGameCard game={game} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Games Grid - Mobile Optimized */}
          {filteredGames.length === 0 ? (
            <div className="text-center py-12 sm:py-20 px-4">
              <div className="text-5xl sm:text-6xl mb-4">
                {selectedCategory === 'favorites' ? '❤️' : '😢'}
              </div>
              <p className="text-xl sm:text-2xl font-fredoka text-muted-foreground mb-2">
                {selectedCategory === 'favorites' ? 'No favorite games yet!' : 'No games found!'}
              </p>
              <p className="text-base sm:text-lg font-comic text-muted-foreground">
                {selectedCategory === 'favorites' 
                  ? 'Start adding games to your favorites by clicking the ❤️ button!' 
                  : 'Try a different search or category'}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 sm:mt-6 font-fredoka font-bold px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg bg-gradient-to-r from-primary to-secondary rounded-[30px]"
              >
                Show All Games
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-base sm:text-lg font-comic text-muted-foreground">
                  Showing <span className="font-fredoka font-bold text-primary text-lg sm:text-xl">{filteredGames.length}</span> game{filteredGames.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filteredGames.map((game, index) => (
                  <div 
                    key={game.id} 
                    className="fade-in-on-scroll game-card"
                    style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
                  >
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      
    </div>
  );
};

export default Games;
