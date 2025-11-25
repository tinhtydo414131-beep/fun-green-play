import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const FlappyBird = () => {
  const [birdY, setBirdY] = useState(50);
  const [pipes, setPipes] = useState<{ x: number; gapY: number }[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      setBirdY(prev => {
        const newY = prev + velocity;
        if (newY > 90 || newY < 0) {
          setIsPlaying(false);
          toast.error(`Game Over! Điểm: ${score}`);
          return prev;
        }
        return newY;
      });
      setVelocity(prev => prev + 0.5);

      setPipes(prev => {
        const newPipes = prev.map(pipe => ({ ...pipe, x: pipe.x - 2 }))
          .filter(pipe => pipe.x > -10);
        
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 70) {
          newPipes.push({ x: 100, gapY: Math.random() * 50 + 20 });
        }

        // Check collision
        newPipes.forEach(pipe => {
          if (pipe.x > 8 && pipe.x < 18) {
            if (birdY < pipe.gapY - 15 || birdY > pipe.gapY + 15) {
              setIsPlaying(false);
              toast.error(`Game Over! Điểm: ${score}`);
            }
          }
          if (pipe.x === 8) setScore(s => s + 1);
        });

        return newPipes;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, velocity, birdY, score]);

  const flap = () => {
    if (!isPlaying) return;
    setVelocity(-3);
  };

  const startGame = () => {
    setBirdY(50);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Điểm: {score}
        </h2>
        <p className="text-muted-foreground">Nhấp để bay lên!</p>
      </div>

      <div 
        onClick={flap}
        className="relative w-full h-96 bg-gradient-to-b from-sky-300 to-primary/20 border-4 border-primary rounded-lg overflow-hidden cursor-pointer"
      >
        {/* Bird */}
        <div
          className="absolute w-8 h-8 bg-yellow-500 rounded-full transition-all"
          style={{ left: '10%', top: `${birdY}%` }}
        >
          🐦
        </div>

        {/* Pipes */}
        {pipes.map((pipe, i) => (
          <div key={i}>
            <div
              className="absolute bg-primary"
              style={{
                left: `${pipe.x}%`,
                top: 0,
                width: '60px',
                height: `${pipe.gapY - 15}%`
              }}
            />
            <div
              className="absolute bg-primary"
              style={{
                left: `${pipe.x}%`,
                bottom: 0,
                width: '60px',
                height: `${100 - (pipe.gapY + 15)}%`
              }}
            />
          </div>
        ))}
      </div>

      <Button onClick={startGame} size="lg">
        {isPlaying ? 'Chơi lại' : 'Bắt đầu'}
      </Button>
    </div>
  );
};
