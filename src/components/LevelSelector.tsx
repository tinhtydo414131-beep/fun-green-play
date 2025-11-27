import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <Card className="relative p-8 sm:p-10 border-4 border-primary/20 rounded-[40px] shadow-[0_8px_30px_rgba(139,70,255,0.15)] backdrop-blur-sm overflow-hidden bg-gradient-to-b from-orange-100 via-yellow-50 to-green-100">
      {/* Morning mist overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/20 pointer-events-none" />
      
      {/* Smiling Sun in top right - BIGGER */}
      <motion.div 
        className="absolute -top-8 -right-8 sm:-top-12 sm:-right-12 w-48 h-48 sm:w-64 sm:h-64 z-10"
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Sun rays */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 sm:w-3 h-12 sm:h-16 bg-gradient-to-t from-yellow-400 to-orange-300 rounded-full origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
              }}
              animate={{
                scaleY: [1, 1.2, 1],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Sun face */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 shadow-[0_0_60px_rgba(255,200,0,0.8)]">
          {/* Sparkling eyes */}
          <div className="absolute top-[35%] left-[30%] w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full shadow-lg">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full">
              <motion.div 
                className="absolute top-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
          <div className="absolute top-[35%] right-[30%] w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full shadow-lg">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full">
              <motion.div 
                className="absolute top-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
              />
            </div>
          </div>
          
          {/* Nose */}
          <div className="absolute top-[52%] left-1/2 transform -translate-x-1/2 w-2 h-3 sm:w-3 sm:h-4 bg-orange-500 rounded-full" />
          
          {/* Big smile */}
          <motion.div 
            className="absolute bottom-[28%] left-1/2 transform -translate-x-1/2 w-16 h-10 sm:w-20 sm:h-12 border-b-4 sm:border-b-[6px] border-orange-600 rounded-b-full"
            animate={{ scaleX: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Rosy cheeks */}
          <div className="absolute top-[48%] left-[15%] w-5 h-5 sm:w-7 sm:h-7 bg-red-300 rounded-full opacity-60" />
          <div className="absolute top-[48%] right-[15%] w-5 h-5 sm:w-7 sm:h-7 bg-red-300 rounded-full opacity-60" />
        </div>
      </motion.div>

      {/* Colorful flowers scattered - MORE */}
      {[
        { emoji: '🌸', top: '8%', left: '5%', delay: 0, duration: 4 },
        { emoji: '🌺', top: '15%', left: '15%', delay: 0.5, duration: 5 },
        { emoji: '🌻', top: '12%', left: '85%', delay: 1, duration: 4.5 },
        { emoji: '🌷', top: '25%', left: '10%', delay: 1.5, duration: 5.5 },
        { emoji: '🌹', top: '20%', left: '90%', delay: 2, duration: 4 },
        { emoji: '💐', top: '35%', left: '8%', delay: 0.3, duration: 5 },
        { emoji: '🏵️', top: '30%', left: '92%', delay: 0.8, duration: 4.5 },
        { emoji: '🌼', top: '45%', left: '5%', delay: 1.2, duration: 5 },
        { emoji: '🌸', top: '40%', left: '88%', delay: 1.8, duration: 4 },
        { emoji: '🌺', top: '55%', left: '12%', delay: 0.6, duration: 5.5 },
        { emoji: '🌻', top: '50%', left: '90%', delay: 1.4, duration: 4.5 },
        { emoji: '🌷', top: '65%', left: '8%', delay: 2.2, duration: 5 },
        { emoji: '🌹', top: '60%', left: '92%', delay: 0.9, duration: 4 },
        { emoji: '💐', top: '75%', left: '10%', delay: 1.6, duration: 5.5 },
        { emoji: '🏵️', top: '70%', left: '88%', delay: 2.4, duration: 4.5 },
        { emoji: '🌼', top: '22%', left: '50%', delay: 0.4, duration: 5 },
        { emoji: '🌸', top: '42%', left: '48%', delay: 1.1, duration: 4.5 },
        { emoji: '🌺', top: '62%', left: '52%', delay: 1.9, duration: 5 },
        { emoji: '🌻', top: '18%', left: '70%', delay: 0.7, duration: 4 },
        { emoji: '🌷', top: '38%', left: '25%', delay: 1.3, duration: 5.5 },
        { emoji: '🌹', top: '58%', left: '75%', delay: 2.1, duration: 4.5 },
      ].map((flower, index) => (
        <motion.div
          key={`flower-${index}`}
          className="absolute text-3xl sm:text-4xl pointer-events-none z-[5]"
          style={{ top: flower.top, left: flower.left }}
          animate={{
            y: [0, -15, 0],
            rotate: [-5, 5, -5],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: flower.duration,
            repeat: Infinity,
            delay: flower.delay,
            ease: "easeInOut"
          }}
        >
          {flower.emoji}
        </motion.div>
      ))}

      {/* Smiling clouds - 4 clouds */}
      {[
        { top: '10%', delay: 0, duration: 30 },
        { top: '25%', delay: 10, duration: 35 },
        { top: '55%', delay: 20, duration: 32 },
        { top: '70%', delay: 15, duration: 28 },
      ].map((cloud, index) => (
        <motion.div
          key={`cloud-${index}`}
          className="absolute text-4xl sm:text-5xl z-[6]"
          style={{ top: cloud.top }}
          initial={{ left: '-10%' }}
          animate={{ left: '110%' }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            delay: cloud.delay,
            ease: "linear"
          }}
        >
          <div className="relative">
            <span>☁️</span>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-sm">😊</span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Butterflies - 6 butterflies with natural curved paths */}
      {[
        { 
          emoji: '🦋', 
          color: 'text-purple-400',
          path: { x: [0, 100, 200, 100, 0], y: [0, -50, 0, 50, 0] },
          duration: 15,
          delay: 0
        },
        { 
          emoji: '🦋', 
          color: 'text-pink-400',
          path: { x: [0, -80, -160, -80, 0], y: [0, 60, 0, -60, 0] },
          duration: 18,
          delay: 3
        },
        { 
          emoji: '🦋', 
          color: 'text-blue-400',
          path: { x: [0, 50, 100, 50, 0], y: [0, 80, 0, -80, 0] },
          duration: 20,
          delay: 6
        },
        { 
          emoji: '🦋', 
          color: 'text-yellow-400',
          path: { x: [0, -120, 0, 120, 0], y: [0, -40, -80, -40, 0] },
          duration: 16,
          delay: 9
        },
        { 
          emoji: '🦋', 
          color: 'text-green-400',
          path: { x: [0, 150, 0, -150, 0], y: [0, 30, 60, 30, 0] },
          duration: 22,
          delay: 12
        },
        { 
          emoji: '🦋', 
          color: 'text-orange-400',
          path: { x: [0, -60, -120, -180, 0], y: [0, -70, -20, 30, 0] },
          duration: 19,
          delay: 2
        },
      ].map((butterfly, index) => (
        <motion.div
          key={`butterfly-${index}`}
          className={`absolute top-[40%] left-[50%] text-2xl sm:text-3xl z-[15] ${butterfly.color}`}
          animate={{
            x: butterfly.path.x,
            y: butterfly.path.y,
            rotate: [0, 15, -15, 0],
            scale: [1, 1.2, 0.9, 1]
          }}
          transition={{
            duration: butterfly.duration,
            repeat: Infinity,
            delay: butterfly.delay,
            ease: "easeInOut"
          }}
        >
          {butterfly.emoji}
        </motion.div>
      ))}

      {/* Bees - 7 bees buzzing around */}
      {[
        { 
          path: { x: [0, 80, 160, 80, 0], y: [0, -30, 0, 30, 0] },
          duration: 12,
          delay: 0
        },
        { 
          path: { x: [0, -100, -50, 50, 0], y: [0, 50, 100, 50, 0] },
          duration: 14,
          delay: 2
        },
        { 
          path: { x: [0, 120, 60, -60, 0], y: [0, -60, -120, -60, 0] },
          duration: 16,
          delay: 4
        },
        { 
          path: { x: [0, -70, -140, -70, 0], y: [0, 40, 0, -40, 0] },
          duration: 13,
          delay: 6
        },
        { 
          path: { x: [0, 90, 45, -45, 0], y: [0, 70, 140, 70, 0] },
          duration: 15,
          delay: 8
        },
        { 
          path: { x: [0, -110, -55, 55, 0], y: [0, -50, -100, -50, 0] },
          duration: 17,
          delay: 10
        },
        { 
          path: { x: [0, 130, 0, -130, 0], y: [0, 20, 40, 20, 0] },
          duration: 11,
          delay: 1
        },
      ].map((bee, index) => (
        <motion.div
          key={`bee-${index}`}
          className="absolute top-[35%] left-[45%] text-xl sm:text-2xl z-[15]"
          animate={{
            x: bee.path.x,
            y: bee.path.y,
            rotate: [0, 20, -20, 0],
            scale: [1, 1.15, 0.95, 1]
          }}
          transition={{
            duration: bee.duration,
            repeat: Infinity,
            delay: bee.delay,
            ease: "easeInOut"
          }}
        >
          🐝
        </motion.div>
      ))}

      {/* Grass and flowers at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-400 via-green-300 to-transparent pointer-events-none z-[8]">
        <div className="absolute bottom-0 left-0 right-0 flex justify-around text-2xl sm:text-3xl">
          {['🌸', '🌼', '🌺', '🌻', '🌷', '🌹', '💐', '🏵️', '🌸', '🌼', '🌺', '🌻'].map((flower, i) => (
            <motion.span
              key={`bottom-flower-${i}`}
              animate={{
                y: [0, -5, 0],
                rotate: [-3, 3, -3]
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            >
              {flower}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center mb-8 space-y-3 py-2">
        {/* Falling flowers around title */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full pointer-events-none">
          {['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🏵️', '🌼', '🌸', '🌺', '🌻', '🌷'].map((flower, i) => (
            <motion.div
              key={`title-flower-${i}`}
              className="absolute text-2xl"
              style={{ left: `${(i + 1) * 8}%` }}
              animate={{
                y: [0, 20, 0],
                rotate: [0, 360],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut"
              }}
            >
              {flower}
            </motion.div>
          ))}
        </div>
        
        <h2 className="text-[42px] sm:text-5xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
          Chọn Level 🎮
        </h2>
        <p className="text-[18px] sm:text-xl font-comic text-muted-foreground">
          Hoàn thành level để mở level tiếp theo!
        </p>
      </div>

      {/* Level Grid - 5 columns */}
      <div className="relative z-10 grid grid-cols-5 gap-x-4 gap-y-6 mb-10 justify-items-center max-w-[800px] mx-auto">
        {levels.map((level) => {
          const unlocked = isLevelUnlocked(level);
          const completed = level <= highestLevelCompleted;
          const selected = level === currentLevel;
          const coinReward = getCoinReward(level);

          return (
            <motion.button
              key={level}
              onClick={() => unlocked && onLevelSelect(level)}
              disabled={!unlocked}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-[32px] transition-all duration-300 border-4 border-white/30",
                "w-[120px] h-[120px] sm:w-[136px] sm:h-[136px]",
                selected && unlocked && "bg-gradient-to-br from-[hsl(280,90%,65%)] via-[hsl(200,100%,60%)] to-[hsl(180,100%,50%)] shadow-[0_0_40px_rgba(0,242,255,0.6),0_10px_25px_rgba(139,70,255,0.5),inset_0_2px_20px_rgba(255,255,255,0.3)] scale-110 animate-pulse border-white/60",
                !selected && unlocked && "bg-gradient-to-br from-primary via-secondary to-primary shadow-[0_6px_25px_rgba(139,70,255,0.5),inset_0_2px_10px_rgba(255,255,255,0.2)] hover:scale-110 hover:shadow-[0_8px_35px_rgba(139,70,255,0.7)] hover:border-white/60 active:scale-105",
                !unlocked && "bg-gradient-to-br from-muted/40 to-muted/20 cursor-not-allowed opacity-50"
              )}
              whileHover={unlocked ? { scale: 1.1 } : {}}
            >
              {/* Flower bloom effect on hover for unlocked levels */}
              {unlocked && (
                <motion.div 
                  className="absolute -top-2 -left-2 text-2xl"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  🌹
                </motion.div>
              )}
              {unlocked && (
                <motion.div 
                  className="absolute -top-2 -right-2 text-2xl"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  💐
                </motion.div>
              )}
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
                <Star className="absolute -top-2 -right-2 w-7 h-7 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] z-10" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Level Info Panel */}
      <div className="relative z-10 flex flex-col items-center gap-5 p-6 sm:p-8 bg-gradient-to-br from-primary/8 via-secondary/8 to-accent/8 rounded-[32px] border-[3px] border-primary/30 shadow-[0_4px_20px_rgba(139,70,255,0.2)] backdrop-blur-sm max-w-[700px] mx-auto">
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
