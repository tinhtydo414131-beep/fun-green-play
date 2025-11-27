import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface CityCreatorProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

type BuildingType = 'house' | 'tree' | 'shop' | 'park' | 'school';

interface Building {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  emoji: string;
}

const buildingEmojis: Record<BuildingType, string> = {
  house: '🏠',
  tree: '🌳',
  shop: '🏪',
  park: '🎪',
  school: '🏫',
};

const CityCreator = ({ level, onLevelComplete, onBack }: CityCreatorProps) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedType, setSelectedType] = useState<BuildingType>('house');
  const [buildingsCount, setBuildingsCount] = useState(0);
  const targetBuildings = level * 4;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (buildingsCount >= targetBuildings) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [buildingsCount, targetBuildings, onLevelComplete]);

  const handleCityClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBuilding: Building = {
      id: nextId,
      type: selectedType,
      x,
      y,
      emoji: buildingEmojis[selectedType],
    };

    setBuildings([...buildings, newBuilding]);
    setNextId(nextId + 1);
    setBuildingsCount(buildingsCount + 1);
  };

  const resetGame = () => {
    setBuildings([]);
    setBuildingsCount(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">City Creator 🏙️</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Xây {targetBuildings} công trình!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Đã xây: {buildingsCount}/{targetBuildings} 🏗️
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.keys(buildingEmojis) as BuildingType[]).map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              onClick={() => setSelectedType(type)}
              className="text-2xl px-4 py-6"
            >
              {buildingEmojis[type]}
            </Button>
          ))}
        </div>

        <div
          className="relative w-full h-96 bg-gradient-to-b from-sky-200 to-green-300 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleCityClick}
        >
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-300 opacity-50"></div>
          {buildings.map((building) => (
            <div
              key={building.id}
              className="absolute text-4xl pointer-events-none animate-bounce"
              style={{
                left: `${building.x - 20}px`,
                top: `${building.y - 20}px`,
              }}
            >
              {building.emoji}
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

export default CityCreator;
