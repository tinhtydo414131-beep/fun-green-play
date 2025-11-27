import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const SimonSays = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete,
  onBack
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-primary', 'bg-yellow-500'];
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const targetSequenceLength = Math.floor(3 + level);

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setUserSequence([]);
    setIsPlaying(true);
    setIsShowing(true);
  };

  useEffect(() => {
    if (isShowing && sequence.length > 0) {
      playSequence();
    }
  }, [sequence, isShowing]);

  const playSequence = async () => {
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(null);
    }
    setIsShowing(false);
  };

  const handleColorClick = (index: number) => {
    if (isShowing || !isPlaying) return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      toast.error(`Game Over! Chuỗi: ${sequence.length}`);
      setIsPlaying(false);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      toast.success('Đúng rồi! Tiếp tục!');
      setTimeout(() => {
        setSequence([...sequence, Math.floor(Math.random() * 4)]);
        setUserSequence([]);
        setIsShowing(true);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Độ dài chuỗi: {sequence.length}
        </h2>
        <p className="text-muted-foreground">
          {isShowing ? 'Ghi nhớ chuỗi...' : 'Lượt của bạn!'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {colors.map((color, index) => (
          <Card
            key={index}
            onClick={() => handleColorClick(index)}
            className={`w-32 h-32 ${color} cursor-pointer transition-all ${
              activeColor === index ? 'scale-110 brightness-150' : 'brightness-75'
            } ${!isShowing && isPlaying ? 'hover:brightness-100' : ''}`}
          />
        ))}
      </div>

      {!isPlaying && (
        <div className="flex gap-4">
          {onBack && (
            <Button 
              onClick={onBack}
              size="lg"
              variant="outline"
            >
              <ArrowLeft className="mr-2" />
              Quay lại
            </Button>
          )}
          <Button onClick={startGame} size="lg">
            {sequence.length === 0 ? 'Bắt đầu' : 'Chơi lại'}
          </Button>
        </div>
      )}
    </div>
  );
};
