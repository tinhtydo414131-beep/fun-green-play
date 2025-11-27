import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface StarCollectorProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  speed: number;
}

const StarCollector = ({ level, onLevelComplete, onBack }: StarCollectorProps) => {
  const [basketX, setBasketX] = useState(50);
  const [stars, setStars] = useState<Star[]>([]);
  const [collected, setCollected] = useState(0);
  const [nextId, setNextId] = useState(1);
  const targetStars = level * 5;

  useEffect(() => {
    if (collected >= targetStars) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [collected, targetStars, onLevelComplete]);

  useEffect(() => {
    // Generate stars periodically
    const interval = setInterval(() => {
      if (collected < targetStars) {
        const newStar: Star = {
          id: nextId,
          x: Math.random() * 90 + 5,
          y: 0,
          speed: Math.random() * 2 + 1 + level * 0.3,
        };
        setStars(prev => [...prev, newStar]);
        setNextId(prev => prev + 1);
      }
    }, 1500 - level * 100);

    return () => clearInterval(interval);
  }, [collected, targetStars, level, nextId]);

  useEffect(() => {
    // Move stars down
    const interval = setInterval(() => {
      setStars(prev => {
        const updated = prev.map(star => ({
          ...star,
          y: star.y + star.speed,
        })).filter(star => {
          // Check collision with basket
          if (star.y >= 85 && star.y <= 95 && Math.abs(star.x - basketX) < 8) {
            setCollected(c => c + 1);
            return false;
          }
          // Remove stars that went off screen
          return star.y < 100;
        });
        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [basketX]);

  const moveBasket = (direction: 'left' | 'right') => {
    setBasketX(prev => {
      const newX = direction === 'left' ? prev - 5 : prev + 5;
      return Math.max(5, Math.min(95, newX));
    });
  };

  const resetGame = () => {
    setStars([]);
    setCollected(0);
    setBasketX(50);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Star Collector ⭐</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Thu thập {targetStars} ngôi sao!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Đã thu thập: {collected}/{targetStars} ⭐
          </div>
        </div>

        <div className="relative w-full h-96 bg-gradient-to-b from-indigo-900 to-purple-900 rounded-xl border-4 border-primary/30 overflow-hidden">
          {/* Falling stars */}
          {stars.map(star => (
            <div
              key={star.id}
              className="absolute text-4xl pointer-events-none"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              ⭐
            </div>
          ))}

          {/* Basket */}
          <div
            className="absolute bottom-2 text-5xl transition-all duration-100"
            style={{
              left: `${basketX}%`,
              transform: 'translateX(-50%)',
            }}
          >
            🧺
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => moveBasket('left')}
            className="font-fredoka font-bold text-2xl px-8 py-6"
          >
            ⬅️ Trái
          </Button>
          {onBack ? (
            <Button
              onClick={onBack}
              variant="outline"
              className="font-fredoka font-bold px-8 py-6 text-sm"
            >
              <ArrowLeft className="mr-1" />
              Quay lại
            </Button>
          ) : (
            <Button
              onClick={resetGame}
              variant="outline"
              className="font-fredoka font-bold px-8 py-6 text-lg"
            >
              🔄 Làm mới
            </Button>
          )}
          <Button
            onClick={() => moveBasket('right')}
            className="font-fredoka font-bold text-2xl px-8 py-6"
          >
            Phải ➡️
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StarCollector;
