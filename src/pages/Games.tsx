import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Home } from "lucide-react";
import { toast } from "sonner";

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
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  const categories = [
    { id: 'all', label: 'Tất Cả 🎮', emoji: '🎮' },
    { id: 'casual', label: 'Giải Trí', emoji: '🎯' },
    { id: 'brain', label: 'Trí Não', emoji: '🧠' },
    { id: 'adventure', label: 'Phiêu Lưu', emoji: '🗺️' },
    { id: 'educational', label: 'Học Tập', emoji: '📚' },
    { id: 'racing', label: 'Đua Xe', emoji: '🏎️' },
  ];

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, selectedCategory, searchQuery]);

  const fetchGames = async () => {
    try {
      // Hardcoded games for prototype with Vietnamese content
      const mockGames: Game[] = [
        {
          id: 'balloon-pop',
          title: 'Bóng Bay Vui Vẻ 🎈',
          description: 'Nổ bóng bay màu sắc và giành điểm cao! Trò chơi vui nhộn cho bé yêu!',
          genre: 'casual',
          difficulty: 'easy',
          thumbnail_url: '/images/games/balloon-pop.jpg',
          component_name: 'BalloonPop',
          total_likes: 0,
          total_plays: 0,
          how_to_play: 'Nhấn vào bóng bay để nổ và giành điểm! Càng nhanh càng tốt!'
        },
        {
          id: 'flower-field',
          title: 'Vườn Hoa Thần Tiên 🌸',
          description: 'Trồng hoa xinh đẹp và tạo khu vườn kỳ diệu của riêng bé!',
          genre: 'casual',
          difficulty: 'easy',
          thumbnail_url: '/images/games/flower-field.jpg',
          component_name: 'FlowerField',
          total_likes: 0,
          total_plays: 0,
          how_to_play: 'Nhấn vào ô để trồng hoa và tạo vườn đẹp!'
        },
        {
          id: 'color-match',
          title: 'Ghép Màu Thần Kỳ 🎨',
          description: 'Tìm và ghép các màu sắc giống nhau! Trò chơi trí nhớ tuyệt vời!',
          genre: 'brain',
          difficulty: 'medium',
          thumbnail_url: '/images/games/color-match.jpg',
          component_name: 'ColorMatch',
          total_likes: 0,
          total_plays: 0,
          how_to_play: 'Nhấn vào thẻ để lật và tìm các màu giống nhau!'
        },
        {
          id: 'memory-cards',
          title: 'Trí Nhớ Siêu Đẳng 🧠',
          description: 'Lật thẻ và tìm các cặp giống nhau! Rèn luyện trí nhớ cực kỳ hay!',
          genre: 'brain',
          difficulty: 'medium',
          thumbnail_url: '/images/games/memory-cards.jpg',
          component_name: 'MemoryCards',
          total_likes: 0,
          total_plays: 0,
          how_to_play: 'Nhấn vào thẻ để lật và nhớ vị trí các cặp!'
        }
      ];
      
      setGames(mockGames);
    } catch (error: any) {
      console.error("Error loading games:", error);
      toast.error("Không thể tải trò chơi 😢");
    } finally {
      setLoading(false);
    }
  };

  const filterGames = () => {
    let filtered = games;

    // Filter by category
    if (selectedCategory !== 'all') {
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

    setFilteredGames(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterGames();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <div className="animate-bounce text-6xl mb-4">🎮</div>
          <p className="text-2xl font-fredoka text-primary">Loading awesome games... ⏳</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <Navigation />
      
      <section className="pt-20 sm:pt-32 pb-12 sm:pb-20 px-4">
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

          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4 animate-fade-in">
            <h1 className="game-title">
              Thư Viện Trò Chơi 🎮
            </h1>
            <p className="description-text">
              {games.length} trò chơi tuyệt vời đang chờ bé! 🌟
            </p>
          </div>

          {/* Search Bar - Mobile Optimized */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Tìm trò chơi... 🔍"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 sm:pl-14 pr-20 sm:pr-4 py-4 sm:py-6 text-base sm:text-lg border-4 border-primary/30 focus:border-primary rounded-2xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all glass-card"
              />
              <Button 
                type="submit"
                className="diamond-btn absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-3 sm:py-5 text-sm sm:text-base rounded-xl sm:rounded-2xl"
              >
                Tìm
              </Button>
            </div>
          </form>
          
          {/* Category Filters - Mobile Optimized */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={`font-fredoka font-bold text-sm sm:text-lg px-4 sm:px-8 py-3 sm:py-6 border-3 sm:border-4 transform hover:scale-105 sm:hover:scale-110 transition-all rounded-[20px] sm:rounded-2xl ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary to-secondary shadow-lg'
                    : 'border-primary/30 hover:border-primary hover:bg-primary/10'
                }`}
              >
                <span className="mr-1 sm:mr-2">{category.emoji}</span>
                <span className="hidden xs:inline">{category.label}</span>
              </Button>
            ))}
          </div>

          {/* Games Grid - Mobile Optimized */}
          {filteredGames.length === 0 ? (
            <div className="text-center py-12 sm:py-20 px-4">
              <div className="text-5xl sm:text-6xl mb-4">😢</div>
              <p className="game-title">Không tìm thấy trò chơi nào!</p>
              <p className="description-text">Thử tìm kiếm hoặc danh mục khác nhé!</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="diamond-btn mt-4 sm:mt-6 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-[30px]"
              >
                Xem Tất Cả
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <p className="description-text">
                  Hiển thị <span className="level-number text-primary">{filteredGames.length}</span> trò chơi
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
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
