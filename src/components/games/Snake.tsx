import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

export const Snake = ({
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
  const gridSize = 15;
  const initialSpeed = Math.max(100, 200 - (level * 10));
  const targetScore = level * 5;

  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<string>("RIGHT");
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const directionRef = useRef(direction);

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood({ x: 5, y: 5 });
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      const current = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (current !== "LEFT") setDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = directionRef.current;
        
        switch (currentDir) {
          case "UP": head.y -= 1; break;
          case "DOWN": head.y += 1; break;
          case "LEFT": head.x -= 1; break;
          case "RIGHT": head.x += 1; break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          setGameOver(true);
          setIsPlaying(false);
          toast.error("Game Over! 🐍");
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setIsPlaying(false);
          toast.error("Game Over! 🐍");
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => {
            const newScore = prev + 1;
            if (newScore >= targetScore && onLevelComplete) {
              toast.success("Hoàn thành! 🎉");
              setTimeout(() => onLevelComplete(), 500);
            }
            return newScore;
          });
          setFood(generateFood());
          toast.success("+1! 🍎");
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, initialSpeed);
    return () => clearInterval(gameInterval);
  }, [isPlaying, gameOver, food, generateFood, initialSpeed, targetScore, onLevelComplete]);

  const handleDirectionButton = (newDir: string) => {
    if (!isPlaying) return;
    const current = directionRef.current;
    if (
      (newDir === "UP" && current !== "DOWN") ||
      (newDir === "DOWN" && current !== "UP") ||
      (newDir === "LEFT" && current !== "RIGHT") ||
      (newDir === "RIGHT" && current !== "LEFT")
    ) {
      setDirection(newDir);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 md:gap-4 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Điểm: {score}/{targetScore}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">Level {level}</p>
      </div>

      <Card className="p-1 md:p-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
        <div 
          className="grid gap-[1px] bg-green-300 dark:bg-green-700 rounded will-change-transform"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: `min(92vw, 400px)`,
            height: `min(92vw, 400px)`
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`aspect-square rounded-sm ${
                  isSnakeHead 
                    ? "bg-green-600 dark:bg-green-400 scale-110" 
                    : isSnake 
                    ? "bg-green-500 dark:bg-green-500" 
                    : isFood 
                    ? "bg-red-500 animate-pulse" 
                    : "bg-green-100 dark:bg-green-900"
                }`}
              >
                {isSnakeHead && <span className="text-xs">👀</span>}
                {isFood && <span className="text-xs">🍎</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mobile Controls - Larger touch targets */}
      <div className="grid grid-cols-3 gap-3 md:hidden mt-2">
        <div />
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 w-14 touch-manipulation active:scale-95 transition-transform"
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton("UP"); }}
          onClick={() => handleDirectionButton("UP")}
          disabled={!isPlaying}
        >
          <ArrowUp className="h-7 w-7" />
        </Button>
        <div />
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 w-14 touch-manipulation active:scale-95 transition-transform"
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton("LEFT"); }}
          onClick={() => handleDirectionButton("LEFT")}
          disabled={!isPlaying}
        >
          <ArrowLeft className="h-7 w-7" />
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 w-14 touch-manipulation active:scale-95 transition-transform"
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton("DOWN"); }}
          onClick={() => handleDirectionButton("DOWN")}
          disabled={!isPlaying}
        >
          <ArrowDown className="h-7 w-7" />
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 w-14 touch-manipulation active:scale-95 transition-transform"
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton("RIGHT"); }}
          onClick={() => handleDirectionButton("RIGHT")}
          disabled={!isPlaying}
        >
          <ArrowRight className="h-7 w-7" />
        </Button>
      </div>

      <div className="flex gap-3 mt-2">
        {onBack && (
          <Button onClick={onBack} size="lg" variant="outline" className="touch-manipulation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button onClick={startGame} size="lg" className="touch-manipulation">
          {isPlaying ? "Chơi lại" : gameOver ? "Chơi lại" : "Bắt đầu"} 🐍
        </Button>
      </div>
    </div>
  );
};
