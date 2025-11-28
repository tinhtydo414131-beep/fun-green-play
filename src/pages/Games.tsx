import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Home, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { toast } from "sonner";
import { JoyBot } from "@/components/JoyBot";

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
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>('popular');
  
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

    // Sort games
    const sorted = [...filtered].sort((a, b) => {
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
      <Navigation />
      
      <section className="pt-20 md:pt-24 pb-12 md:pb-20 px-4 pb-safe">
        <div className="container mx-auto">
          {/* Back to Home Button */}
          <div className="mb-6 sm:mb-8">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              size="lg"
              className="font-bold group min-w-[48px] rounded-[20px] sm:rounded-2xl"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-0 sm:mr-2 text-primary group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline sm:inline">Về Trang Chính</span>
            </Button>
          </div>

          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4 animate-slide-up">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-fredoka font-bold text-primary">
              Game Library 🎮
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground font-comic max-w-2xl mx-auto">
              {games.length} amazing games waiting for you! 🌟
            </p>
          </div>

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

          {/* Featured Game Section */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="mb-12 animate-slide-up">
              <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-fredoka font-bold text-primary mb-2">
                  🌟 Featured Game 🌟
                </h2>
                <p className="text-base sm:text-lg font-comic text-muted-foreground">
                  New and exciting!
                </p>
              </div>
              
              {(() => {
                const featuredGame = games.find(g => g.component_name === 'GoldMiner');
                if (!featuredGame) return null;
                
                return (
                  <div className="max-w-4xl mx-auto">
                    <div className="relative group">
                      {/* Glowing background effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                      
                      {/* Card content */}
                      <div className="relative bg-white rounded-3xl border-4 border-primary shadow-2xl overflow-hidden">
                        {/* NEW Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-fredoka font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-bounce">
                            ✨ NEW ✨
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 p-6">
                          {/* Image */}
                          <div className="relative aspect-video md:aspect-square rounded-2xl overflow-hidden border-4 border-primary/20 group-hover:border-primary/50 transition-all">
                            <img 
                              src={featuredGame.thumbnail_url || '/images/games/gold-miner.jpg'} 
                              alt={featuredGame.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          
                          {/* Content */}
                          <div className="flex flex-col justify-center space-y-4">
                            <div>
                              <h3 className="text-3xl sm:text-4xl font-fredoka font-bold text-primary mb-2">
                                {featuredGame.title}
                              </h3>
                              <p className="text-base sm:text-lg font-comic text-muted-foreground">
                                {featuredGame.description || 'Đào vàng, kim cương và kho báu quý giá! Mỗi lần đào có thể tìm thấy điều bất ngờ!'}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 rounded-full text-sm font-fredoka font-bold bg-primary/10 text-primary border-2 border-primary/20">
                                🎮 {featuredGame.genre}
                              </span>
                              <span className="px-3 py-1 rounded-full text-sm font-fredoka font-bold bg-secondary/10 text-secondary border-2 border-secondary/20">
                                ⭐ {featuredGame.difficulty}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm font-comic text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span>🎯</span>
                                {featuredGame.total_plays || 0} plays
                              </span>
                              <span className="flex items-center gap-1">
                                <span>❤️</span>
                                {featuredGame.total_likes || 0} likes
                              </span>
                            </div>
                            
                            <Button
                              onClick={() => window.location.href = `/play/${featuredGame.id}`}
                              className="w-full font-fredoka font-bold text-lg py-6 bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all rounded-2xl group"
                            >
                              <span className="mr-2">Play Now!</span>
                              <span className="text-2xl group-hover:animate-bounce inline-block">⛏️</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* All Games Section */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-fredoka font-bold text-primary mb-2">
                🎮 All Games 🎮
              </h2>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredGames.map((game, index) => (
                  <div 
                    key={game.id} 
                    className="fade-in-on-scroll"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <JoyBot />
    </div>
  );
};

export default Games;
