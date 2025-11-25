import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";

export const WhackAMole = () => {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playPop, playScore, startBackgroundMusic, stopBackgroundMusic } = useGameAudio();

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      toast.success(`Game Over! Điểm: ${score}`);
    }
  }, [timeLeft, isPlaying, score]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      const newMoles = Array(9).fill(false);
      const randomIndex = Math.floor(Math.random() * 9);
      newMoles[randomIndex] = true;
      setMoles(newMoles);
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    startBackgroundMusic();
  };

  useEffect(() => {
    if (!isPlaying) stopBackgroundMusic();
  }, [isPlaying]);

  const whackMole = (index: number) => {
    if (!isPlaying || !moles[index]) return;
    
    setScore(score + 1);
    playPop();
    playScore();
    const newMoles = [...moles];
    newMoles[index] = false;
    setMoles(newMoles);
    toast.success('+1 điểm!');
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Điểm: {score} | Thời gian: {timeLeft}s
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {moles.map((isMoleUp, index) => (
          <Card
            key={index}
            onClick={() => whackMole(index)}
            className={`w-24 h-24 flex items-center justify-center text-4xl cursor-pointer transition-all ${
              isMoleUp ? 'bg-primary scale-110' : 'bg-muted'
            }`}
          >
            {isMoleUp ? '🐹' : '🕳️'}
          </Card>
        ))}
      </div>

      <Button onClick={startGame} size="lg">
        {isPlaying ? 'Chơi lại' : 'Bắt đầu'}
      </Button>
    </div>
  );
};
