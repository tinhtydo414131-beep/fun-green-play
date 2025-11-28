import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PetItem = "food" | "toy" | "bed" | "water" | "ball" | "bone" | "fish" | "bowl";

interface PetCareProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Item {
  id: number;
  type: PetItem;
  x: number;
  y: number;
  emoji: string;
}

const itemEmojis: Record<PetItem, string> = {
  food: "🍖",
  toy: "🧸",
  bed: "🛏️",
  water: "💧",
  ball: "⚽",
  bone: "🦴",
  fish: "🐟",
  bowl: "🥣",
};

export const PetCare = ({ level, onLevelComplete, onBack }: PetCareProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<PetItem>("food");
  const [happiness, setHappiness] = useState(0);
  const [nextId, setNextId] = useState(1);

  const targetHappiness = level * 12;

  useEffect(() => {
    if (happiness >= targetHappiness) {
      onLevelComplete();
    }
  }, [happiness, targetHappiness, onLevelComplete]);

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newItem: Item = {
      id: nextId,
      type: selectedType,
      x,
      y,
      emoji: itemEmojis[selectedType],
    };

    setItems([...items, newItem]);
    setHappiness(happiness + 1);
    setNextId(nextId + 1);
  };

  const resetGame = () => {
    setItems([]);
    setHappiness(0);
    setNextId(1);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="text-lg">
          Hạnh phúc: {happiness}/{targetHappiness} 🐶
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(itemEmojis) as PetItem[]).map((type) => (
          <Button
            key={type}
            onClick={() => setSelectedType(type)}
            variant={selectedType === type ? "default" : "outline"}
            className="text-2xl"
          >
            {itemEmojis[type]}
          </Button>
        ))}
      </div>

      <div
        onClick={handleAreaClick}
        className="relative h-96 bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-900 dark:to-green-900 rounded-lg border-2 border-primary cursor-pointer overflow-hidden"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute text-3xl transform -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.emoji}
          </div>
        ))}
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
