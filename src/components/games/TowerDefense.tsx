import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Enemy {
  id: number;
  hp: number;
  position: number;
}

export const TowerDefense = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<number[]>([]);
  const [gold, setGold] = useState(100);
  const [lives, setLives] = useState(10);
  const [wave, setWave] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      setEnemies(prev => {
        let newEnemies = prev.map(e => ({ ...e, position: e.position + 1 }));
        
        // Tower attacks
        towers.forEach(towerPos => {
          newEnemies = newEnemies.map(e => {
            if (Math.abs(e.position - towerPos) < 3) {
              return { ...e, hp: e.hp - 1 };
            }
            return e;
          });
        });

        // Remove dead enemies and give gold
        const deadCount = newEnemies.filter(e => e.hp <= 0).length;
        if (deadCount > 0) {
          setGold(g => g + deadCount * 10);
        }
        newEnemies = newEnemies.filter(e => e.hp > 0);

        // Check if enemies reached end
        const reachedEnd = newEnemies.filter(e => e.position >= 10);
        if (reachedEnd.length > 0) {
          setLives(l => l - reachedEnd.length);
          if (lives - reachedEnd.length <= 0) {
            setIsPlaying(false);
            toast.error(`Game Over! Wave: ${wave}`);
          }
        }
        newEnemies = newEnemies.filter(e => e.position < 10);

        // Spawn new enemies
        if (Math.random() < 0.05) {
          newEnemies.push({ id: Date.now(), hp: wave * 2, position: 0 });
        }

        return newEnemies;
      });
    }, 200);

    return () => clearInterval(gameLoop);
  }, [isPlaying, towers, lives, wave]);

  const placeTower = (pos: number) => {
    if (gold < 50 || towers.includes(pos)) return;
    setTowers([...towers, pos]);
    setGold(gold - 50);
    toast.success('Đặt tháp!');
  };

  const nextWave = () => {
    setWave(wave + 1);
    toast.info(`Wave ${wave + 1}!`);
  };

  const startGame = () => {
    setEnemies([]);
    setTowers([]);
    setGold(100);
    setLives(10);
    setWave(1);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          💰 {gold} | ❤️ {lives} | Wave {wave}
        </h2>
        <p className="text-muted-foreground">Click để đặt tháp (50 vàng)</p>
      </div>

      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: 30 }).map((_, i) => {
          const pos = i % 10;
          const row = Math.floor(i / 10);
          const hasTower = towers.includes(i);
          const enemy = enemies.find(e => Math.floor(e.position) === pos && row === 1);

          return (
            <Card
              key={i}
              onClick={() => row === 0 && placeTower(i)}
              className={`w-12 h-12 flex items-center justify-center text-2xl ${
                row === 0 ? 'cursor-pointer hover:bg-primary/20' : ''
              } ${hasTower ? 'bg-primary' : 'bg-background'}`}
            >
              {hasTower && '🗼'}
              {enemy && '👾'}
              {row === 1 && !enemy && '─'}
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button onClick={startGame} size="lg">
          {isPlaying ? 'Chơi lại' : 'Bắt đầu'}
        </Button>
        {isPlaying && (
          <Button onClick={nextWave} variant="outline" size="lg">
            Wave tiếp
          </Button>
        )}
      </div>
    </div>
  );
};
