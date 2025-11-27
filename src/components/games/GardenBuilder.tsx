import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface GardenBuilderProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

type PlantType = 'flower' | 'tree' | 'bush' | 'butterfly' | 'bee';

interface Plant {
  id: number;
  type: PlantType;
  x: number;
  y: number;
  emoji: string;
}

const plantEmojis: Record<PlantType, string> = {
  flower: '🌸',
  tree: '🌳',
  bush: '🌿',
  butterfly: '🦋',
  bee: '🐝',
};

const GardenBuilder = ({ level, onLevelComplete, onBack }: GardenBuilderProps) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedType, setSelectedType] = useState<PlantType>('flower');
  const [plantCount, setPlantCount] = useState(0);
  const targetPlants = level * 4;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (plantCount >= targetPlants) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [plantCount, targetPlants, onLevelComplete]);

  const handleGardenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPlant: Plant = {
      id: nextId,
      type: selectedType,
      x,
      y,
      emoji: plantEmojis[selectedType],
    };

    setPlants([...plants, newPlant]);
    setNextId(nextId + 1);
    setPlantCount(plantCount + 1);
  };

  const resetGame = () => {
    setPlants([]);
    setPlantCount(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Garden Builder 🌻</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Tạo {targetPlants} thứ trong vườn!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Tiến độ: {plantCount}/{targetPlants} 🌺
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.keys(plantEmojis) as PlantType[]).map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              onClick={() => setSelectedType(type)}
              className="text-2xl px-4 py-6"
            >
              {plantEmojis[type]}
            </Button>
          ))}
        </div>

        <div
          className="relative w-full h-96 bg-gradient-to-b from-green-100 to-green-300 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleGardenClick}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
            🏡
          </div>
          {plants.map((plant) => (
            <div
              key={plant.id}
              className="absolute text-4xl pointer-events-none animate-bounce"
              style={{
                left: `${plant.x - 20}px`,
                top: `${plant.y - 20}px`,
              }}
            >
              {plant.emoji}
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

export default GardenBuilder;
