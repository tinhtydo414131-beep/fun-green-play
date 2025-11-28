import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type MineItem = "gold" | "diamond" | "emerald" | "ruby" | "coin" | "treasure" | "crystal" | "stone" | "hammer" | "bomb";
type PowerUpType = "hammer" | "bomb" | null;

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

const itemData: Record<MineItem, { emoji: string; value: number; rarity: number; isPowerUp?: boolean }> = {
  stone: { emoji: "🪨", value: 1, rarity: 45 },
  coin: { emoji: "🪙", value: 5, rarity: 28 },
  gold: { emoji: "💰", value: 10, rarity: 13 },
  emerald: { emoji: "💚", value: 20, rarity: 7 },
  ruby: { emoji: "💎", value: 30, rarity: 4 },
  diamond: { emoji: "💎", value: 50, rarity: 2 },
  crystal: { emoji: "🔮", value: 75, rarity: 1.5 },
  treasure: { emoji: "👑", value: 100, rarity: 0.5 },
  hammer: { emoji: "🔨", value: 0, rarity: 3, isPowerUp: true },
  bomb: { emoji: "💣", value: 0, rarity: 1, isPowerUp: true },
};

export const GoldMiner = ({ level, onLevelComplete, onBack }: GoldMinerProps) => {
  const [minedItems, setMinedItems] = useState<MinedItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [nextId, setNextId] = useState(1);
  const [lastItem, setLastItem] = useState<string>("");
  const [powerUps, setPowerUps] = useState<{ hammer: number; bomb: number }>({ hammer: 0, bomb: 0 });
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>(null);
  const [explosionEffect, setExplosionEffect] = useState<{ x: number; y: number } | null>(null);

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

    // Show explosion effect
    if (activePowerUp) {
      setExplosionEffect({ x, y });
      setTimeout(() => setExplosionEffect(null), 1000);
    }

    // Determine mining area based on power-up
    let miningArea = 1;
    if (activePowerUp === "hammer") {
      miningArea = 3; // 3x3 area
      setPowerUps((prev) => ({ ...prev, hammer: prev.hammer - 1 }));
      toast.success("🔨 Búa lớn đào 3x3 khu vực!");
    } else if (activePowerUp === "bomb") {
      miningArea = 5; // 5x5 area
      setPowerUps((prev) => ({ ...prev, bomb: prev.bomb - 1 }));
      toast.success("💣 Bom phát nổ đào 5x5 khu vực!");
    }

    // Mine multiple items based on area
    const newItems: MinedItem[] = [];
    let totalValueGained = 0;
    
    for (let i = 0; i < miningArea; i++) {
      const offsetX = (Math.random() - 0.5) * 10;
      const offsetY = (Math.random() - 0.5) * 10;
      const itemType = getRandomItem();
      const itemInfo = itemData[itemType];

      // Check if it's a power-up
      if (itemInfo.isPowerUp) {
        if (itemType === "hammer") {
          setPowerUps((prev) => ({ ...prev, hammer: prev.hammer + 1 }));
          toast.success("🔨 Nhận được Búa Lớn!");
        } else if (itemType === "bomb") {
          setPowerUps((prev) => ({ ...prev, bomb: prev.bomb + 1 }));
          toast.success("💣 Nhận được Bom!");
        }
      }

      const newItem: MinedItem = {
        id: nextId + i,
        type: itemType,
        x: Math.max(0, Math.min(100, x + offsetX)),
        y: Math.max(0, Math.min(100, y + offsetY)),
        emoji: itemInfo.emoji,
        value: itemInfo.value,
      };

      newItems.push(newItem);
      totalValueGained += itemInfo.value;
    }

    setMinedItems([...minedItems, ...newItems]);
    setTotalValue(totalValue + totalValueGained);
    setClicks(clicks + 1);
    setNextId(nextId + miningArea);
    setLastItem(totalValueGained > 0 ? `+${totalValueGained} 💰` : "");
    setActivePowerUp(null);

    // Remove items after animation
    setTimeout(() => {
      setMinedItems((prev) => prev.filter((item) => !newItems.find((ni) => ni.id === item.id)));
    }, 2000);
  };

  const usePowerUp = (type: PowerUpType) => {
    if (!type) return;
    
    if (type === "hammer" && powerUps.hammer > 0) {
      setActivePowerUp("hammer");
      toast.info("🔨 Click để đào với Búa Lớn!");
    } else if (type === "bomb" && powerUps.bomb > 0) {
      setActivePowerUp("bomb");
      toast.info("💣 Click để đào với Bom!");
    } else {
      toast.error("Không có power-up này!");
    }
  };

  const resetGame = () => {
    setMinedItems([]);
    setTotalValue(0);
    setClicks(0);
    setNextId(1);
    setLastItem("");
    setPowerUps({ hammer: 0, bomb: 0 });
    setActivePowerUp(null);
    setExplosionEffect(null);
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

      {/* Power-ups */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => usePowerUp("hammer")}
          disabled={powerUps.hammer === 0 || activePowerUp !== null}
          variant={activePowerUp === "hammer" ? "default" : "outline"}
          className={`font-bold text-lg px-4 py-6 ${
            activePowerUp === "hammer" ? "animate-pulse border-4 border-orange-500" : ""
          }`}
        >
          🔨 Búa Lớn
          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {powerUps.hammer}
          </span>
        </Button>
        <Button
          onClick={() => usePowerUp("bomb")}
          disabled={powerUps.bomb === 0 || activePowerUp !== null}
          variant={activePowerUp === "bomb" ? "default" : "outline"}
          className={`font-bold text-lg px-4 py-6 ${
            activePowerUp === "bomb" ? "animate-pulse border-4 border-red-500" : ""
          }`}
        >
          💣 Bom
          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {powerUps.bomb}
          </span>
        </Button>
      </div>

      {activePowerUp && (
        <div className="text-center text-lg font-bold text-orange-500 animate-pulse">
          {activePowerUp === "hammer" ? "🔨 Click để đào với Búa Lớn!" : "💣 Click để đào với Bom!"}
        </div>
      )}

      {lastItem && (
        <div className="text-center text-2xl font-bold text-yellow-500 animate-bounce">
          {lastItem}
        </div>
      )}

      <div
        onClick={handleMineClick}
        className={`relative h-96 bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-950 rounded-lg border-2 overflow-hidden ${
          clicks >= maxClicks && totalValue < targetValue
            ? "cursor-not-allowed opacity-50 border-gray-600"
            : activePowerUp === "hammer"
            ? "cursor-crosshair border-4 border-orange-500 hover:border-orange-400"
            : activePowerUp === "bomb"
            ? "cursor-crosshair border-4 border-red-500 hover:border-red-400"
            : "cursor-pointer border-yellow-600 hover:border-yellow-400"
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

        {/* Explosion Effect */}
        {explosionEffect && (
          <div
            className="absolute text-9xl animate-ping"
            style={{
              left: `${explosionEffect.x}%`,
              top: `${explosionEffect.y}%`,
              transform: "translate(-50%, -50%)",
              animationDuration: "0.5s",
            }}
          >
            {activePowerUp === "bomb" ? "💥" : "✨"}
          </div>
        )}

        {/* Center Icon */}
        {clicks < maxClicks && totalValue < targetValue && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`text-8xl ${activePowerUp ? "animate-bounce" : "animate-pulse"}`}>
              {activePowerUp === "hammer" ? "🔨" : activePowerUp === "bomb" ? "💣" : "⛏️"}
            </div>
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

      {/* Power-up Info */}
      <div className="text-center text-xs text-muted-foreground bg-secondary/10 p-3 rounded-lg">
        <p className="font-bold mb-1">💡 Power-ups:</p>
        <p>🔨 Búa Lớn: Đào 3x3 khu vực | 💣 Bom: Đào 5x5 khu vực</p>
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
