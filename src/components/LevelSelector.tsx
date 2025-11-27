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
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-4 mb-6 sm:mb-8">
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
                "relative aspect-square w-full flex flex-col items-center justify-center rounded-[24px] transition-all group",
                "w-[90px] h-[90px] xs:w-[100px] xs:h-[100px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px]",
                selected && unlocked && "bg-gradient-to-br from-primary via-secondary to-accent border-[4px] border-[#00F2FF] shadow-[0_0_30px_rgba(0,242,255,0.5),0_8px_20px_rgba(139,70,255,0.4)] scale-105",
                !selected && unlocked && "bg-gradient-to-br from-primary to-secondary border-[2px] border-white/50 shadow-[0_4px_15px_rgba(139,70,255,0.3)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(139,70,255,0.4)]",
                !unlocked && "bg-white border-[2px] border-muted/40 cursor-not-allowed opacity-60"
              )}
            >
              {/* Level number */}
              <div className={cn(
                "text-[42px] sm:text-[48px] md:text-[52px] font-fredoka font-bold leading-none mb-1",
                unlocked ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" : "text-muted-foreground"
              )}>
                {level}
              </div>

              {/* Status icon */}
              {!unlocked && (
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground mb-1" />
              )}
              {completed && unlocked && !selected && (
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white drop-shadow-md mb-1" />
              )}
              {unlocked && !completed && !selected && (
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md mb-1" />
              )}

              {/* Coin reward - Prominent on unlocked levels */}
              {unlocked && (
                <div className={cn(
                  "flex items-center justify-center gap-1 font-comic font-bold",
                  selected ? "text-[18px] sm:text-[20px] text-white drop-shadow-md" : "text-[16px] sm:text-[18px] text-white drop-shadow-md"
                )}>
                  <span>+{coinReward}</span>
                  <span className="text-[28px] sm:text-[32px]">🪙</span>
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
