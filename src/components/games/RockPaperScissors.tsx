import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Choice = 'rock' | 'paper' | 'scissors';

export const RockPaperScissors = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string>("");
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [playerHistory, setPlayerHistory] = useState<Choice[]>([]);
  const targetWins = Math.max(1, Math.floor(2 * difficultyMultiplier));

  const choices: { value: Choice; emoji: string; label: string }[] = [
    { value: 'rock', emoji: '✊', label: 'Búa' },
    { value: 'paper', emoji: '✋', label: 'Bao' },
    { value: 'scissors', emoji: '✌️', label: 'Kéo' },
  ];

  const getSmartChoice = (history: Choice[]): Choice => {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    const counterMap: Record<Choice, Choice> = {
      rock: 'paper',
      paper: 'scissors',
      scissors: 'rock'
    };

    // At higher difficulties, analyze player patterns
    if (history.length >= 3 && Math.random() < difficultyMultiplier / 2) {
      // Count frequency of each choice
      const counts = { rock: 0, paper: 0, scissors: 0 };
      history.slice(-5).forEach(choice => counts[choice]++);
      
      // Predict player's most frequent choice
      const predicted = Object.entries(counts).reduce((a, b) => 
        counts[a[0] as Choice] > counts[b[0] as Choice] ? a : b
      )[0] as Choice;
      
      // Counter that choice
      return counterMap[predicted];
    }

    // Random choice at lower difficulties
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const determineWinner = (player: Choice, computer: Choice) => {
    if (player === computer) return 'draw';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'player';
    }
    return 'computer';
  };

  const play = (choice: Choice) => {
    const newHistory = [...playerHistory, choice];
    setPlayerHistory(newHistory);
    
    const computer = getSmartChoice(newHistory);
    setPlayerChoice(choice);
    setComputerChoice(computer);

    const winner = determineWinner(choice, computer);
    
    if (winner === 'player') {
      setResult('🎉 Bạn Thắng Rồi!');
      const newPlayerScore = score.player + 1;
      setScore(prev => ({ ...prev, player: newPlayerScore }));
      toast.success(`Bạn thắng! 🎊 (${newPlayerScore}/${targetWins})`);
      if (newPlayerScore >= targetWins && onLevelComplete) {
        setTimeout(() => onLevelComplete(), 1000);
      }
    } else if (winner === 'computer') {
      setResult('😢 Máy Thắng!');
      setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      toast.error('Máy thắng!');
    } else {
      setResult('🤝 Hòa Nhau!');
      toast.info('Hòa rồi!');
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult("");
    setScore({ player: 0, computer: 0 });
    setPlayerHistory([]);
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto p-6 animate-fade-in">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          ✊ Kéo Búa Bao ✋
        </h2>
        <div className="flex gap-12 justify-center text-2xl font-comic">
          <div className="space-y-1">
            <p className="text-muted-foreground">Bạn</p>
            <p className="font-bold text-primary text-3xl">{score.player}/{targetWins} 🌟</p>
          </div>
          <div className="text-4xl text-muted-foreground">VS</div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Máy</p>
            <p className="font-bold text-secondary text-3xl">{score.computer} 🤖</p>
          </div>
        </div>
        {difficultyMultiplier > 1.5 && (
          <p className="text-sm text-muted-foreground">⚠️ Máy đang phân tích lối chơi của bạn!</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 w-full">
        <Card className="p-10 text-center space-y-4 border-4 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent shadow-xl">
          <h3 className="text-xl font-fredoka font-bold text-primary">Bạn Chọn</h3>
          <div className="text-8xl animate-bounce">
            {playerChoice && choices.find(c => c.value === playerChoice)?.emoji}
          </div>
        </Card>

        <Card className="p-10 text-center space-y-4 border-4 border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent shadow-xl">
          <h3 className="text-xl font-fredoka font-bold text-secondary">Máy Chọn</h3>
          <div className="text-8xl animate-bounce" style={{ animationDelay: '0.1s' }}>
            {computerChoice && choices.find(c => c.value === computerChoice)?.emoji}
          </div>
        </Card>
      </div>

      {result && (
        <div className="text-3xl font-fredoka font-bold text-center animate-scale-in bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          {result}
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {choices.map((choice) => (
          <Button
            key={choice.value}
            onClick={() => play(choice.value)}
            size="lg"
            className="text-3xl px-10 py-8 font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-2xl transform hover:scale-110 transition-all"
          >
            {choice.emoji} {choice.label}
          </Button>
        ))}
      </div>

      <Button 
        onClick={resetGame} 
        variant="outline"
        className="font-fredoka font-bold border-4 border-primary/30 hover:border-primary px-10 py-6"
      >
        Đặt Lại Điểm 🔄
      </Button>
    </div>
  );
};
