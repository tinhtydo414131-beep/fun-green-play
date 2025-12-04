import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Choice = "rock" | "paper" | "scissors";

const choices: { name: Choice; emoji: string; beats: Choice }[] = [
  { name: "rock", emoji: "🪨", beats: "scissors" },
  { name: "paper", emoji: "📄", beats: "rock" },
  { name: "scissors", emoji: "✂️", beats: "paper" }
];

export const RockPaperScissors = ({
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
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string>("");
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const targetScore = Math.max(3, level + 2);

  const play = (choice: Choice) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setPlayerChoice(choice);
    setResult("🤔");
    setComputerChoice(null);

    setTimeout(() => {
      const computerPick = choices[Math.floor(Math.random() * 3)].name;
      setComputerChoice(computerPick);

      const playerData = choices.find(c => c.name === choice)!;
      const computerData = choices.find(c => c.name === computerPick)!;

      let newResult: string;
      let newScore = { ...score };

      if (choice === computerPick) {
        newResult = "Hòa! 🤝";
      } else if (playerData.beats === computerPick) {
        newResult = "Bạn thắng! 🎉";
        newScore.player += 1;
        toast.success("Tuyệt vời!");
      } else {
        newResult = "Máy thắng! 🤖";
        newScore.computer += 1;
      }

      setScore(newScore);
      setResult(newResult);
      setIsAnimating(false);

      if (newScore.player >= targetScore && onLevelComplete) {
        toast.success("Hoàn thành level! 🏆");
        setTimeout(() => onLevelComplete(), 1000);
      }
    }, 1000);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult("");
    setScore({ player: 0, computer: 0 });
  };

  const getEmoji = (choice: Choice | null) => {
    if (!choice) return "❓";
    return choices.find(c => c.name === choice)?.emoji || "❓";
  };

  return (
    <div className="flex flex-col items-center gap-3 md:gap-6 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Bạn {score.player} - {score.computer} Máy
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">Thắng {targetScore} để qua!</p>
      </div>

      <div className="flex gap-4 md:gap-8 items-center">
        <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Bạn</p>
          <motion.div
            key={playerChoice}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-5xl md:text-6xl"
          >
            {getEmoji(playerChoice)}
          </motion.div>
        </Card>

        <div className="text-2xl md:text-4xl font-bold text-primary">VS</div>

        <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Máy</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={computerChoice || "waiting"}
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="text-5xl md:text-6xl"
            >
              {isAnimating ? "🔄" : getEmoji(computerChoice)}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-bold text-foreground"
        >
          {result}
        </motion.div>
      )}

      <div className="flex gap-3 md:gap-4 flex-wrap justify-center">
        {choices.map(({ name, emoji }) => (
          <Button
            key={name}
            onClick={() => play(name)}
            onTouchStart={(e) => { e.preventDefault(); play(name); }}
            disabled={isAnimating}
            size="lg"
            className="text-4xl md:text-5xl p-5 md:p-8 h-auto touch-manipulation will-change-transform active:scale-95 transition-transform"
            variant="outline"
          >
            {emoji}
          </Button>
        ))}
      </div>

      <div className="flex gap-3">
        {onBack && (
          <Button onClick={onBack} size="lg" variant="outline" className="touch-manipulation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button onClick={resetGame} size="lg" className="touch-manipulation">
          Chơi lại
        </Button>
      </div>
    </div>
  );
};
