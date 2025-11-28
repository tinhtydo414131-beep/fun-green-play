import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface EcoVillageProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

type EcoElement = 'solar' | 'wind' | 'garden' | 'recycle' | 'tree' | 'water' | 'bike';

interface Element {
  id: number;
  type: EcoElement;
  x: number;
  y: number;
  emoji: string;
}

const elementEmojis: Record<EcoElement, string> = {
  solar: '☀️',
  wind: '💨',
  garden: '🌱',
  recycle: '♻️',
  tree: '🌲',
  water: '💧',
  bike: '🚲',
};

const EcoVillage = ({ level, onLevelComplete, onBack }: EcoVillageProps) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedType, setSelectedType] = useState<EcoElement>('solar');
  const [ecoScore, setEcoScore] = useState(0);
  const targetEcoScore = level * 6;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (ecoScore >= targetEcoScore) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [ecoScore, targetEcoScore, onLevelComplete]);

  const handleVillageClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setEcoScore(ecoScore + 1);
  };

  const resetGame = () => {
    setElements([]);
    setEcoScore(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Eco Village 🌱</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Xây làng xanh thân thiện môi trường với {targetEcoScore} phần tử!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Điểm xanh: {ecoScore}/{targetEcoScore} ♻️
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.keys(elementEmojis) as EcoElement[]).map((type) => (
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
          className="relative w-full h-96 bg-gradient-to-b from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleVillageClick}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
            🌱
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

export default EcoVillage;
