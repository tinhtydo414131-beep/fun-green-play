import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";
import { ArrowLeft } from "lucide-react";

export const GuessNumber = ({
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
  const maxNumber = Math.floor(50 * difficultyMultiplier);
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [gameWon, setGameWon] = useState(false);
  const maxAttempts = Math.max(5, Math.floor(10 / difficultyMultiplier));
  const { playClick, playSuccess, playError, startBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  useEffect(() => {
    resetGame();
    startBackgroundMusic();
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
      playSuccess();
      toast.success(`Chúc mừng! Đúng trong ${attempts + 1} lần thử!`);
    } else if (guessNumber < targetNumber) {
      setFeedback("📈 Số cần tìm lớn hơn!");
      playClick();
    } else {
      setFeedback("📉 Số cần tìm nhỏ hơn!");
      playClick();
    }

    setGuess("");
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Đoán Số Bí Mật
        </h2>
        <p className="text-muted-foreground">
          Số lần đoán: {attempts}
        </p>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
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
          <div className="flex gap-4">
            {onBack && (
              <Button 
                onClick={onBack}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <ArrowLeft className="mr-2" />
                Quay lại
              </Button>
            )}
            <Button onClick={resetGame} className="flex-1" size="lg">
              Chơi lại
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
