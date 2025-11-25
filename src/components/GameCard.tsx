import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { Game } from "@/data/games";
import { Link } from "react-router-dom";

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-300 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <Card className="group overflow-hidden border-2 border-border hover:border-primary transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-16 h-16 text-primary/40" />
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={`${difficultyColors[game.difficulty]} border`}>
            {game.difficulty === 'easy' ? 'Dễ' : game.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {game.description}
        </p>
        <Link to={`/game/${game.id}`}>
          <Button className="w-full group/btn">
            Chơi ngay
            <Play className="ml-2 w-4 h-4 transition-transform group-hover/btn:scale-110" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
