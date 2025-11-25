import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { GameCategory } from "@/components/GameCategory";
import gameCasual from "@/assets/game-casual.jpg";
import gameBrain from "@/assets/game-brain.jpg";
import gameAdventure from "@/assets/game-adventure.jpg";

const Index = () => {
  const categories = [
    {
      title: "Game Giải Trí",
      description: "Thư giãn với các trò chơi casual vui nhộn, phù hợp cho mọi lứa tuổi",
      image: gameCasual,
    },
    {
      title: "Game Trí Tuệ",
      description: "Thử thách trí não với các game puzzle, logic và chiến thuật",
      image: gameBrain,
    },
    {
      title: "Game Phiêu Lưu",
      description: "Khám phá thế giới mới với các game phiêu lưu hấp dẫn",
      image: gameAdventure,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Thể Loại Game
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chọn thể loại game yêu thích của bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <GameCategory 
                key={category.title}
                {...category}
                delay={index * 200}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
