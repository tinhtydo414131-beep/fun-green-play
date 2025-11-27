import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Platformer = ({
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
  const [playerPos, setPlayerPos] = useState({ x: 10, y: 70 });
  const [velocity, setVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const targetScore = Math.floor(10 * difficultyMultiplier);

  const platforms = [
    { x: 0, y: 80, width: 100 },
    { x: 30, y: 60, width: 20 },
    { x: 60, y: 40, width: 20 },
    { x: 90, y: 20, width: 10 }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      setPlayerPos(prev => {
        let newY = prev.y + velocity;
        let onPlatform = false;

        platforms.forEach(platform => {
          if (prev.x >= platform.x && prev.x <= platform.x + platform.width &&
              newY >= platform.y - 5 && newY <= platform.y + 2 && velocity >= 0) {
            newY = platform.y - 5;
            onPlatform = true;
            setIsJumping(false);
          }
        });

        if (!onPlatform && newY < 95) {
          setVelocity(v => v + 0.5);
        } else if (newY >= 95) {
          newY = 95;
          setIsJumping(false);
        }

        if (newY > 100) {
          setIsPlaying(false);
          toast.error(`Game Over! Điểm: ${score}`);
        }

        if (prev.x > 95) {
          setScore(score + 1);
          return { x: 10, y: 70 };
        }

        return { ...prev, y: newY };
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, velocity, score]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (e.key === 'ArrowLeft') {
        setPlayerPos(prev => ({ ...prev, x: Math.max(0, prev.x - 3) }));
      }
      if (e.key === 'ArrowRight') {
        setPlayerPos(prev => ({ ...prev, x: Math.min(100, prev.x + 3) }));
      }
      if (e.key === ' ' && !isJumping) {
        setVelocity(-10);
        setIsJumping(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isJumping]);

  const startGame = () => {
    setPlayerPos({ x: 10, y: 70 });
    setVelocity(0);
    setScore(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Điểm: {score}</h2>
        <p className="text-muted-foreground">← → di chuyển, Space nhảy</p>
      </div>

      <div className="relative w-full h-96 bg-gradient-to-b from-sky-300 to-primary/20 border-4 border-primary rounded-lg overflow-hidden">
        {/* Player */}
        <div
          className="absolute w-6 h-6 bg-primary text-2xl"
          style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
        >
          🏃
        </div>

        {/* Platforms */}
        {platforms.map((platform, i) => (
          <div
            key={i}
            className="absolute bg-foreground"
            style={{
              left: `${platform.x}%`,
              top: `${platform.y}%`,
              width: `${platform.width}%`,
              height: '3%'
            }}
          />
        ))}

        {/* Goal */}
        <div
          className="absolute text-4xl"
          style={{ right: '2%', top: '10%' }}
        >
          🏆
        </div>
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
