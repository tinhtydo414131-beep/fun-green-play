import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Star, Zap, Heart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniStarExplorerProps {
  onComplete?: (score: number) => void;
  onBack?: () => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  collected: boolean;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function MiniStarExplorer({ onComplete, onBack }: MiniStarExplorerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rocketPos, setRocketPos] = useState({ x: 50, y: 80 });
  const [stars, setStars] = useState<Star[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize game
  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(true);
    setRocketPos({ x: 50, y: 80 });
    generateLevel();
  };

  const generateLevel = () => {
    // Generate stars
    const newStars: Star[] = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
      size: 20 + Math.random() * 15,
      collected: false,
    }));
    setStars(newStars);

    // Generate obstacles
    const newObstacles: Obstacle[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
      size: 30 + Math.random() * 20,
    }));
    setObstacles(newObstacles);
  };

  // Handle movement
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying || gameOver) return;
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setRocketPos({ x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) });
  };

  // Check collisions
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    // Check star collection
    const rocketSize = 40;
    stars.forEach((star) => {
      if (star.collected) return;
      
      const distance = Math.sqrt(
        Math.pow(rocketPos.x - star.x, 2) + Math.pow(rocketPos.y - star.y, 2)
      );

      if (distance < (rocketSize + star.size) / 4) {
        setStars((prev) =>
          prev.map((s) => (s.id === star.id ? { ...s, collected: true } : s))
        );
        setScore((s) => s + 100);
      }
    });

    // Check obstacle collision
    obstacles.forEach((obs) => {
      const distance = Math.sqrt(
        Math.pow(rocketPos.x - obs.x, 2) + Math.pow(rocketPos.y - obs.y, 2)
      );

      if (distance < (rocketSize + obs.size) / 5) {
        setLives((l) => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setIsPlaying(false);
            onComplete?.(score);
          }
          return newLives;
        });
        // Move obstacle away after hit
        setObstacles((prev) =>
          prev.map((o) =>
            o.id === obs.id ? { ...o, x: Math.random() * 80 + 10, y: Math.random() * 60 + 10 } : o
          )
        );
      }
    });

    // Check win condition
    if (stars.every((s) => s.collected)) {
      generateLevel();
      setScore((s) => s + 500); // Bonus for completing level
    }
  }, [rocketPos, stars, obstacles, isPlaying, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-lg">{score}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-muted'}`}
              />
            ))}
          </div>
        </div>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
        )}
      </div>

      {/* Game Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        className="relative w-full aspect-square max-w-[400px] rounded-2xl bg-gradient-to-b from-indigo-950 via-purple-950 to-black overflow-hidden border-4 border-primary/30 touch-none cursor-crosshair"
      >
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Collectible Stars */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ scale: 1 }}
            animate={{ scale: star.collected ? 0 : [1, 1.2, 1] }}
            transition={{ repeat: star.collected ? 0 : Infinity, duration: 1 }}
            className="absolute"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {!star.collected && (
              <Star
                className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                style={{ width: star.size, height: star.size }}
              />
            )}
          </motion.div>
        ))}

        {/* Obstacles */}
        {obstacles.map((obs) => (
          <motion.div
            key={obs.id}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute"
            style={{
              left: `${obs.x}%`,
              top: `${obs.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Zap
              className="text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]"
              style={{ width: obs.size, height: obs.size }}
            />
          </motion.div>
        ))}

        {/* Rocket */}
        {isPlaying && (
          <motion.div
            className="absolute"
            animate={{ 
              left: `${rocketPos.x}%`, 
              top: `${rocketPos.y}%`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <Rocket className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(255,107,0,0.8)] -rotate-45" />
          </motion.div>
        )}

        {/* Start/Game Over Overlay */}
        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-4xl mb-4">{gameOver ? '💥' : '🚀'}</div>
            <div className="text-2xl font-bold text-white mb-2">
              {gameOver ? 'Game Over!' : 'Star Explorer'}
            </div>
            {gameOver && <div className="text-lg text-yellow-400 mb-4">Score: {score}</div>}
            <Button onClick={startGame} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              {gameOver ? <RotateCcw className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
              {gameOver ? 'Play Again' : 'Start Game'}
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Move your finger/mouse to control the rocket! 🚀<br/>
        Collect ⭐ stars and avoid ⚡ obstacles!
      </p>
    </div>
  );
}
