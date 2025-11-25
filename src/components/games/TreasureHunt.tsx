import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const TreasureHunt = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const [treasurePos, setTreasurePos] = useState({ x: 5, y: 5 });
  const [guesses, setGuesses] = useState<{ x: number; y: number; distance: number }[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const maxAttempts = Math.max(5, Math.floor(10 / difficultyMultiplier));

  const calculateDistance = (x: number, y: number) => {
    return Math.sqrt(Math.pow(x - treasurePos.x, 2) + Math.pow(y - treasurePos.y, 2));
  };

  const handleGuess = (x: number, y: number) => {
    if (won) return;

    const distance = calculateDistance(x, y);
    setGuesses([...guesses, { x, y, distance }]);
    setAttempts(attempts + 1);

    if (x === treasurePos.x && y === treasurePos.y) {
      setWon(true);
      toast.success(`Tìm thấy kho báu! ${attempts + 1} lần thử!`);
    } else if (distance < 2) {
      toast('🔥 Rất gần!');
    } else if (distance < 4) {
      toast('🌡️ Ấm lên!');
    } else {
      toast('❄️ Lạnh quá!');
    }
  };

  const resetGame = () => {
    setTreasurePos({ 
      x: Math.floor(Math.random() * 10), 
      y: Math.floor(Math.random() * 10) 
    });
    setGuesses([]);
    setAttempts(0);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Số lần thử: {attempts}
        </h2>
        <p className="text-muted-foreground">Tìm kho báu ẩn giấu!</p>
      </div>

      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: 100 }).map((_, i) => {
          const x = i % 10;
          const y = Math.floor(i / 10);
          const guess = guesses.find(g => g.x === x && g.y === y);
          const isTreasure = won && x === treasurePos.x && y === treasurePos.y;

          return (
            <Card
              key={i}
              onClick={() => handleGuess(x, y)}
              className={`w-12 h-12 flex items-center justify-center cursor-pointer text-2xl ${
                isTreasure ? 'bg-yellow-500' : 
                guess ? 'bg-primary/20' : 'bg-background hover:bg-primary/10'
              }`}
            >
              {isTreasure ? '💎' : guess ? '🔍' : ''}
            </Card>
          );
        })}
      </div>

      <Button onClick={resetGame} size="lg">
        Chơi lại
      </Button>
    </div>
  );
};
