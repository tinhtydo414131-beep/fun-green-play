import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";

export const ColorMatch = () => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
  const colorNames = ['Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Tím', 'Hồng'];
  
  const [displayColor, setDisplayColor] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playScore, playError, startBackgroundMusic, stopBackgroundMusic } = useGameAudio();

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      toast.success(`Game Over! Điểm: ${score}`);
    }
  }, [timeLeft, isPlaying, score]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    startBackgroundMusic();
    generateQuestion();
  };

  useEffect(() => {
    if (!isPlaying) stopBackgroundMusic();
  }, [isPlaying]);

  const generateQuestion = () => {
    const colorIndex = Math.floor(Math.random() * colors.length);
    const textIndex = Math.floor(Math.random() * colorNames.length);
    setDisplayColor(colors[colorIndex]);
    setDisplayText(colorNames[textIndex]);
  };

  const handleAnswer = (isMatch: boolean) => {
    if (!isPlaying) return;
    
    const actualMatch = colors.indexOf(displayColor) === colorNames.indexOf(displayText);
    if (isMatch === actualMatch) {
      setScore(score + 1);
      playScore();
      toast.success('+1 điểm!');
    } else {
      playError();
      toast.error('Sai rồi!');
    }
    generateQuestion();
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Điểm: {score} | Thời gian: {timeLeft}s
        </h2>
        <p className="text-muted-foreground">
          Màu chữ và nội dung có khớp không?
        </p>
      </div>

      {isPlaying && (
        <Card className="p-12 border-4 border-primary">
          <div className={`text-6xl font-bold ${displayColor}`}>
            {displayText}
          </div>
        </Card>
      )}

      <div className="flex gap-4">
        {isPlaying ? (
          <>
            <Button onClick={() => handleAnswer(true)} size="lg" className="bg-primary">
              ✓ Khớp
            </Button>
            <Button onClick={() => handleAnswer(false)} size="lg" variant="destructive">
              ✗ Không khớp
            </Button>
          </>
        ) : (
          <Button onClick={startGame} size="lg">
            {timeLeft === 30 ? 'Bắt đầu' : 'Chơi lại'}
          </Button>
        )}
      </div>
    </div>
  );
};
