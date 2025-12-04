import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

export const FlappyBird = ({
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
  // Responsive canvas size
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const canvasWidth = isMobile ? Math.min(window.innerWidth * 0.92, 380) : 360;
  const canvasHeight = isMobile ? Math.min(window.innerHeight * 0.55, 520) : 500;
  const birdSize = 30;
  const pipeWidth = 50;
  const gapSize = Math.max(100, 150 - (level * 10));
  const gravity = 0.5;
  const jumpForce = -8;
  const pipeSpeed = 2 + (level * 0.3);
  const targetScore = level * 5;

  const [birdY, setBirdY] = useState(canvasHeight / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef<number>();

  const jump = useCallback(() => {
    if (!isPlaying && !gameOver) {
      startGame();
      return;
    }
    if (isPlaying) {
      setVelocity(jumpForce);
    }
  }, [isPlaying, gameOver]);

  const startGame = () => {
    setBirdY(canvasHeight / 2);
    setVelocity(0);
    setPipes([{ x: canvasWidth, gapY: Math.random() * (canvasHeight - gapSize - 100) + 50, passed: false }]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setBirdY(canvasHeight / 2);
    setVelocity(0);
    setPipes([]);
    setScore(0);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jump]);

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = () => {
      // Update bird position
      setBirdY(prev => {
        const newY = prev + velocity;
        
        // Check collision with ground/ceiling
        if (newY <= 0 || newY >= canvasHeight - birdSize) {
          setIsPlaying(false);
          setGameOver(true);
          toast.error("Game Over! 🐦");
          return prev;
        }
        return newY;
      });

      setVelocity(prev => prev + gravity);

      // Update pipes
      setPipes(prev => {
        let newPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - pipeSpeed
        })).filter(pipe => pipe.x > -pipeWidth);

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < canvasWidth - 200) {
          newPipes.push({
            x: canvasWidth,
            gapY: Math.random() * (canvasHeight - gapSize - 100) + 50,
            passed: false
          });
        }

        // Check collisions and scoring
        newPipes = newPipes.map(pipe => {
          const birdLeft = 50;
          const birdRight = 50 + birdSize;
          const birdTop = birdY;
          const birdBottom = birdY + birdSize;

          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + pipeWidth;
          const gapTop = pipe.gapY;
          const gapBottom = pipe.gapY + gapSize;

          // Check collision
          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < gapTop || birdBottom > gapBottom) {
              setIsPlaying(false);
              setGameOver(true);
              toast.error("Game Over! 🐦");
            }
          }

          // Check scoring
          if (!pipe.passed && pipe.x + pipeWidth < birdLeft) {
            setScore(prev => {
              const newScore = prev + 1;
              if (newScore >= targetScore && onLevelComplete) {
                toast.success("Hoàn thành level! 🎉");
                setTimeout(() => {
                  setIsPlaying(false);
                  onLevelComplete();
                }, 500);
              }
              return newScore;
            });
            return { ...pipe, passed: true };
          }

          return pipe;
        });

        return newPipes;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, velocity, birdY, pipeSpeed, gapSize, targetScore, onLevelComplete]);

  return (
    <div className="flex flex-col items-center gap-2 md:gap-4 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Điểm: {score}/{targetScore}
        </h2>
        <p className="text-sm text-muted-foreground">Chạm để bay!</p>
      </div>

      <Card 
        className="relative overflow-hidden cursor-pointer select-none touch-manipulation will-change-transform"
        style={{ width: canvasWidth, height: canvasHeight }}
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      >
        {/* Sky background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200" />
        
        {/* Clouds */}
        <div className="absolute top-10 left-10 text-4xl opacity-80">☁️</div>
        <div className="absolute top-20 right-20 text-3xl opacity-60">☁️</div>
        <div className="absolute top-40 left-1/2 text-2xl opacity-70">☁️</div>

        {/* Bird */}
        <div
          className="absolute transition-transform"
          style={{
            left: 50,
            top: birdY,
            width: birdSize,
            height: birdSize,
            transform: `rotate(${Math.min(velocity * 3, 45)}deg)`
          }}
        >
          <span className="text-3xl">🐦</span>
        </div>

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <div key={index}>
            {/* Top pipe */}
            <div
              className="absolute bg-gradient-to-b from-green-600 to-green-500 border-2 border-green-700 rounded-b-lg"
              style={{
                left: pipe.x,
                top: 0,
                width: pipeWidth,
                height: pipe.gapY
              }}
            />
            {/* Bottom pipe */}
            <div
              className="absolute bg-gradient-to-b from-green-500 to-green-600 border-2 border-green-700 rounded-t-lg"
              style={{
                left: pipe.x,
                top: pipe.gapY + gapSize,
                width: pipeWidth,
                height: canvasHeight - pipe.gapY - gapSize
              }}
            />
          </div>
        ))}

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-700 to-amber-500" />

        {/* Start/Game Over overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-4xl mb-4">{gameOver ? "💀" : "🐦"}</p>
              <p className="text-xl font-bold">
                {gameOver ? `Game Over! Điểm: ${score}` : "Chạm để bắt đầu!"}
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-3 mt-2">
        {onBack && (
          <Button onClick={onBack} size="lg" variant="outline" className="touch-manipulation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button onClick={resetGame} size="lg" className="touch-manipulation">
          Chơi lại 🐦
        </Button>
      </div>
    </div>
  );
};
