import { Card } from "./ui/card";
import { Rocket, Sparkles } from "lucide-react";
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
  const isLevelUnlocked = (level: number): boolean => {
    if (level === 1) return true;
    return highestLevelCompleted >= level - 1;
  };

  return (
    <Card className="relative p-8 sm:p-12 border-4 border-white/40 rounded-[32px] shadow-2xl backdrop-blur-xl overflow-hidden bg-white/20">
      {/* Animated Fireflies & Sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        >
          {i % 3 === 0 ? '✨' : i % 3 === 1 ? '🦋' : '🌸'}
        </motion.div>
      ))}

      <div className="relative z-10 space-y-8">
        {/* Title Section */}
        <div className="text-center space-y-3">
          <motion.h2 
            className="text-5xl md:text-6xl font-poppins font-extrabold bg-gradient-to-r from-magic-purple via-magic-cyan to-magic-gold bg-clip-text text-transparent drop-shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Chọn Level 🎮
          </motion.h2>
          <p className="text-2xl font-poppins font-semibold text-magic-purple">
            Màn {currentLevel} - Phần thưởng: {getCoinReward(currentLevel)} Coins 💰
          </p>
        </div>

        {/* Level Grid - 3 columns */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[...Array(10)].map((_, index) => {
            const level = index + 1;
            const isUnlocked = isLevelUnlocked(level);
            const isCompleted = level <= highestLevelCompleted;
            const isCurrent = level === currentLevel;
            
            return (
              <motion.button
                key={level}
                onClick={() => isUnlocked && onLevelSelect(level)}
                disabled={!isUnlocked}
                whileHover={isUnlocked ? { scale: 1.08 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                className={`
                  relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-4
                  ${isUnlocked 
                    ? 'bg-gradient-to-br from-[#6B46C1] via-[#9F7AEA] via-[#00D4FF] via-[#4FD1C7] via-[#3B82F6] to-[#00D4FF] border-[3px] border-[rgba(0,212,255,0.8)] shadow-[0_12px_40px_rgba(0,212,255,0.4),0_0_60px_rgba(107,70,193,0.3),inset_0_4px_12px_rgba(255,255,255,0.3)] cursor-pointer' 
                    : 'bg-gray-400/50 border-[3px] border-gray-500/50 cursor-not-allowed opacity-50'
                  }
                  ${isCurrent ? 'ring-4 ring-yellow-300 ring-offset-4 ring-offset-white shadow-[0_20px_60px_rgba(0,212,255,0.6),0_0_80px_rgba(107,70,193,0.5)]' : ''}
                  transition-all duration-300
                `}
              >
                {/* Glow Effect for Current Level */}
                {isCurrent && isUnlocked && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-magic-gold/50 blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}

                {/* Level Number */}
                <span className={`text-5xl font-poppins font-extrabold relative z-10 ${isUnlocked ? 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]' : 'text-gray-500'}`}>
                  {level}
                </span>
                
                {/* Lock Icon */}
                {!isUnlocked && (
                  <span className="text-3xl">🔒</span>
                )}
                
                {/* Star for Completed */}
                {isCompleted && (
                  <motion.span 
                    className="absolute top-2 right-2 text-3xl"
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ⭐
                  </motion.span>
                )}
                
                {/* Coin Reward */}
                {isUnlocked && (
                  <span className="text-base font-poppins font-bold text-white/95 relative z-10 drop-shadow-md">
                    +{getCoinReward(level)} 💰
                  </span>
                )}
                
                {/* Sparkles for Current */}
                {isCurrent && isUnlocked && (
                  <>
                    <motion.span 
                      className="absolute -top-2 -left-2 text-2xl"
                      animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                    <motion.span 
                      className="absolute -bottom-2 -right-2 text-2xl"
                      animate={{ rotate: -360, scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      ✨
                    </motion.span>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Level Info Panel */}
        <motion.div 
          className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl p-8 text-white text-center space-y-4 shadow-[0_12px_40px_rgba(0,212,255,0.4),0_0_60px_rgba(107,70,193,0.3)] border-[3px] border-white/40"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{ backgroundSize: '200% 200%' }}
        >
          <h3 className="text-4xl font-poppins font-black drop-shadow-lg">
            Level {currentLevel} 🎯
          </h3>
          <div className="flex items-center justify-center gap-3 text-2xl font-poppins font-black">
            <span>Phần thưởng: {getCoinReward(currentLevel)} Coins 💰</span>
          </div>
          <p className="text-xl font-poppins font-bold">
            Độ khó: {currentLevel <= 3 ? 'Dễ 😊' : currentLevel <= 6 ? 'Trung bình 😎' : 'Khó 🔥'}
          </p>
        </motion.div>

        {/* Diamond Start Button */}
        <motion.button
          onClick={onStartGame}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-full max-w-xl mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-[#6B46C1] via-[#9F7AEA] via-[#00D4FF] via-[#4FD1C7] via-[#3B82F6] to-[#00D4FF] shadow-[0_12px_40px_rgba(0,212,255,0.4),0_0_60px_rgba(107,70,193,0.3),inset_0_4px_12px_rgba(255,255,255,0.3)] border-[3px] border-[rgba(0,212,255,0.8)] group block transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,212,255,0.6),0_0_80px_rgba(107,70,193,0.5),0_0_40px_rgba(255,255,255,0.8)]"
        >
          <div className="relative px-12 py-6 flex items-center justify-center gap-4">
            <Rocket className="w-10 h-10 text-white group-hover:rotate-12 transition-transform drop-shadow-lg" />
            <span className="text-4xl font-poppins font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              Bắt đầu chơi!
            </span>
            <Sparkles className="w-10 h-10 text-white animate-pulse drop-shadow-lg" />
          </div>
        </motion.button>
      </div>
    </Card>
  );
};
