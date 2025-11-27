import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Lock, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelSelectorProps {
  highestLevelCompleted: number;
  currentLevel: number;
  onLevelSelect: (level: number) => void;
  onStartGame: () => void;
  getCoinReward: (level: number) => number;
}

export const LevelSelector = ({
  highestLevelCompleted,
  currentLevel,
  onLevelSelect,
  onStartGame,
  getCoinReward,
}: LevelSelectorProps) => {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  const isLevelUnlocked = (level: number): boolean => {
    if (level === 1) return true;
    return highestLevelCompleted >= level - 1;
  };

  return (
    <Card className="p-4 sm:p-8 border-3 sm:border-4 border-primary/30 bg-gradient-to-br from-card via-primary/5 to-secondary/5">
      <div className="text-center mb-6 sm:mb-8 space-y-2">
        <h2 className="text-2xl sm:text-4xl font-fredoka font-bold text-primary">
          Chọn Level 🎮
        </h2>
        <p className="text-base sm:text-lg font-comic text-muted-foreground">
          Hoàn thành level để mở level tiếp theo!
        </p>
      </div>

      {/* Mobile: 3 columns, Tablet+: 5 columns */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 sm:gap-4 mb-6 sm:mb-8">
        {levels.map((level) => {
          const unlocked = isLevelUnlocked(level);
          const completed = level <= highestLevelCompleted;
          const selected = level === currentLevel;
          const coinReward = getCoinReward(level);

          return (
            <button
              key={level}
              onClick={() => unlocked && onLevelSelect(level)}
              disabled={!unlocked}
              className={cn(
                "relative p-5 sm:p-6 rounded-[24px] border-3 sm:border-4 transition-all group min-h-[100px] sm:min-h-0",
                selected && unlocked && "border-primary bg-gradient-to-br from-primary to-secondary shadow-[0_0_20px_rgba(139,70,255,0.3)] scale-105 ring-4 ring-primary/30",
                !selected && unlocked && "border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105",
                !unlocked && "border-muted bg-muted/20 cursor-not-allowed opacity-50"
              )}
            >
              {/* Level number */}
              <div className={cn(
                "text-5xl sm:text-4xl font-fredoka font-bold mb-2",
                selected && unlocked ? "text-white" : unlocked ? "text-primary" : "text-muted-foreground"
              )}>
                {level}
              </div>

              {/* Status icon */}
              <div className="flex justify-center mb-2">
                {!unlocked && <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />}
                {completed && unlocked && !selected && <Star className="w-5 h-5 sm:w-6 sm:h-6 text-accent fill-accent" />}
                {unlocked && !completed && !selected && <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />}
              </div>

              {/* Coin reward - Bigger on mobile when selected */}
              {unlocked && (
                <div className={cn(
                  "text-sm sm:text-sm font-comic font-bold flex items-center justify-center gap-1",
                  selected ? "text-white text-base" : "text-secondary"
                )}>
                  <span>+{coinReward}</span>
                  <span className="text-base">🪙</span>
                </div>
              )}

              {/* Difficulty indicator */}
              {unlocked && !selected && (
                <div className="text-xs text-muted-foreground mt-1">
                  +{(level - 1) * 5}% khó
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-3 sm:border-4 border-primary/20">
        <div className="text-center space-y-1 sm:space-y-1">
          <p className="text-2xl sm:text-2xl font-fredoka font-bold text-primary">
            Level {currentLevel}
          </p>
          <p className="text-lg sm:text-lg font-comic text-secondary font-bold">
            Phần thưởng: {getCoinReward(currentLevel)} Camly Coins 🪙
          </p>
          <p className="text-sm text-muted-foreground font-comic">
            Độ khó: +{(currentLevel - 1) * 5}% so với Level 1
          </p>
        </div>

        <Button
          onClick={onStartGame}
          size="lg"
          className="w-full sm:w-auto font-fredoka font-bold text-xl sm:text-2xl px-10 sm:px-12 py-6 sm:py-8 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-xl transform hover:scale-105 sm:hover:scale-110 transition-all rounded-[30px]"
        >
          Bắt Đầu Chơi! 🚀
        </Button>
      </div>
    </Card>
  );
};
