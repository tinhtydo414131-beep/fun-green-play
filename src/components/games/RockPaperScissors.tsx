import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Choice = 'rock' | 'paper' | 'scissors';

export const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string>("");
  const [score, setScore] = useState({ player: 0, computer: 0 });

  const choices: { value: Choice; emoji: string; label: string }[] = [
    { value: 'rock', emoji: '✊', label: 'Búa' },
    { value: 'paper', emoji: '✋', label: 'Bao' },
    { value: 'scissors', emoji: '✌️', label: 'Kéo' },
  ];

  const getRandomChoice = (): Choice => {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
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
    const computer = getRandomChoice();
    setPlayerChoice(choice);
    setComputerChoice(computer);

    const winner = determineWinner(choice, computer);
    
    if (winner === 'player') {
      setResult('🎉 Bạn Thắng Rồi!');
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      toast.success('Bạn thắng! 🎊');
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
            <p className="font-bold text-primary text-3xl">{score.player} 🌟</p>
          </div>
          <div className="text-4xl text-muted-foreground">VS</div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Máy</p>
            <p className="font-bold text-secondary text-3xl">{score.computer} 🤖</p>
          </div>
        </div>
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
