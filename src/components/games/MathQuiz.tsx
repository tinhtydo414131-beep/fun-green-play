import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const MathQuiz = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

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
    if (isPlaying) {
      generateQuestion();
    }
  }, [isPlaying]);

  const generateQuestion = () => {
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '*'];
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
      toast.success('+1 điểm!');
    } else {
      toast.error('Sai rồi!');
    }
    generateQuestion();
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Điểm: {score} | Thời gian: {timeLeft}s
        </h2>
      </div>

      {isPlaying ? (
        <>
          <Card className="p-12 border-4 border-primary">
            <div className="text-6xl font-bold text-foreground">
              {num1} {operator} {num2} = ?
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, i) => (
              <Button
                key={i}
                onClick={() => checkAnswer(opt)}
                size="lg"
                className="text-2xl px-12 py-8"
              >
                {opt}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <Button onClick={startGame} size="lg">
          {timeLeft === 30 ? 'Bắt đầu' : 'Chơi lại'}
        </Button>
      )}
    </div>
  );
};
