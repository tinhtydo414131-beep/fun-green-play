import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface OceanExplorerProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Fish {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  emoji: string;
}

const fishEmojis = ['🐠', '🐟', '🐡', '🦈', '🐙', '🦑', '🐳'];

const OceanExplorer = ({ level, onLevelComplete, onBack }: OceanExplorerProps) => {
  const [submarineX, setSubmarineX] = useState(50);
  const [submarineY, setSubmarineY] = useState(50);
  const [fish, setFish] = useState<Fish[]>([]);
  const [collected, setCollected] = useState(0);
  const targetFish = level * 3;

  useEffect(() => {
    // Generate fish
    const newFish: Fish[] = [];
    for (let i = 0; i < targetFish; i++) {
      newFish.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        collected: false,
        emoji: fishEmojis[Math.floor(Math.random() * fishEmojis.length)],
      });
    }
    setFish(newFish);
  }, [level, targetFish]);

  useEffect(() => {
    if (collected >= targetFish && targetFish > 0) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [collected, targetFish, onLevelComplete]);

  useEffect(() => {
    // Check collision with fish
    fish.forEach(f => {
      if (!f.collected) {
        const distance = Math.sqrt(
          Math.pow(submarineX - f.x, 2) + Math.pow(submarineY - f.y, 2)
        );
        if (distance < 5) {
          setFish(prev => 
            prev.map(item => item.id === f.id ? { ...item, collected: true } : item)
          );
          setCollected(prev => prev + 1);
        }
      }
    });
  }, [submarineX, submarineY, fish]);

  const moveSubmarine = (dx: number, dy: number) => {
    setSubmarineX(prev => Math.max(5, Math.min(95, prev + dx)));
    setSubmarineY(prev => Math.max(5, Math.min(95, prev + dy)));
  };

  const resetGame = () => {
    setSubmarineX(50);
    setSubmarineY(50);
    setCollected(0);
    const newFish: Fish[] = [];
    for (let i = 0; i < targetFish; i++) {
      newFish.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        collected: false,
        emoji: fishEmojis[Math.floor(Math.random() * fishEmojis.length)],
      });
    }
    setFish(newFish);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Ocean Explorer 🌊</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Thu thập {targetFish} sinh vật biển!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Đã thu thập: {collected}/{targetFish} 🐠
          </div>
        </div>

        <div className="relative w-full h-96 bg-gradient-to-b from-blue-300 to-blue-600 rounded-xl border-4 border-primary/30 overflow-hidden">
          {/* Fish */}
          {fish.map(f => !f.collected && (
            <div
              key={f.id}
              className="absolute text-4xl animate-pulse"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {f.emoji}
            </div>
          ))}

          {/* Submarine */}
          <div
            className="absolute text-5xl transition-all duration-200"
            style={{
              left: `${submarineX}%`,
              top: `${submarineY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            🚢
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <Button
            onClick={() => moveSubmarine(0, -5)}
            className="font-fredoka font-bold text-2xl"
          >
            ⬆️
          </Button>
          <div></div>
          <Button
            onClick={() => moveSubmarine(-5, 0)}
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
            onClick={() => moveSubmarine(5, 0)}
            className="font-fredoka font-bold text-2xl"
          >
            ➡️
          </Button>
          <div></div>
          <Button
            onClick={() => moveSubmarine(0, 5)}
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

export default OceanExplorer;
