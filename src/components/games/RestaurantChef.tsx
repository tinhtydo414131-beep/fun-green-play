import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RestaurantItem = "chef" | "waiter" | "table" | "food" | "drink" | "pizza" | "burger" | "dessert";

interface RestaurantChefProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Item {
  id: number;
  type: RestaurantItem;
  x: number;
  y: number;
  emoji: string;
}

const itemEmojis: Record<RestaurantItem, string> = {
  chef: "👨‍🍳",
  waiter: "🧑‍💼",
  table: "🪑",
  food: "🍽️",
  drink: "🥤",
  pizza: "🍕",
  burger: "🍔",
  dessert: "🍰",
};

export const RestaurantChef = ({ level, onLevelComplete, onBack }: RestaurantChefProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<RestaurantItem>("chef");
  const [customers, setCustomers] = useState(0);
  const [nextId, setNextId] = useState(1);

  const targetCustomers = level * 17;

  useEffect(() => {
    if (customers >= targetCustomers) {
      onLevelComplete();
    }
  }, [customers, targetCustomers, onLevelComplete]);

  const handleRestaurantClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setCustomers(customers + 1);
    setNextId(nextId + 1);
  };

  const resetGame = () => {
    setItems([]);
    setCustomers(0);
    setNextId(1);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="text-lg">
          Khách hàng: {customers}/{targetCustomers} 🍽️
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(itemEmojis) as RestaurantItem[]).map((type) => (
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
        onClick={handleRestaurantClick}
        className="relative h-96 bg-gradient-to-b from-orange-100 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg border-2 border-primary cursor-pointer overflow-hidden"
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
