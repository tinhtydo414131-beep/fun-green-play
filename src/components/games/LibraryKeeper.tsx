import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LibraryItem = "book" | "shelf" | "desk" | "lamp" | "computer" | "globe" | "pencil" | "bookmark";

interface LibraryKeeperProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Item {
  id: number;
  type: LibraryItem;
  x: number;
  y: number;
  emoji: string;
}

const itemEmojis: Record<LibraryItem, string> = {
  book: "📚",
  shelf: "🗄️",
  desk: "🪑",
  lamp: "💡",
  computer: "💻",
  globe: "🌍",
  pencil: "✏️",
  bookmark: "🔖",
};

export const LibraryKeeper = ({ level, onLevelComplete, onBack }: LibraryKeeperProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<LibraryItem>("book");
  const [knowledge, setKnowledge] = useState(0);
  const [nextId, setNextId] = useState(1);

  const targetKnowledge = level * 15;

  useEffect(() => {
    if (knowledge >= targetKnowledge) {
      onLevelComplete();
    }
  }, [knowledge, targetKnowledge, onLevelComplete]);

  const handleLibraryClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setKnowledge(knowledge + 1);
    setNextId(nextId + 1);
  };

  const resetGame = () => {
    setItems([]);
    setKnowledge(0);
    setNextId(1);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="text-lg">
          Tri thức: {knowledge}/{targetKnowledge} 📖
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(itemEmojis) as LibraryItem[]).map((type) => (
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
        onClick={handleLibraryClick}
        className="relative h-96 bg-gradient-to-b from-amber-100 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-lg border-2 border-primary cursor-pointer overflow-hidden"
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
