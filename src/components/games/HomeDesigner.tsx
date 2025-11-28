import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface HomeDesignerProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

type HomeElement = 'house' | 'sofa' | 'bed' | 'lamp' | 'plant' | 'picture' | 'family';

interface Element {
  id: number;
  type: HomeElement;
  x: number;
  y: number;
  emoji: string;
}

const elementEmojis: Record<HomeElement, string> = {
  house: '🏠',
  sofa: '🛋️',
  bed: '🛏️',
  lamp: '💡',
  plant: '🪴',
  picture: '🖼️',
  family: '👨‍👩‍👧‍👦',
};

const HomeDesigner = ({ level, onLevelComplete, onBack }: HomeDesignerProps) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedType, setSelectedType] = useState<HomeElement>('house');
  const [coziness, setCoziness] = useState(0);
  const targetCoziness = level * 6;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (coziness >= targetCoziness) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [coziness, targetCoziness, onLevelComplete]);

  const handleHomeClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setCoziness(coziness + 1);
  };

  const resetGame = () => {
    setElements([]);
    setCoziness(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Home Designer 🏠</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Thiết kế ngôi nhà ấm cúng với {targetCoziness} phần tử!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Ấm cúng: {coziness}/{targetCoziness} 🏡
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.keys(elementEmojis) as HomeElement[]).map((type) => (
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
          className="relative w-full h-96 bg-gradient-to-b from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleHomeClick}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
            🏠
          </div>
          {elements.map((element) => (
            <div
              key={element.id}
              className="absolute text-4xl pointer-events-none animate-bounce"
              style={{
                left: `${element.x - 20}px`,
                top: `${element.y - 20}px`,
                animationDelay: `${Math.random() * 0.5}s`,
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

export default HomeDesigner;
