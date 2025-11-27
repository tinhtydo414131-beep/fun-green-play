import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const TriviaQuiz = ({
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
  const questions = [
    { q: 'Thủ đô của Việt Nam?', a: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Huế'], c: 0 },
    { q: 'Núi cao nhất thế giới?', a: ['Everest', 'K2', 'Kilimanjaro', 'Phú Sĩ'], c: 0 },
    { q: '2 + 2 = ?', a: ['3', '4', '5', '6'], c: 1 },
    { q: 'Màu của lá cây?', a: ['Đỏ', 'Xanh', 'Vàng', 'Tím'], c: 1 },
    { q: 'Con vật nào bay được?', a: ['Chó', 'Mèo', 'Chim', 'Cá'], c: 2 }
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const targetScore = Math.floor(3 * difficultyMultiplier);

  const handleAnswer = (index: number) => {
    if (index === questions[currentQ].c) {
      setScore(score + 1);
      toast.success('Đúng rồi!');
    } else {
      toast.error('Sai rồi!');
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetGame = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Câu {currentQ + 1}/{questions.length}
        </h2>
        <p className="text-lg text-muted-foreground">Điểm: {score}</p>
      </div>

      {!showResult ? (
        <Card className="w-full p-8 space-y-6">
          <h3 className="text-2xl font-bold text-center text-foreground">
            {questions[currentQ].q}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {questions[currentQ].a.map((answer, i) => (
              <Button
                key={i}
                onClick={() => handleAnswer(i)}
                size="lg"
                variant="outline"
                className="text-lg py-6"
              >
                {answer}
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="w-full p-8 space-y-6 text-center">
          <h3 className="text-3xl font-bold text-foreground">
            Hoàn thành!
          </h3>
          <p className="text-2xl text-primary">
            Điểm: {score}/{questions.length}
          </p>
          <div className="flex gap-4 justify-center">
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
            <Button onClick={resetGame} size="lg">
              Chơi lại
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
