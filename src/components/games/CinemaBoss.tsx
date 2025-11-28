import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CinemaItem = "screen" | "seat" | "popcorn" | "ticket" | "camera" | "projector" | "speaker" | "curtain";

interface CinemaBossProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Item {
  id: number;
  type: CinemaItem;
  x: number;
  y: number;
  emoji: string;
}

const itemEmojis: Record<CinemaItem, string> = {
  screen: "🎬",
  seat: "💺",
  popcorn: "🍿",
  ticket: "🎟️",
  camera: "🎥",
  projector: "📽️",
  speaker: "🔊",
  curtain: "🎭",
};

export const CinemaBoss = ({ level, onLevelComplete, onBack }: CinemaBossProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<CinemaItem>("screen");
  const [viewers, setViewers] = useState(0);
  const [nextId, setNextId] = useState(1);

  const targetViewers = level * 16;

  useEffect(() => {
    if (viewers >= targetViewers) {
      onLevelComplete();
    }
  }, [viewers, targetViewers, onLevelComplete]);

  const handleCinemaClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setViewers(viewers + 1);
    setNextId(nextId + 1);
  };

  const resetGame = () => {
    setItems([]);
    setViewers(0);
    setNextId(1);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="text-lg">
          Khán giả: {viewers}/{targetViewers} 🎬
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(itemEmojis) as CinemaItem[]).map((type) => (
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
        onClick={handleCinemaClick}
        className="relative h-96 bg-gradient-to-b from-red-900 to-purple-900 rounded-lg border-2 border-primary cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent"></div>
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
