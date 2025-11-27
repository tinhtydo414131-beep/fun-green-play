import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface PetParadiseProps {
  level: number;
  onLevelComplete: () => void;
  onBack?: () => void;
}

interface Pet {
  id: number;
  x: number;
  y: number;
  happy: boolean;
  emoji: string;
}

const petEmojis = ['🐶', '🐱', '🐰', '🐹', '🐻', '🦊', '🐼'];

const PetParadise = ({ level, onLevelComplete, onBack }: PetParadiseProps) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [happyCount, setHappyCount] = useState(0);
  const targetPets = level * 3;
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (happyCount >= targetPets) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [happyCount, targetPets, onLevelComplete]);

  const handleParkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPet: Pet = {
      id: nextId,
      x,
      y,
      happy: false,
      emoji: petEmojis[Math.floor(Math.random() * petEmojis.length)],
    };

    setPets([...pets, newPet]);
    setNextId(nextId + 1);

    // Make pet happy after a short delay
    setTimeout(() => {
      setPets(prev => 
        prev.map(p => p.id === newPet.id ? { ...p, happy: true } : p)
      );
      setHappyCount(prev => prev + 1);
    }, 300);
  };

  const resetGame = () => {
    setPets([]);
    setHappyCount(0);
    setNextId(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Pet Paradise 🐾</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Làm vui {targetPets} thú cưng!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Vui vẻ: {happyCount}/{targetPets} 🎉
          </div>
        </div>

        <div
          className="relative w-full h-96 bg-gradient-to-b from-green-200 to-yellow-100 rounded-xl border-4 border-primary/30 cursor-pointer overflow-hidden"
          onClick={handleParkClick}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
            🏞️
          </div>
          {pets.map((pet) => (
            <div
              key={pet.id}
              className={`absolute pointer-events-none transition-all duration-300 ${
                pet.happy ? 'text-5xl' : 'text-3xl'
              }`}
              style={{
                left: `${pet.x - 20}px`,
                top: `${pet.y - 20}px`,
                opacity: pet.happy ? 1 : 0.5,
              }}
            >
              {pet.emoji}
              {pet.happy && <span className="text-2xl">💕</span>}
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

export default PetParadise;
