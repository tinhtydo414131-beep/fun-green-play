import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";
import { ArrowLeft } from "lucide-react";

export const WordScramble = ({
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
  const words = [
    { word: 'GAME', hint: 'Trò chơi' },
    { word: 'PLAY', hint: 'Chơi' },
    { word: 'CODE', hint: 'Mã code' },
    { word: 'FUN', hint: 'Vui vẻ' },
    { word: 'WIN', hint: 'Thắng' },
    { word: 'CRYPTO', hint: 'Tiền mã hóa' },
    { word: 'BLOCKCHAIN', hint: 'Chuỗi khối' }
  ];

  const [currentWord, setCurrentWord] = useState(words[0]);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const { playSuccess, playError, startBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  useEffect(() => {
    scrambleWord();
    startBackgroundMusic();
  }, [currentWord]);

  const scrambleWord = () => {
    const arr = currentWord.word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setScrambled(arr.join(''));
  };

  const checkAnswer = () => {
    if (guess.toUpperCase() === currentWord.word) {
      setScore(score + 1);
      playSuccess();
      toast.success('Chính xác!');
      const nextIndex = (words.indexOf(currentWord) + 1) % words.length;
      setCurrentWord(words[nextIndex]);
      setGuess('');
    } else {
      playError();
      toast.error('Sai rồi! Thử lại!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Điểm: {score}</h2>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
      </div>

      <Card className="w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Gợi ý: {currentWord.hint}</p>
          <div className="text-4xl font-bold text-primary tracking-widest">
            {scrambled}
          </div>
        </div>

        <div className="space-y-4">
          <Input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            placeholder="Nhập từ đúng..."
            className="text-center text-xl"
          />
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
            <Button onClick={checkAnswer} className="flex-1" size="lg">
              Kiểm tra
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
