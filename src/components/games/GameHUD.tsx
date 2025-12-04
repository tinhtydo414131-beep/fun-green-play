import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Zap, Heart, Star, Pause, Trophy, Flame } from "lucide-react";

interface GameHUDProps {
  score: number;
  level: number;
  lives?: number;
  maxLives?: number;
  combo?: number;
  progress?: number;
  targetScore?: number;
  coins?: number;
  powerUps?: { icon: string; name: string; active: boolean; count: number }[];
  onPause?: () => void;
  onUsePowerUp?: (index: number) => void;
  showComboEffect?: boolean;
}

export const GameHUD = ({
  score,
  level,
  lives,
  maxLives = 3,
  combo = 0,
  progress = 0,
  targetScore,
  coins = 0,
  powerUps = [],
  onPause,
  onUsePowerUp,
  showComboEffect = false,
}: GameHUDProps) => {
  const [prevScore, setPrevScore] = useState(score);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [comboAnimation, setComboAnimation] = useState(false);

  useEffect(() => {
    if (score > prevScore) {
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 300);
    }
    setPrevScore(score);
  }, [score]);

  useEffect(() => {
    if (combo > 0 && showComboEffect) {
      setComboAnimation(true);
      setTimeout(() => setComboAnimation(false), 500);
    }
  }, [combo, showComboEffect]);

  return (
    <div className="w-full space-y-2 mb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-2 border border-primary/20">
        {/* Level */}
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-primary/20 border-primary/40 font-bold">
            <Star className="h-3 w-3 mr-1 text-yellow-500" />
            Lv.{level}
          </Badge>
        </div>

        {/* Score */}
        <motion.div
          animate={scoreAnimation ? { scale: [1, 1.2, 1] } : {}}
          className="flex items-center gap-1"
        >
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm px-3">
            <Trophy className="h-3 w-3 mr-1" />
            {score.toLocaleString()}
          </Badge>
        </motion.div>

        {/* Coins earned */}
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/40 text-yellow-600 dark:text-yellow-400 font-bold">
            <Coins className="h-3 w-3 mr-1" />
            +{coins.toLocaleString()}
          </Badge>
        </div>

        {/* Pause button */}
        {onPause && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onPause}
            className="h-8 w-8 p-0"
          >
            <Pause className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {targetScore && targetScore > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tiến độ</span>
            <span>{Math.min(100, Math.round((score / targetScore) * 100))}%</span>
          </div>
          <Progress value={Math.min(100, (score / targetScore) * 100)} className="h-2" />
        </div>
      )}

      {/* Middle row: Lives + Combo */}
      <div className="flex items-center justify-between">
        {/* Lives */}
        {lives !== undefined && (
          <div className="flex items-center gap-1">
            {Array.from({ length: maxLives }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Heart
                  className={`h-5 w-5 ${
                    i < lives
                      ? "text-red-500 fill-red-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Combo indicator */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{
                scale: comboAnimation ? [1, 1.3, 1] : 1,
                rotate: 0,
              }}
              exit={{ scale: 0 }}
              className="flex items-center gap-1"
            >
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold animate-pulse">
                <Flame className="h-3 w-3 mr-1" />
                x{combo} COMBO!
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Power-ups row */}
      {powerUps.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {powerUps.map((pu, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={pu.count <= 0 || pu.active}
              onClick={() => onUsePowerUp?.(i)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all ${
                pu.active
                  ? "bg-primary/20 border-primary animate-pulse"
                  : pu.count > 0
                  ? "bg-muted hover:bg-muted/80 border-border"
                  : "bg-muted/30 border-transparent opacity-50"
              }`}
            >
              <span>{pu.icon}</span>
              <span className="hidden sm:inline">{pu.name}</span>
              {pu.count > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {pu.count}
                </Badge>
              )}
              {pu.active && <Zap className="h-3 w-3 text-yellow-500" />}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};
