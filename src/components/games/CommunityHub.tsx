import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface CommunityHubProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

type CommunityElement = 'shop' | 'cafe' | 'library' | 'center' | 'plaza' | 'market' | 'people';

interface Element {
  id: number;
  type: CommunityElement;
  x: number;
  y: number;
  emoji: string;
}

const elementEmojis: Record<CommunityElement, string> = {
  shop: '🏪',
  cafe: '☕',
  library: '📚',
  center: '🏛️',
  plaza: '🏞️',
  market: '🏬',
  people: '👥',
};

const CommunityHub = ({ level, onLevelComplete, onBack }: CommunityHubProps) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedType, setSelectedType] = useState<CommunityElement>('shop');
  const [community, setCommunity] = useState(0);
  const targetCommunity = level * 6;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (community >= targetCommunity) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [community, targetCommunity, onLevelComplete]);

  const handleCommunityClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setCommunity(community + 1);
  };

  const resetGame = () => {
    setElements([]);
    setCommunity(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Community Hub 🏛️</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Xây dựng trung tâm cộng đồng với {targetCommunity} phần tử!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Cộng đồng: {community}/{targetCommunity} 👥
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.keys(elementEmojis) as CommunityElement[]).map((type) => (
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
          className="relative w-full h-96 bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleCommunityClick}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
            🏛️
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

export default CommunityHub;
