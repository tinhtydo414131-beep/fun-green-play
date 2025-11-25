import { Navigation } from "@/components/Navigation";
import { GameCard } from "@/components/GameCard";
import { games } from "@/data/games";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Games = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'casual', label: 'Giải trí' },
    { id: 'brain', label: 'Trí tuệ' },
    { id: 'adventure', label: 'Phiêu lưu' },
  ];
  
  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Kho Game
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hơn {games.length} game thú vị đang chờ bạn khám phá
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="px-6"
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Games;
