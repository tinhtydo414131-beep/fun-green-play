import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FarmElement = "wheat" | "corn" | "cow" | "chicken" | "pig" | "barn" | "tractor" | "tree";

interface FarmBuilderProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Element {
  id: number;
  type: FarmElement;
  x: number;
  y: number;
  emoji: string;
}

const elementEmojis: Record<FarmElement, string> = {
  wheat: "🌾",
  corn: "🌽",
  cow: "🐄",
  chicken: "🐔",
  pig: "🐷",
  barn: "🏚️",
  tractor: "🚜",
  tree: "🌳",
};

export const FarmBuilder = ({ level, onLevelComplete, onBack }: FarmBuilderProps) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedType, setSelectedType] = useState<FarmElement>("wheat");
  const [harvest, setHarvest] = useState(0);
  const [nextId, setNextId] = useState(1);

  const targetHarvest = level * 18;

  useEffect(() => {
    if (harvest >= targetHarvest) {
      onLevelComplete();
    }
  }, [harvest, targetHarvest, onLevelComplete]);

  const handleFarmClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newElement: Element = {
      id: nextId,
      type: selectedType,
      x,
      y,
      emoji: elementEmojis[selectedType],
    };

    setElements([...elements, newElement]);
    setHarvest(harvest + 1);
    setNextId(nextId + 1);
  };

  const resetGame = () => {
    setElements([]);
    setHarvest(0);
    setNextId(1);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="text-lg">
          Thu hoạch: {harvest}/{targetHarvest} 🌾
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(elementEmojis) as FarmElement[]).map((type) => (
          <Button
            key={type}
            onClick={() => setSelectedType(type)}
            variant={selectedType === type ? "default" : "outline"}
            className="text-2xl"
          >
            {elementEmojis[type]}
          </Button>
        ))}
      </div>

      <div
        onClick={handleFarmClick}
        className="relative h-96 bg-gradient-to-b from-green-200 to-amber-100 dark:from-green-900 dark:to-amber-900 rounded-lg border-2 border-primary cursor-pointer overflow-hidden"
      >
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute text-3xl transform -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in"
            style={{ left: `${element.x}%`, top: `${element.y}%` }}
          >
            {element.emoji}
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
