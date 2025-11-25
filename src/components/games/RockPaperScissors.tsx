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
      setResult('Bạn thắng! 🎉');
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      toast.success('Bạn thắng!');
    } else if (winner === 'computer') {
      setResult('Máy thắng! 😢');
      setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      toast.error('Máy thắng!');
    } else {
      setResult('Hòa! 🤝');
      toast.info('Hòa!');
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult("");
    setScore({ player: 0, computer: 0 });
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Kéo Búa Bao
        </h2>
        <div className="flex gap-8 justify-center text-lg">
          <div>Bạn: <span className="font-bold text-primary">{score.player}</span></div>
          <div>Máy: <span className="font-bold text-destructive">{score.computer}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full">
        <Card className="p-8 text-center space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Bạn chọn</h3>
          <div className="text-6xl">
            {playerChoice && choices.find(c => c.value === playerChoice)?.emoji}
          </div>
        </Card>

        <Card className="p-8 text-center space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Máy chọn</h3>
          <div className="text-6xl">
            {computerChoice && choices.find(c => c.value === computerChoice)?.emoji}
          </div>
        </Card>
      </div>

      {result && (
        <div className="text-2xl font-bold text-center text-foreground animate-scale-in">
          {result}
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {choices.map((choice) => (
          <Button
            key={choice.value}
            onClick={() => play(choice.value)}
            size="lg"
            className="text-2xl px-8 py-6"
          >
            {choice.emoji} {choice.label}
          </Button>
        ))}
      </div>

      <Button onClick={resetGame} variant="outline">
        Đặt lại điểm
      </Button>
    </div>
  );
};
