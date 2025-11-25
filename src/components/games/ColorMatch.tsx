import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";

export const ColorMatch = () => {
  const colors = [
    { bg: 'bg-red-500', text: 'text-red-500', name: 'Đỏ' },
    { bg: 'bg-blue-500', text: 'text-blue-500', name: 'Xanh dương' },
    { bg: 'bg-green-500', text: 'text-green-500', name: 'Xanh lá' },
    { bg: 'bg-yellow-500', text: 'text-yellow-500', name: 'Vàng' },
    { bg: 'bg-purple-500', text: 'text-purple-500', name: 'Tím' },
    { bg: 'bg-pink-500', text: 'text-pink-500', name: 'Hồng' },
  ];
  
  const [displayColorIndex, setDisplayColorIndex] = useState(0);
  const [displayTextIndex, setDisplayTextIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playScore, playError, startBackgroundMusic, stopBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      stopBackgroundMusic();
      toast.success(`🎉 Game Over! Điểm của bạn: ${score}`);
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
    const textIndex = Math.floor(Math.random() * colors.length);
    setDisplayColorIndex(colorIndex);
    setDisplayTextIndex(textIndex);
  };

  const handleAnswer = (isMatch: boolean) => {
    if (!isPlaying) return;
    
    const actualMatch = displayColorIndex === displayTextIndex;
    if (isMatch === actualMatch) {
      setScore(score + 1);
      playScore();
      toast.success('Đúng rồi! +1 điểm! 🎉');
    } else {
      playError();
      toast.error('Sai rồi! 😢');
    }
    generateQuestion();
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          🎨 Đố Màu Sắc
        </h2>
        <div className="flex gap-8 justify-center">
          <p className="text-2xl font-comic text-primary">
            Điểm: {score} 🌟
          </p>
          <p className="text-2xl font-comic text-secondary">
            Thời gian: {timeLeft}s ⏱️
          </p>
        </div>
        <p className="text-xl font-comic text-muted-foreground">
          Màu chữ và nội dung có khớp không? 🤔
        </p>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
      </div>

      {isPlaying && (
        <Card className="p-16 border-4 border-primary/30 bg-gradient-to-br from-background to-primary/10 shadow-2xl">
          <div className={`text-7xl font-fredoka font-bold ${colors[displayColorIndex].text}`}>
            {colors[displayTextIndex].name}
          </div>
        </Card>
      )}

      <div className="flex gap-6">
        {isPlaying ? (
          <>
            <Button 
              onClick={() => handleAnswer(true)} 
              size="lg" 
              className="text-2xl px-12 py-8 font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-2xl transform hover:scale-110 transition-all"
            >
              ✓ Khớp Nhau
            </Button>
            <Button 
              onClick={() => handleAnswer(false)} 
              size="lg" 
              variant="outline"
              className="text-2xl px-12 py-8 font-fredoka font-bold border-4 border-destructive hover:bg-destructive/10"
            >
              ✗ Không Khớp
            </Button>
          </>
        ) : (
          <Button 
            onClick={startGame} 
            size="lg"
            className="text-2xl px-12 py-8 font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-110 transition-all"
          >
            {timeLeft === 30 ? 'Bắt Đầu 🎮' : 'Chơi Lại 🔄'}
          </Button>
        )}
      </div>
    </div>
  );
};
