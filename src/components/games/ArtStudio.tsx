import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ArtElement = "red" | "blue" | "yellow" | "green" | "circle" | "square" | "star" | "heart";

interface ArtStudioProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Element {
  id: number;
  type: ArtElement;
  x: number;
  y: number;
  emoji: string;
}

const elementEmojis: Record<ArtElement, string> = {
  red: "🔴",
  blue: "🔵",
  yellow: "🟡",
  green: "🟢",
  circle: "⭕",
  square: "🟦",
  star: "⭐",
  heart: "❤️",
};

export const ArtStudio = ({ level, onLevelComplete, onBack }: ArtStudioProps) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedType, setSelectedType] = useState<ArtElement>("red");
  const [creativity, setCreativity] = useState(0);
  const [nextId, setNextId] = useState(1);

  const targetCreativity = level * 15;

  useEffect(() => {
    if (creativity >= targetCreativity) {
      onLevelComplete();
    }
  }, [creativity, targetCreativity, onLevelComplete]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setCreativity(creativity + 1);
    setNextId(nextId + 1);
  };

  const resetGame = () => {
    setElements([]);
    setCreativity(0);
    setNextId(1);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="text-lg">
          Sáng tạo: {creativity}/{targetCreativity}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(elementEmojis) as ArtElement[]).map((type) => (
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
        onClick={handleCanvasClick}
        className="relative h-96 bg-background/50 rounded-lg border-2 border-dashed border-primary/30 cursor-crosshair overflow-hidden"
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
