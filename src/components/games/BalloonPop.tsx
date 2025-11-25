import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const BalloonPop = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const targetScore = Math.floor(10 * difficultyMultiplier);
  const balloonSpeed = 1 + (difficultyMultiplier - 1) * 0.5;
  const { playPop, playScore, startBackgroundMusic, stopBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const newBalloon: Balloon = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: 100,
        color: ['bg-red-500', 'bg-blue-500', 'bg-primary', 'bg-yellow-500'][Math.floor(Math.random() * 4)]
      };
      setBalloons(prev => [...prev, newBalloon]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const moveInterval = setInterval(() => {
      setBalloons(prev => 
        prev.map(balloon => ({ ...balloon, y: balloon.y - 1 }))
          .filter(balloon => balloon.y > 0)
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isPlaying]);

  const popBalloon = (id: number) => {
    setBalloons(prev => prev.filter(b => b.id !== id));
    setScore(score + 1);
    playPop();
    playScore();
    toast.success('+1 điểm!');
  };

  const startGame = () => {
    setScore(0);
    setBalloons([]);
    setIsPlaying(true);
    startBackgroundMusic();
  };

  useEffect(() => {
    if (!isPlaying) {
      stopBackgroundMusic();
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Điểm: {score}
        </h2>
        <p className="text-muted-foreground">Nhấp để bắn vỡ bóng!</p>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
      </div>

      <div className="relative w-full h-96 bg-gradient-to-b from-primary/10 to-background border-4 border-primary rounded-lg overflow-hidden">
        {balloons.map(balloon => (
          <div
            key={balloon.id}
            onClick={() => popBalloon(balloon.id)}
            className={`absolute w-12 h-16 ${balloon.color} rounded-full cursor-pointer transition-all hover:scale-110`}
            style={{
              left: `${balloon.x}%`,
              bottom: `${balloon.y}%`,
            }}
          >
            🎈
          </div>
        ))}
      </div>

      <Button onClick={startGame} size="lg">
        {isPlaying ? 'Chơi lại' : 'Bắt đầu'}
      </Button>
    </div>
  );
};
