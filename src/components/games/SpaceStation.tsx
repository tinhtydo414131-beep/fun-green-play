import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StationModule = "solar" | "lab" | "habitat" | "dock" | "antenna" | "satellite" | "rocket" | "astronaut";

interface SpaceStationProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Module {
  id: number;
  type: StationModule;
  x: number;
  y: number;
  emoji: string;
}

const moduleEmojis: Record<StationModule, string> = {
  solar: "☀️",
  lab: "🔬",
  habitat: "🏠",
  dock: "🛸",
  antenna: "📡",
  satellite: "🛰️",
  rocket: "🚀",
  astronaut: "👨‍🚀",
};

export const SpaceStation = ({ level, onLevelComplete, onBack }: SpaceStationProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedType, setSelectedType] = useState<StationModule>("solar");
  const [construction, setConstruction] = useState(0);
  const [nextId, setNextId] = useState(1);

  const targetConstruction = level * 14;

  useEffect(() => {
    if (construction >= targetConstruction) {
      onLevelComplete();
    }
  }, [construction, targetConstruction, onLevelComplete]);

  const handleSpaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newModule: Module = {
      id: nextId,
      type: selectedType,
      x,
      y,
      emoji: moduleEmojis[selectedType],
    };

    setModules([...modules, newModule]);
    setConstruction(construction + 1);
    setNextId(nextId + 1);
  };

  const resetGame = () => {
    setModules([]);
    setConstruction(0);
    setNextId(1);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Level {level}</h2>
        <div className="text-lg">
          Xây dựng: {construction}/{targetConstruction} 🛸
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(moduleEmojis) as StationModule[]).map((type) => (
          <Button
            key={type}
            onClick={() => setSelectedType(type)}
            variant={selectedType === type ? "default" : "outline"}
            className="text-2xl"
          >
            {moduleEmojis[type]}
          </Button>
        ))}
      </div>

      <div
        onClick={handleSpaceClick}
        className="relative h-96 bg-gradient-to-b from-indigo-900 to-purple-900 rounded-lg border-2 border-primary cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        {modules.map((module) => (
          <div
            key={module.id}
            className="absolute text-3xl transform -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in"
            style={{ left: `${module.x}%`, top: `${module.y}%` }}
          >
            {module.emoji}
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
