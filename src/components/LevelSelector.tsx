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
    <Card className="relative p-8 sm:p-12 border-4 border-magic-purple/30 rounded-[32px] shadow-2xl backdrop-blur-md overflow-hidden bg-gradient-to-br from-magic-purple/10 via-magic-cyan/10 to-magic-purple/10">
      {/* Animated Background Stars */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          ✨
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
                whileHover={isUnlocked ? { scale: 1.1, rotate: [0, -3, 3, 0] } : {}}
                whileTap={isUnlocked ? { scale: 0.9 } : {}}
                className={`
                  relative aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 p-4
                  ${isUnlocked 
                    ? 'bg-gradient-to-br from-magic-gold via-magic-purple to-magic-cyan border-4 border-magic-purple shadow-xl hover:shadow-2xl cursor-pointer' 
                    : 'bg-gray-300 border-4 border-gray-400 cursor-not-allowed opacity-50'
                  }
                  ${isCurrent ? 'ring-4 ring-magic-cyan ring-offset-4 ring-offset-white' : ''}
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
          className="bg-gradient-to-r from-magic-gold via-magic-pink to-magic-purple rounded-3xl p-8 text-white text-center space-y-4 shadow-xl"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{ backgroundSize: '200% 200%' }}
        >
          <h3 className="text-4xl font-poppins font-extrabold drop-shadow-lg">
            Level {currentLevel} 🎯
          </h3>
          <div className="flex items-center justify-center gap-3 text-2xl font-poppins font-bold">
            <span>Phần thưởng: {getCoinReward(currentLevel)} Coins 💰</span>
          </div>
          <p className="text-xl font-poppins">
            Độ khó: {currentLevel <= 3 ? 'Dễ 😊' : currentLevel <= 6 ? 'Trung bình 😎' : 'Khó 🔥'}
          </p>
        </motion.div>

        {/* Diamond Start Button */}
        <motion.button
          onClick={onStartGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-full max-w-xl mx-auto overflow-hidden rounded-full bg-gradient-to-r from-magic-gold via-magic-purple to-magic-cyan p-[4px] group block"
        >
          <div className="relative bg-gradient-to-r from-magic-gold to-magic-purple rounded-full px-12 py-6 flex items-center justify-center gap-4 group-hover:from-magic-purple group-hover:to-magic-cyan transition-all duration-300">
            <Rocket className="w-10 h-10 text-white group-hover:rotate-12 transition-transform" />
            <span className="text-4xl font-poppins font-extrabold text-white drop-shadow-lg">
              Bắt đầu chơi!
            </span>
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          
          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-magic-gold/50 blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.button>
      </div>
    </Card>
  );
};
