import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Enemy {
  id: number;
  x: number;
  y: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
}

export const SpaceShooter = () => {
  const [playerX, setPlayerX] = useState(50);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      setEnemies(prev => {
        const newEnemies = prev.map(e => ({ ...e, y: e.y + 2 }))
          .filter(e => e.y < 100);
        
        if (Math.random() < 0.1) {
          newEnemies.push({ id: Date.now(), x: Math.random() * 90 + 5, y: 0 });
        }

        newEnemies.forEach(enemy => {
          if (enemy.y > 90 && Math.abs(enemy.x - playerX) < 5) {
            setIsPlaying(false);
            toast.error(`Game Over! Điểm: ${score}`);
          }
        });

        return newEnemies;
      });

      setBullets(prev => prev.map(b => ({ ...b, y: b.y - 3 })).filter(b => b.y > 0));
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, playerX, score]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') setPlayerX(x => Math.max(5, x - 5));
      if (e.key === 'ArrowRight') setPlayerX(x => Math.min(95, x + 5));
      if (e.key === ' ') shoot();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, playerX]);

  useEffect(() => {
    bullets.forEach(bullet => {
      enemies.forEach(enemy => {
        if (Math.abs(bullet.x - enemy.x) < 3 && Math.abs(bullet.y - enemy.y) < 3) {
          setEnemies(prev => prev.filter(e => e.id !== enemy.id));
          setBullets(prev => prev.filter(b => b.id !== bullet.id));
          setScore(s => s + 10);
        }
      });
    });
  }, [bullets, enemies]);

  const shoot = () => {
    setBullets(prev => [...prev, { id: Date.now(), x: playerX, y: 90 }]);
  };

  const startGame = () => {
    setScore(0);
    setEnemies([]);
    setBullets([]);
    setPlayerX(50);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Điểm: {score}</h2>
        <p className="text-muted-foreground">← → di chuyển, Space bắn</p>
      </div>

      <div className="relative w-full h-96 bg-gradient-to-b from-black to-primary/20 border-4 border-primary rounded-lg overflow-hidden">
        {/* Player */}
        <div
          className="absolute w-8 h-8 bg-primary text-2xl"
          style={{ left: `${playerX}%`, bottom: '5%' }}
        >
          🚀
        </div>

        {/* Enemies */}
        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute w-6 h-6 text-2xl"
            style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
          >
            👾
          </div>
        ))}

        {/* Bullets */}
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className="absolute w-1 h-4 bg-yellow-500"
            style={{ left: `${bullet.x}%`, bottom: `${100 - bullet.y}%` }}
          />
        ))}
      </div>

      <Button onClick={startGame} size="lg">
        {isPlaying ? 'Chơi lại' : 'Bắt đầu'}
      </Button>
    </div>
  );
};
