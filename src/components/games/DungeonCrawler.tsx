import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const DungeonCrawler = () => {
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [monsters, setMonsters] = useState<{x: number, y: number}[]>([
    { x: 4, y: 2 }, { x: 7, y: 5 }, { x: 3, y: 7 }
  ]);
  const [treasures, setTreasures] = useState<{x: number, y: number}[]>([
    { x: 9, y: 9 }, { x: 5, y: 4 }
  ]);
  const [hp, setHp] = useState(3);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      let newX = playerPos.x;
      let newY = playerPos.y;

      switch(e.key) {
        case 'ArrowUp': newY = Math.max(0, playerPos.y - 1); break;
        case 'ArrowDown': newY = Math.min(9, playerPos.y + 1); break;
        case 'ArrowLeft': newX = Math.max(0, playerPos.x - 1); break;
        case 'ArrowRight': newX = Math.min(9, playerPos.x + 1); break;
        default: return;
      }

      const hitMonster = monsters.find(m => m.x === newX && m.y === newY);
      if (hitMonster) {
        setHp(hp - 1);
        setMonsters(monsters.filter(m => m !== hitMonster));
        toast.error('Bị quái tấn công! -1 HP');
        if (hp <= 1) {
          toast.error('Game Over!');
          resetGame();
          return;
        }
      }

      const hitTreasure = treasures.find(t => t.x === newX && t.y === newY);
      if (hitTreasure) {
        setScore(score + 10);
        setTreasures(treasures.filter(t => t !== hitTreasure));
        toast.success('Tìm được kho báu! +10 điểm');
      }

      setPlayerPos({ x: newX, y: newY });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, monsters, treasures, hp, score]);

  const resetGame = () => {
    setPlayerPos({ x: 0, y: 0 });
    setMonsters([{ x: 4, y: 2 }, { x: 7, y: 5 }, { x: 3, y: 7 }]);
    setTreasures([{ x: 9, y: 9 }, { x: 5, y: 4 }]);
    setHp(3);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          HP: {hp} | Điểm: {score}
        </h2>
        <p className="text-muted-foreground">Dùng phím mũi tên</p>
      </div>

      <div className="grid grid-cols-10 gap-1 p-4 bg-muted/30 rounded-lg">
        {Array.from({ length: 100 }).map((_, i) => {
          const x = i % 10;
          const y = Math.floor(i / 10);
          const isPlayer = x === playerPos.x && y === playerPos.y;
          const isMonster = monsters.some(m => m.x === x && m.y === y);
          const isTreasure = treasures.some(t => t.x === x && t.y === y);

          return (
            <Card
              key={i}
              className={`w-8 h-8 flex items-center justify-center text-xl ${
                isPlayer ? 'bg-primary' :
                isMonster ? 'bg-destructive' :
                isTreasure ? 'bg-yellow-500' :
                'bg-background'
              }`}
            >
              {isPlayer && '🧙'}
              {isMonster && '👹'}
              {isTreasure && '💎'}
            </Card>
          );
        })}
      </div>

      <Button onClick={resetGame} size="lg">Chơi lại</Button>
    </div>
  );
};
