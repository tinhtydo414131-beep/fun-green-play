import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Position {
  x: number;
  y: number;
}

export const Snake = () => {
  const gridSize = 20;
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setScore(0);
    generateFood();
    setIsPlaying(true);
  };

  const checkCollision = (head: Position) => {
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      return true;
    }
    for (let segment of snake.slice(1)) {
      if (segment.x === head.x && segment.y === head.y) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch(e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        switch(direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        if (checkCollision(head)) {
          setIsPlaying(false);
          toast.error(`😢 Game Over! Điểm: ${score}`);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          toast.success('Ngon quá! 🍎 +10');
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [direction, isPlaying, food, score, generateFood]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 animate-fade-in">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          🐍 Rắn Săn Mồi
        </h2>
        <p className="text-3xl font-comic text-primary">Điểm: {score} 🌟</p>
        <p className="text-lg font-comic text-muted-foreground">
          Dùng phím mũi tên để điều khiển! 🎮
        </p>
      </div>

      <div 
        className="border-4 border-primary rounded-3xl overflow-hidden shadow-2xl"
        style={{ 
          width: `${gridSize * 20}px`, 
          height: `${gridSize * 20}px`,
          position: 'relative',
          background: 'linear-gradient(135deg, hsl(140 70% 96%) 0%, hsl(30 100% 96%) 100%)'
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${segment.x * 20}px`,
              top: `${segment.y * 20}px`,
              width: '18px',
              height: '18px',
              background: index === 0 
                ? 'linear-gradient(135deg, hsl(140 70% 50%) 0%, hsl(160 65% 45%) 100%)' 
                : 'hsl(140 70% 55%)',
              borderRadius: '6px',
              border: '2px solid hsl(140 70% 40%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.1s'
            }}
          />
        ))}

        {/* Food */}
        <div
          style={{
            position: 'absolute',
            left: `${food.x * 20}px`,
            top: `${food.y * 20}px`,
            width: '18px',
            height: '18px',
            background: 'linear-gradient(135deg, hsl(30 100% 55%) 0%, hsl(45 95% 55%) 100%)',
            borderRadius: '50%',
            border: '2px solid hsl(30 100% 45%)',
            boxShadow: '0 2px 8px rgba(255,150,0,0.6)',
            animation: 'pulse 1s infinite'
          }}
        />
      </div>

      <Button 
        onClick={resetGame}
        size="lg"
        className="font-fredoka font-bold text-xl px-12 py-8 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-110 transition-all"
      >
        {isPlaying ? 'Chơi Lại 🔄' : 'Bắt Đầu 🎮'}
      </Button>
    </div>
  );
};
