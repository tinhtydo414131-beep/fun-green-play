import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MineItem = "gold" | "diamond" | "emerald" | "ruby" | "coin" | "treasure" | "crystal" | "stone";

interface GoldMinerProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface MinedItem {
  id: number;
  type: MineItem;
  x: number;
  y: number;
  emoji: string;
  value: number;
}

const itemData: Record<MineItem, { emoji: string; value: number; rarity: number }> = {
  stone: { emoji: "🪨", value: 1, rarity: 50 },
  coin: { emoji: "🪙", value: 5, rarity: 30 },
  gold: { emoji: "💰", value: 10, rarity: 15 },
  emerald: { emoji: "💚", value: 20, rarity: 8 },
  ruby: { emoji: "💎", value: 30, rarity: 5 },
  diamond: { emoji: "💎", value: 50, rarity: 3 },
  crystal: { emoji: "🔮", value: 75, rarity: 2 },
  treasure: { emoji: "👑", value: 100, rarity: 1 },
};

export const GoldMiner = ({ level, onLevelComplete, onBack }: GoldMinerProps) => {
  const [minedItems, setMinedItems] = useState<MinedItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [nextId, setNextId] = useState(1);
  const [lastItem, setLastItem] = useState<string>("");

  const targetValue = level * 200;
  const maxClicks = level * 30;

  useEffect(() => {
    if (totalValue >= targetValue) {
      onLevelComplete();
    }
  }, [totalValue, targetValue, onLevelComplete]);

  const getRandomItem = (): MineItem => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [item, data] of Object.entries(itemData)) {
      cumulative += data.rarity;
      if (random <= cumulative) {
        return item as MineItem;
      }
    }
    return "stone";
  };

  const handleMineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clicks >= maxClicks && totalValue < targetValue) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const itemType = getRandomItem();
    const itemInfo = itemData[itemType];

    const newItem: MinedItem = {
      id: nextId,
      type: itemType,
      x,
      y,
      emoji: itemInfo.emoji,
      value: itemInfo.value,
    };

    setMinedItems([...minedItems, newItem]);
    setTotalValue(totalValue + itemInfo.value);
    setClicks(clicks + 1);
    setNextId(nextId + 1);
    setLastItem(`+${itemInfo.value} ${itemInfo.emoji}`);

    // Remove item after animation
    setTimeout(() => {
      setMinedItems((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 2000);
  };

  const resetGame = () => {
    setMinedItems([]);
    setTotalValue(0);
    setClicks(0);
    setNextId(1);
    setLastItem("");
  };

  const progressPercentage = Math.min((totalValue / targetValue) * 100, 100);
  const clicksRemaining = maxClicks - clicks;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="text-lg font-bold text-yellow-500">
          💰 {totalValue} / {targetValue}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ:</span>
          <span className="font-bold">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-secondary/30 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full transition-all duration-300 flex items-center justify-center"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 10 && (
              <span className="text-xs font-bold text-white">
                {progressPercentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div>
          ⛏️ Số lần đào: <span className="font-bold text-primary">{clicks}</span>
        </div>
        <div>
          Còn lại: <span className="font-bold text-orange-500">{clicksRemaining}</span>
        </div>
      </div>

      {lastItem && (
        <div className="text-center text-2xl font-bold text-yellow-500 animate-bounce">
          {lastItem}
        </div>
      )}

      <div
        onClick={handleMineClick}
        className={`relative h-96 bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-950 rounded-lg border-2 border-yellow-600 overflow-hidden ${
          clicks >= maxClicks && totalValue < targetValue
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:border-yellow-400"
        }`}
      >
        {/* Mining Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-600 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Center Pickaxe */}
        {clicks < maxClicks && totalValue < targetValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl animate-pulse">⛏️</div>
          </div>
        )}

        {/* Mined Items */}
        {minedItems.map((item) => (
          <div
            key={item.id}
            className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in slide-out-to-top-full"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDuration: "2s",
            }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Game Over Message */}
        {clicks >= maxClicks && totalValue < targetValue && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="text-4xl mb-4">⛏️</div>
              <p className="text-2xl font-bold mb-2">Hết lượt đào!</p>
              <p className="text-lg">Thiếu {targetValue - totalValue} để hoàn thành</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 bg-secondary/20 rounded">
          <div className="text-2xl">🪨</div>
          <div className="font-bold">+1</div>
        </div>
        <div className="p-2 bg-secondary/20 rounded">
          <div className="text-2xl">🪙</div>
          <div className="font-bold">+5</div>
        </div>
        <div className="p-2 bg-secondary/20 rounded">
          <div className="text-2xl">💰</div>
          <div className="font-bold">+10</div>
        </div>
        <div className="p-2 bg-secondary/20 rounded">
          <div className="text-2xl">💎</div>
          <div className="font-bold">+30</div>
        </div>
      </div>

      <div className="flex gap-2">
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Quay lại
          </Button>
        )}
        <Button onClick={resetGame} variant="outline">
          Làm mới
        </Button>
      </div>
    </Card>
  );
};
