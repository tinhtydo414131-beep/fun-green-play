import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface SpaceExplorerProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

const SpaceExplorer = ({ level, onLevelComplete, onBack }: SpaceExplorerProps) => {
  const [rocketX, setRocketX] = useState(50);
  const [rocketY, setRocketY] = useState(50);
  const [stars, setStars] = useState<Star[]>([]);
  const [collected, setCollected] = useState(0);
  const targetStars = level * 3;

  useEffect(() => {
    // Generate stars
    const newStars: Star[] = [];
    for (let i = 0; i < targetStars; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        collected: false,
      });
    }
    setStars(newStars);
  }, [level, targetStars]);

  useEffect(() => {
    if (collected >= targetStars && targetStars > 0) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [collected, targetStars, onLevelComplete]);

  useEffect(() => {
    // Check collision with stars
    stars.forEach(star => {
      if (!star.collected) {
        const distance = Math.sqrt(
          Math.pow(rocketX - star.x, 2) + Math.pow(rocketY - star.y, 2)
        );
        if (distance < 5) {
          setStars(prev => 
            prev.map(s => s.id === star.id ? { ...s, collected: true } : s)
          );
          setCollected(prev => prev + 1);
        }
      }
    });
  }, [rocketX, rocketY, stars]);

  const moveRocket = (dx: number, dy: number) => {
    setRocketX(prev => Math.max(5, Math.min(95, prev + dx)));
    setRocketY(prev => Math.max(5, Math.min(95, prev + dy)));
  };

  const resetGame = () => {
    setRocketX(50);
    setRocketY(50);
    setCollected(0);
    const newStars: Star[] = [];
    for (let i = 0; i < targetStars; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        collected: false,
      });
    }
    setStars(newStars);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Space Explorer 🚀</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Thu thập {targetStars} ngôi sao!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Đã thu thập: {collected}/{targetStars} ⭐
          </div>
        </div>

        <div className="relative w-full h-96 bg-gradient-to-b from-indigo-900 to-purple-900 rounded-xl border-4 border-primary/30 overflow-hidden">
          {/* Stars */}
          {stars.map(star => !star.collected && (
            <div
              key={star.id}
              className="absolute text-4xl animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              ⭐
            </div>
          ))}

          {/* Rocket */}
          <div
            className="absolute text-5xl transition-all duration-200"
            style={{
              left: `${rocketX}%`,
              top: `${rocketY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            🚀
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <Button
            onClick={() => moveRocket(0, -5)}
            className="font-fredoka font-bold text-2xl"
          >
            ⬆️
          </Button>
          <div></div>
          <Button
            onClick={() => moveRocket(-5, 0)}
            className="font-fredoka font-bold text-2xl"
          >
            ⬅️
          </Button>
          {onBack ? (
            <Button
              onClick={onBack}
              variant="outline"
              className="font-fredoka font-bold text-sm"
            >
              <ArrowLeft className="mr-1" />
              Quay lại
            </Button>
          ) : (
            <Button
              onClick={resetGame}
              variant="outline"
              className="font-fredoka font-bold text-lg"
            >
              🔄
            </Button>
          )}
          <Button
            onClick={() => moveRocket(5, 0)}
            className="font-fredoka font-bold text-2xl"
          >
            ➡️
          </Button>
          <div></div>
          <Button
            onClick={() => moveRocket(0, 5)}
            className="font-fredoka font-bold text-2xl"
          >
            ⬇️
          </Button>
          <div></div>
        </div>
      </Card>
    </div>
  );
};

export default SpaceExplorer;
