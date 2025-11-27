import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface DreamWorldProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

type ElementType = 'castle' | 'unicorn' | 'rainbow' | 'cloud' | 'star';

interface Element {
  id: number;
  type: ElementType;
  x: number;
  y: number;
  emoji: string;
}

const elementEmojis: Record<ElementType, string> = {
  castle: '🏰',
  unicorn: '🦄',
  rainbow: '🌈',
  cloud: '☁️',
  star: '⭐',
};

const DreamWorld = ({ level, onLevelComplete, onBack }: DreamWorldProps) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedType, setSelectedType] = useState<ElementType>('castle');
  const [elementCount, setElementCount] = useState(0);
  const targetElements = level * 4;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (elementCount >= targetElements) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [elementCount, targetElements, onLevelComplete]);

  const handleWorldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: Element = {
      id: nextId,
      type: selectedType,
      x,
      y,
      emoji: elementEmojis[selectedType],
    };

    setElements([...elements, newElement]);
    setNextId(nextId + 1);
    setElementCount(elementCount + 1);
  };

  const resetGame = () => {
    setElements([]);
    setElementCount(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Dream World 🌟</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Tạo {targetElements} phần tử kỳ diệu!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Đã tạo: {elementCount}/{targetElements} ✨
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.keys(elementEmojis) as ElementType[]).map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              onClick={() => setSelectedType(type)}
              className="text-2xl px-4 py-6"
            >
              {elementEmojis[type]}
            </Button>
          ))}
        </div>

        <div
          className="relative w-full h-96 bg-gradient-to-b from-pink-200 via-purple-200 to-blue-200 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleWorldClick}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
          {elements.map((element) => (
            <div
              key={element.id}
              className="absolute text-4xl pointer-events-none animate-pulse"
              style={{
                left: `${element.x - 20}px`,
                top: `${element.y - 20}px`,
              }}
            >
              {element.emoji}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="font-fredoka font-bold px-8 py-6 text-lg"
            >
              <ArrowLeft className="mr-2" />
              Quay lại
            </Button>
          )}
          <Button
            onClick={resetGame}
            variant="outline"
            className="font-fredoka font-bold px-8 py-6 text-lg"
          >
            🔄 Làm mới
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DreamWorld;
