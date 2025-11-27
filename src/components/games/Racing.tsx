import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Obstacle {
  id: number;
  x: number;
  y: number;
}

export const Racing = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete,
  onBack
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const [carX, setCarX] = useState(50);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2 * difficultyMultiplier);
  const targetScore = Math.floor(20 * difficultyMultiplier);

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      setObstacles(prev => {
        const newObstacles = prev.map(o => ({ ...o, y: o.y + speed }))
          .filter(o => o.y < 100);
        
        if (Math.random() < 0.05) {
          const lanes = [25, 50, 75];
          newObstacles.push({ 
            id: Date.now(), 
            x: lanes[Math.floor(Math.random() * 3)], 
            y: 0 
          });
        }

        newObstacles.forEach(obstacle => {
          if (obstacle.y > 80 && obstacle.y < 95 && Math.abs(obstacle.x - carX) < 8) {
            setIsPlaying(false);
            toast.error(`Game Over! Điểm: ${score}`);
          }
        });

        return newObstacles;
      });

      setScore(s => s + 1);
      setSpeed(s => Math.min(5, s + 0.001));
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, carX, score, speed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      if (e.key === 'ArrowLeft') {
        setCarX(x => Math.max(25, x === 50 ? 25 : x === 75 ? 50 : x));
      }
      if (e.key === 'ArrowRight') {
        setCarX(x => Math.min(75, x === 50 ? 75 : x === 25 ? 50 : x));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const startGame = () => {
    setScore(0);
    setObstacles([]);
    setCarX(50);
    setSpeed(2);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Điểm: {score}</h2>
        <p className="text-muted-foreground">← → chuyển làn</p>
      </div>

      <div className="relative w-64 h-96 bg-gradient-to-b from-gray-700 to-gray-900 border-4 border-primary rounded-lg overflow-hidden">
        {/* Road markings */}
        <div className="absolute left-1/3 w-1 h-full bg-white opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0, white 20px, transparent 20px, transparent 40px)' }} />
        <div className="absolute left-2/3 w-1 h-full bg-white opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0, white 20px, transparent 20px, transparent 40px)' }} />

        {/* Player Car */}
        <div
          className="absolute w-12 h-16 bg-primary text-3xl flex items-center justify-center"
          style={{ left: `${carX}%`, bottom: '10%', transform: 'translateX(-50%)' }}
        >
          🏎️
        </div>

        {/* Obstacles */}
        {obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            className="absolute w-12 h-16 bg-destructive text-3xl flex items-center justify-center"
            style={{ left: `${obstacle.x}%`, top: `${obstacle.y}%`, transform: 'translateX(-50%)' }}
          >
            🚗
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {onBack && (
          <Button 
            onClick={onBack}
            size="lg"
            variant="outline"
          >
            <ArrowLeft className="mr-2" />
            Quay lại
          </Button>
        )}
        <Button onClick={startGame} size="lg">
          {isPlaying ? 'Chơi lại' : 'Bắt đầu'}
        </Button>
      </div>
    </div>
  );
};
