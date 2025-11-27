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
    <Card className="p-8 sm:p-10 border-4 border-primary/20 bg-gradient-to-br from-background/95 via-primary/5 to-secondary/5 rounded-[40px] shadow-[0_8px_30px_rgba(139,70,255,0.15)] backdrop-blur-sm">
      <div className="text-center mb-8 space-y-3 py-2">
        <h2 className="text-[42px] sm:text-5xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
          Chọn Level 🎮
        </h2>
        <p className="text-[18px] sm:text-xl font-comic text-muted-foreground">
          Hoàn thành level để mở level tiếp theo!
        </p>
      </div>

      {/* Level Grid - 5 columns */}
      <div className="grid grid-cols-5 gap-x-4 gap-y-6 mb-10 justify-items-center max-w-[800px] mx-auto">
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
                "relative flex flex-col items-center justify-center rounded-[32px] transition-all duration-300",
                "w-[120px] h-[120px] sm:w-[136px] sm:h-[136px]",
                selected && unlocked && "bg-gradient-to-br from-[hsl(280,90%,65%)] via-[hsl(200,100%,60%)] to-[hsl(180,100%,50%)] shadow-[0_0_40px_rgba(0,242,255,0.6),0_10px_25px_rgba(139,70,255,0.5),inset_0_2px_20px_rgba(255,255,255,0.3)] scale-110 animate-pulse",
                !selected && unlocked && "bg-gradient-to-br from-primary via-secondary to-primary shadow-[0_6px_20px_rgba(139,70,255,0.4),inset_0_2px_10px_rgba(255,255,255,0.2)] hover:scale-110 hover:shadow-[0_8px_30px_rgba(139,70,255,0.6)] active:scale-105",
                !unlocked && "bg-gradient-to-br from-muted/40 to-muted/20 cursor-not-allowed opacity-50"
              )}
            >
              {/* Glowing border effect for unlocked */}
              {unlocked && (
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/20 to-transparent opacity-50" />
              )}

              {/* Level number */}
              <div className={cn(
                "text-[56px] sm:text-[64px] font-fredoka font-black leading-none mb-1 relative z-10",
                unlocked ? "text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" : "text-muted-foreground/60"
              )}>
                {level}
              </div>

              {/* Lock icon for locked levels */}
              {!unlocked && (
                <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground/60 mt-1" />
              )}

              {/* Coin reward - Prominent display */}
              {unlocked && (
                <div className="flex items-center justify-center gap-1 font-comic font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mt-1 relative z-10">
                  <span className="text-[16px] sm:text-[18px]">+{coinReward}</span>
                  <span className="text-[22px] sm:text-[26px]">🪙</span>
                </div>
              )}

              {/* Star indicator for completed */}
              {completed && (
                <Star className="absolute -top-2 -right-2 w-7 h-7 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Level Info Panel */}
      <div className="flex flex-col items-center gap-5 p-6 sm:p-8 bg-gradient-to-br from-primary/8 via-secondary/8 to-accent/8 rounded-[32px] border-[3px] border-primary/30 shadow-[0_4px_20px_rgba(139,70,255,0.2)] backdrop-blur-sm max-w-[700px] mx-auto">
        <div className="text-center space-y-2">
          <p className="text-3xl sm:text-4xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Level {currentLevel}
          </p>
          <p className="text-xl sm:text-2xl font-comic text-accent font-bold flex items-center justify-center gap-2">
            Phần thưởng: {getCoinReward(currentLevel)} Camly Coins 🪙
          </p>
          <p className="text-base sm:text-lg text-muted-foreground font-comic">
            Độ khó: +{(currentLevel - 1) * 5}% so với Level 1
          </p>
        </div>

        <Button
          onClick={onStartGame}
          size="lg"
          className="w-full sm:w-auto font-fredoka font-bold text-2xl sm:text-3xl px-12 sm:px-16 py-7 sm:py-9 bg-gradient-to-r from-primary via-secondary to-accent hover:from-secondary hover:via-accent hover:to-primary shadow-[0_6px_25px_rgba(139,70,255,0.4)] hover:shadow-[0_8px_35px_rgba(139,70,255,0.6)] transform hover:scale-110 active:scale-105 transition-all duration-300 rounded-[32px] border-2 border-white/30"
        >
          Bắt Đầu Chơi! 🚀
        </Button>
      </div>
    </Card>
  );
};
