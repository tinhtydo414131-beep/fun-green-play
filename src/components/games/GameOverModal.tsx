import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Coins, Star, RotateCcw, Home, Share2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onHome: () => void;
  isWin: boolean;
  score: number;
  coinsEarned: number;
  level: number;
  highScore?: number;
  achievements?: { icon: string; name: string; description: string }[];
  stats?: { label: string; value: string | number }[];
}

export const GameOverModal = ({
  isOpen,
  onClose,
  onRestart,
  onHome,
  isWin,
  score,
  coinsEarned,
  level,
  highScore = 0,
  achievements = [],
  stats = [],
}: GameOverModalProps) => {
  const isNewHighScore = score > highScore;

  useEffect(() => {
    if (isOpen && isWin) {
      // Fire confetti for wins
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen, isWin]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-gradient-to-br from-background to-primary/5 border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-6xl mb-2"
            >
              {isWin ? "🎉" : "😢"}
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-2xl font-bold ${
                isWin
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              } bg-clip-text text-transparent`}
            >
              {isWin ? "Tuyệt vời! 🏆" : "Cố gắng lên! 💪"}
            </motion.span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Score display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="text-3xl font-bold">{score.toLocaleString()}</span>
            </div>
            {isNewHighScore && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                Kỷ lục mới!
              </Badge>
            )}
            <div className="text-sm text-muted-foreground">
              Level {level} {isWin ? "hoàn thành" : ""}
            </div>
          </motion.div>

          {/* Rewards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                Camly Coin nhận được
              </span>
              <Badge className="bg-yellow-500 text-white text-lg px-3 py-1">
                +{coinsEarned.toLocaleString()} 🪙
              </Badge>
            </div>
          </motion.div>

          {/* Stats */}
          {stats.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-2"
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-muted/50 rounded-lg p-2 text-center border border-border"
                >
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <div className="text-sm font-medium flex items-center gap-1">
                <Star className="h-4 w-4 text-purple-500" />
                Thành tựu mới
              </div>
              <div className="flex flex-wrap gap-2">
                {achievements.map((ach, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-purple-500/10 border-purple-500/30"
                  >
                    {ach.icon} {ach.name}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-2"
          >
            <Button
              variant="outline"
              onClick={onHome}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-1" />
              Trang chủ
            </Button>
            <Button
              onClick={onRestart}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Chơi lại
            </Button>
          </motion.div>

          {/* Share button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Chia sẻ kết quả với bạn bè
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
