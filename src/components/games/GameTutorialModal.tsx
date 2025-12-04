import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Trophy, Star, Sparkles, Target, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GameTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  gameTitle: string;
  gameIcon: string;
  howToPlay: string[];
  objectives: string[];
  rewards: {
    perLevel: number;
    firstPlay: number;
    combo: number;
  };
  tips?: string[];
  powerUps?: { icon: string; name: string; description: string }[];
}

export const GameTutorialModal = ({
  isOpen,
  onClose,
  onStart,
  gameTitle,
  gameIcon,
  howToPlay,
  objectives,
  rewards,
  tips = [],
  powerUps = [],
}: GameTutorialModalProps) => {
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onStart();
    }
  };

  const handleSkip = () => {
    onStart();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-5xl"
            >
              {gameIcon}
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chào mừng đến {gameTitle}!
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="relative min-h-[280px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Target className="h-5 w-5" />
                  Cách chơi
                </div>
                <ul className="space-y-2">
                  {howToPlay.map((instruction, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {instruction}
                    </motion.li>
                  ))}
                </ul>
                <div className="bg-secondary/10 rounded-lg p-3 border border-secondary/20">
                  <div className="flex items-center gap-2 text-secondary font-semibold mb-2">
                    <Star className="h-4 w-4" />
                    Mục tiêu
                  </div>
                  <ul className="space-y-1">
                    {objectives.map((obj, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Coins className="h-5 w-5" />
                  Phần thưởng Camly Coin
                </div>
                <div className="grid gap-3">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Mỗi level hoàn thành</span>
                      <Badge className="bg-yellow-500 text-white">
                        +{rewards.perLevel.toLocaleString()} 🪙
                      </Badge>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Lần đầu chơi game</span>
                      <Badge className="bg-green-500 text-white">
                        +{rewards.firstPlay.toLocaleString()} 🪙
                      </Badge>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Combo bonus (x5 streak)</span>
                      <Badge className="bg-purple-500 text-white">
                        +{rewards.combo.toLocaleString()} 🪙
                      </Badge>
                    </div>
                  </motion.div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Điểm tự động đổi thành Camly Coin và cập nhật Honor Board! 🏆
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-4"
              >
                {powerUps.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                      <Zap className="h-5 w-5" />
                      Power-Ups đặc biệt
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {powerUps.map((pu, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-muted/50 rounded-lg p-3 text-center border border-border"
                        >
                          <div className="text-2xl mb-1">{pu.icon}</div>
                          <div className="text-xs font-medium">{pu.name}</div>
                          <div className="text-[10px] text-muted-foreground">{pu.description}</div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
                {tips.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-lg font-semibold text-secondary">
                      <Trophy className="h-5 w-5" />
                      Mẹo hay
                    </div>
                    <ul className="space-y-2">
                      {tips.map((tip, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-yellow-500">💡</span>
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </>
                )}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-4"
                >
                  <div className="text-4xl mb-2">🎮</div>
                  <p className="text-sm font-medium text-primary">Sẵn sàng chơi chưa?</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "bg-primary w-6" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Bỏ qua
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {step === totalSteps - 1 ? "Bắt đầu chơi! 🚀" : "Tiếp theo →"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
