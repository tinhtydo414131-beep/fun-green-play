import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const GuessNumber = () => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setAttempts(0);
    setFeedback("Đoán một số từ 1 đến 100!");
    setGameWon(false);
  };

  const handleGuess = () => {
    const guessNumber = parseInt(guess);
    
    if (isNaN(guessNumber) || guessNumber < 1 || guessNumber > 100) {
      toast.error("Vui lòng nhập số từ 1 đến 100!");
      return;
    }

    setAttempts(attempts + 1);

    if (guessNumber === targetNumber) {
      setFeedback(`🎉 Chính xác! Bạn đã đoán đúng trong ${attempts + 1} lần!`);
      setGameWon(true);
      toast.success(`Chúc mừng! Đúng trong ${attempts + 1} lần thử!`);
    } else if (guessNumber < targetNumber) {
      setFeedback("📈 Số cần tìm lớn hơn!");
    } else {
      setFeedback("📉 Số cần tìm nhỏ hơn!");
    }

    setGuess("");
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Đoán Số Bí Mật
        </h2>
        <p className="text-muted-foreground">
          Số lần đoán: {attempts}
        </p>
      </div>

      <Card className="w-full p-8 space-y-6">
        <div className="text-center text-lg font-medium text-foreground min-h-[60px] flex items-center justify-center">
          {feedback}
        </div>

        {!gameWon && (
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Nhập số của bạn..."
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
              className="text-center text-xl"
              min="1"
              max="100"
            />
            <Button onClick={handleGuess} className="w-full" size="lg">
              Đoán
            </Button>
          </div>
        )}

        {gameWon && (
          <Button onClick={resetGame} className="w-full" size="lg">
            Chơi lại
          </Button>
        )}
      </Card>
    </div>
  );
};
