import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FlowerFieldProps {
  level: number;
  onLevelComplete: () => void;
}

interface Flower {
  id: number;
  x: number;
  y: number;
  bloomed: boolean;
  emoji: string;
}

const flowerTypes = ['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🏵️', '🌼'];

const FlowerField = ({ level, onLevelComplete }: FlowerFieldProps) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [bloomedCount, setBloomedCount] = useState(0);
  const targetFlowers = level * 4;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (bloomedCount >= targetFlowers) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [bloomedCount, targetFlowers, onLevelComplete]);

  const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFlower: Flower = {
      id: nextId,
      x,
      y,
      bloomed: false,
      emoji: flowerTypes[Math.floor(Math.random() * flowerTypes.length)],
    };

    setFlowers([...flowers, newFlower]);
    setNextId(nextId + 1);

    // Bloom flower after a short delay
    setTimeout(() => {
      setFlowers(prev => 
        prev.map(f => f.id === newFlower.id ? { ...f, bloomed: true } : f)
      );
      setBloomedCount(prev => prev + 1);
    }, 200);
  };

  const resetGame = () => {
    setFlowers([]);
    setBloomedCount(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Flower Field 🌸</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Nở {targetFlowers} bông hoa!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Đã nở: {bloomedCount}/{targetFlowers} 🌺
          </div>
        </div>

        <div
          className="relative w-full h-96 bg-gradient-to-b from-yellow-100 to-green-200 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleFieldClick}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
            ☀️
          </div>
          {flowers.map((flower) => (
            <div
              key={flower.id}
              className={`absolute pointer-events-none transition-all duration-500 ${
                flower.bloomed ? 'text-5xl' : 'text-2xl'
              }`}
              style={{
                left: `${flower.x - 25}px`,
                top: `${flower.y - 25}px`,
                opacity: flower.bloomed ? 1 : 0.3,
                transform: flower.bloomed ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-45deg)',
              }}
            >
              {flower.emoji}
            </div>
          ))}
          {flowers.some(f => f.bloomed) && (
            <>
              <div className="absolute top-4 left-4 text-3xl animate-bounce">🦋</div>
              <div className="absolute top-4 right-4 text-3xl animate-bounce delay-100">🐝</div>
            </>
          )}
        </div>

        <div className="flex justify-center gap-4">
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

export default FlowerField;
