import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";
import { ArrowLeft } from "lucide-react";

export const MathQuiz = ({
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
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const baseTime = Math.max(20, Math.floor(30 / difficultyMultiplier));
  const [timeLeft, setTimeLeft] = useState(baseTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const targetScore = Math.floor(5 * difficultyMultiplier);
  const { playScore, playError, startBackgroundMusic, stopBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      stopBackgroundMusic();
      toast.success(`🎉 Game Over! Điểm: ${score}`);
    }
  }, [timeLeft, isPlaying, score]);

  useEffect(() => {
    if (isPlaying) {
      generateQuestion();
    }
  }, [isPlaying]);

  const generateQuestion = () => {
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    
    let correctAnswer = 0;
    if (op === '+') correctAnswer = n1 + n2;
    else if (op === '-') correctAnswer = n1 - n2;
    else correctAnswer = n1 * n2;
    
    setAnswer(correctAnswer);
    
    const opts = [correctAnswer];
    while (opts.length < 4) {
      const wrong = correctAnswer + Math.floor(Math.random() * 20) - 10;
      if (!opts.includes(wrong) && wrong > 0) opts.push(wrong);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  const checkAnswer = (selected: number) => {
    if (selected === answer) {
      setScore(score + 1);
      playScore();
      toast.success('Đúng rồi! +1 điểm! 🎉');
    } else {
      playError();
      toast.error('Sai rồi! Cố gắng lên! 😢');
    }
    generateQuestion();
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    startBackgroundMusic();
  };

  useEffect(() => {
    if (!isPlaying) stopBackgroundMusic();
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center gap-8 p-6 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          🔢 Toán Học Vui
        </h2>
        <div className="flex gap-8 justify-center">
          <p className="text-2xl font-comic text-primary">
            Điểm: {score} 🌟
          </p>
          <p className="text-2xl font-comic text-secondary">
            Thời gian: {timeLeft}s ⏱️
          </p>
        </div>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
      </div>

      {isPlaying ? (
        <>
          <Card className="p-16 border-4 border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-2xl">
            <div className="text-7xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {num1} {operator} {num2} = ?
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
            {options.map((opt, i) => (
              <Button
                key={i}
                onClick={() => checkAnswer(opt)}
                size="lg"
                className="text-4xl px-12 py-10 font-fredoka font-bold bg-gradient-to-br from-primary to-secondary hover:shadow-2xl transform hover:scale-110 transition-all"
              >
                {opt}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex gap-4">
          {onBack && (
            <Button 
              onClick={onBack}
              size="lg"
              variant="outline"
              className="text-2xl px-12 py-10 font-fredoka font-bold transform hover:scale-110 transition-all"
            >
              <ArrowLeft className="mr-2" />
              Quay lại
            </Button>
          )}
          <Button 
            onClick={startGame} 
            size="lg"
            className="text-2xl px-12 py-10 font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-110 transition-all"
          >
            {timeLeft === 30 ? 'Bắt Đầu 🎮' : 'Chơi Lại 🔄'}
          </Button>
        </div>
      )}
    </div>
  );
};
