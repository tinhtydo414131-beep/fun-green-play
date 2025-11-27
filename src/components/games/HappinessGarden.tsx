import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface HappinessGardenProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Flower {
  id: number;
  x: number;
  y: number;
  grown: boolean;
  emoji: string;
}

const flowerEmojis = ['🌸', '🌺', '🌻', '🌷', '🌹', '💐'];

const HappinessGarden = ({ level, onLevelComplete, onBack }: HappinessGardenProps) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [grownCount, setGrownCount] = useState(0);
  const targetFlowers = level * 3;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (grownCount >= targetFlowers) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [grownCount, targetFlowers, onLevelComplete]);

  const handleGardenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFlower: Flower = {
      id: nextId,
      x,
      y,
      grown: false,
      emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
    };

    setFlowers([...flowers, newFlower]);
    setNextId(nextId + 1);

    // Grow flower after a short delay
    setTimeout(() => {
      setFlowers(prev => 
        prev.map(f => f.id === newFlower.id ? { ...f, grown: true } : f)
      );
      setGrownCount(prev => prev + 1);
    }, 300);
  };

  const resetGame = () => {
    setFlowers([]);
    setGrownCount(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Happiness Garden 🌸</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Trồng {targetFlowers} bông hoa!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Đã trồng: {grownCount}/{targetFlowers} 🌻
          </div>
        </div>

        <div
          className="relative w-full h-96 bg-gradient-to-b from-sky-100 to-green-100 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleGardenClick}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
            🌈
          </div>
          {flowers.map((flower) => (
            <div
              key={flower.id}
              className={`absolute pointer-events-none transition-all duration-300 ${
                flower.grown ? 'text-5xl' : 'text-xl'
              }`}
              style={{
                left: `${flower.x - 20}px`,
                top: `${flower.y - 20}px`,
                opacity: flower.grown ? 1 : 0.3,
              }}
            >
              {flower.emoji}
            </div>
          ))}
          {flowers.some(f => f.grown) && (
            <div className="absolute top-2 right-2 text-4xl animate-bounce">
              🦋
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="font-fredoka font-bold px-8 py-6 text-lg"
            >
              <ArrowLeft className="mr-2" />
              Quay lại
            </Button>
          )}
          <Button
            onClick={resetGame}
            variant="outline"
            className="font-fredoka font-bold px-8 py-6 text-lg"
          >
            🔄 Làm mới
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HappinessGarden;
