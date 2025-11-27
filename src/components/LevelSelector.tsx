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
    <div className="w-[92vw] max-w-[420px] mx-auto my-4">
      <Card className="p-6 border-0 bg-transparent shadow-none">
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-[36px] sm:text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Chọn Level 🎮
          </h2>
          <p className="text-[16px] sm:text-lg font-comic text-muted-foreground">
            Hoàn thành level để mở level tiếp theo!
          </p>
        </div>

        {/* Mobile: 3 columns exactly using CSS Grid */}
        <div className="level-grid mb-8">
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
                "level-button flex flex-col items-center justify-center overflow-hidden transition-all",
                unlocked && "level-button-unlocked",
                !unlocked && "level-button-locked cursor-not-allowed opacity-60",
                selected && unlocked && "border-[3px] border-[#00F2FF] shadow-[0_0_30px_rgba(0,242,255,0.5),0_8px_20px_rgba(139,70,255,0.4)]",
                level === 10 && "level-button-last"
              )}
            >
              {/* Level number */}
              <div className={cn(
                "text-[48px] font-fredoka font-bold leading-none",
                unlocked ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" : "text-gray-500"
              )}>
                {level}
              </div>

              {/* Status icon for locked levels */}
              {!unlocked && (
                <Lock className="w-5 h-5 text-gray-400 mt-1" />
              )}

              {/* Coin reward - Compact and centered under number */}
              {unlocked && (
                <div className="flex items-center justify-center gap-0.5 font-comic font-bold text-white drop-shadow-md mt-1">
                  <span className="text-[20px]">+{coinReward}</span>
                  <span className="text-[20px]">🪙</span>
                </div>
              )}
            </button>
          );
        })}
        </div>

        <div className="flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-6 bg-gradient-to-br from-primary/8 to-secondary/8 rounded-[24px] border-2 sm:border-3 border-primary/20 mt-2">
        <div className="text-center space-y-1">
          <p className="text-[24px] sm:text-2xl font-fredoka font-bold text-primary">
            Level {currentLevel}
          </p>
          <p className="text-[18px] sm:text-lg font-comic text-secondary font-bold">
            Phần thưởng: {getCoinReward(currentLevel)} Camly Coins 🪙
          </p>
          <p className="text-[14px] text-muted-foreground font-comic">
            Độ khó: +{(currentLevel - 1) * 5}% so với Level 1
          </p>
        </div>

        <Button
          onClick={onStartGame}
          size="lg"
          className="w-full sm:w-auto font-fredoka font-bold text-[22px] sm:text-2xl px-12 sm:px-12 py-7 sm:py-8 bg-gradient-to-r from-[#8B46FF] via-secondary to-[#00F2FF] hover:shadow-xl transform hover:scale-105 sm:hover:scale-110 transition-all rounded-[30px]"
        >
          Bắt Đầu Chơi! 🚀
        </Button>
        </div>
      </Card>
    </div>
  );
};
