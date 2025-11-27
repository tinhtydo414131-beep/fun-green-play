import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Lock, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import flowerBg from "@/assets/flower-garden-bg.jpg";
import flowerMagical from "@/assets/flower-garden-magical.jpg";

interface FlowerFieldLevelSelectorProps {
  highestLevelCompleted: number;
  currentLevel: number;
  onLevelSelect: (level: number) => void;
  onStartGame: () => void;
  getCoinReward: (level: number) => number;
}

export const FlowerFieldLevelSelector = ({
  highestLevelCompleted,
  currentLevel,
  onLevelSelect,
  onStartGame,
  getCoinReward,
}: FlowerFieldLevelSelectorProps) => {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  const isLevelUnlocked = (level: number): boolean => {
    if (level === 1) return true;
    return highestLevelCompleted >= level - 1;
  };

  // Falling flowers animation
  const fallingFlowers = ['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🏵️', '🌼'];

  return (
    <div 
      className="relative min-h-[800px] w-full rounded-[40px] overflow-hidden"
      style={{
        backgroundImage: `url(${flowerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Animated parallax overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${flowerMagical})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'parallax 20s ease-in-out infinite',
        }}
      />

      {/* Clouds */}
      <motion.div
        className="absolute top-8 left-[10%] text-6xl opacity-60"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute top-12 right-[15%] text-5xl opacity-50"
        animate={{ x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>

      {/* Rainbow */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-8xl opacity-20">
        🌈
      </div>

      {/* Butterflies */}
      <motion.div
        className="absolute top-[20%] left-[15%] text-4xl"
        animate={{ 
          x: [0, 100, 50, 150, 0],
          y: [0, -50, 50, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.div>
      <motion.div
        className="absolute top-[30%] right-[20%] text-4xl"
        animate={{ 
          x: [0, -80, -40, -120, 0],
          y: [0, 40, -40, 20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.div>

      {/* Bees */}
      <motion.div
        className="absolute top-[40%] left-[25%] text-3xl"
        animate={{ 
          x: [0, 60, 30, 90, 0],
          y: [0, 30, -20, 40, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        🐝
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[800px] p-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Card 
            className="relative p-10 sm:p-12 border-4 border-white/40 bg-white/10 backdrop-blur-2xl rounded-[60px] shadow-[0_20px_80px_rgba(255,105,180,0.3),0_0_100px_rgba(147,51,234,0.2),inset_0_2px_40px_rgba(255,255,255,0.4)]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,192,203,0.2) 50%, rgba(218,112,214,0.15) 100%)',
            }}
          >
            {/* Falling flowers decoration */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl pointer-events-none"
                style={{ 
                  left: `${(i + 1) * 12}%`,
                  top: '-50px'
                }}
                animate={{ 
                  y: [0, 850],
                  rotate: [0, 360],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: 8 + i,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "linear"
                }}
              >
                {fallingFlowers[i % fallingFlowers.length]}
              </motion.div>
            ))}

            {/* Title Section */}
            <motion.div 
              className="text-center mb-10 space-y-4 py-2"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3">
                <motion.span
                  className="text-5xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🌻
                </motion.span>
                <h2 className="text-[48px] sm:text-6xl font-fredoka font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(255,105,180,0.6)] animate-pulse">
                  Chọn Level
                </h2>
                <motion.span
                  className="text-5xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🌸
                </motion.span>
              </div>
              <p className="text-xl sm:text-2xl font-comic text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] italic">
                ✨ Tạo vườn hoa cổ tích xinh đẹp nhất! ✨
              </p>
            </motion.div>

            {/* Level Grid - 5 columns */}
            <div className="grid grid-cols-5 gap-x-6 gap-y-8 mb-12 justify-items-center max-w-[900px] mx-auto">
              {levels.map((level, index) => {
                const unlocked = isLevelUnlocked(level);
                const completed = level <= highestLevelCompleted;
                const selected = level === currentLevel;
                const coinReward = getCoinReward(level);

                return (
                  <motion.button
                    key={level}
                    onClick={() => unlocked && onLevelSelect(level)}
                    disabled={!unlocked}
                    initial={{ scale: 0, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.08, duration: 0.5 }}
                    whileHover={unlocked ? { 
                      scale: 1.15,
                      rotate: [0, -5, 5, -5, 0],
                      transition: { duration: 0.4 }
                    } : {}}
                    whileTap={unlocked ? { scale: 0.95 } : {}}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-full transition-all duration-500",
                      "w-[130px] h-[130px] sm:w-[150px] sm:h-[150px]",
                      unlocked && "bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 shadow-[0_8px_35px_rgba(236,72,153,0.6),0_0_60px_rgba(168,85,247,0.5),inset_0_3px_20px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_50px_rgba(236,72,153,0.8),0_0_90px_rgba(168,85,247,0.7)] hover:scale-110",
                      selected && unlocked && "scale-115 animate-pulse shadow-[0_0_70px_rgba(236,72,153,0.9),0_0_110px_rgba(168,85,247,0.7)]",
                      !unlocked && "bg-gradient-to-br from-gray-300 to-gray-200 cursor-not-allowed opacity-40"
                    )}
                  >

                    {/* Glowing aura for all levels */}
                    {unlocked && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-60 animate-pulse" />
                        <motion.div 
                          className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-400/50 via-purple-400/50 to-cyan-400/50 blur-xl"
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </>
                    )}

                    {/* Flower petals around ALL levels - unlocked get animated flowers */}
                    {unlocked ? (
                      <>
                        <motion.div 
                          className="absolute -top-3 -left-3 text-3xl"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          🌸
                        </motion.div>
                        <motion.div 
                          className="absolute -top-3 -right-3 text-3xl"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          🌺
                        </motion.div>
                        <motion.div 
                          className="absolute -bottom-3 -left-3 text-3xl"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          🌻
                        </motion.div>
                        <motion.div 
                          className="absolute -bottom-3 -right-3 text-3xl"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          🌷
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <div className="absolute -top-3 -left-3 text-2xl opacity-30">🌸</div>
                        <div className="absolute -top-3 -right-3 text-2xl opacity-30">🌺</div>
                        <div className="absolute -bottom-3 -left-3 text-2xl opacity-30">🌻</div>
                        <div className="absolute -bottom-3 -right-3 text-2xl opacity-30">🌷</div>
                      </>
                    )}

                    {/* Level number */}
                    <div className={cn(
                      "text-[64px] sm:text-[72px] font-fredoka font-black leading-none mb-1 relative z-10",
                      unlocked ? "text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]" : "text-gray-400"
                    )}>
                      {level}
                    </div>

                    {/* Lock icon */}
                    {!unlocked && (
                      <Lock className="w-8 h-8 text-gray-500 mt-2" />
                    )}

                    {/* Coin reward */}
                    {unlocked && (
                      <motion.div 
                        className="flex items-center justify-center gap-1 font-comic font-black text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)] mt-1 relative z-10"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <span className="text-[18px] sm:text-[20px]">+{coinReward}</span>
                        <motion.span 
                          className="text-[26px] sm:text-[30px]"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          🪙
                        </motion.span>
                      </motion.div>
                    )}

                    {/* Completion star */}
                    {completed && (
                      <motion.div
                        className="absolute -top-3 -right-3 z-20"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.8 + index * 0.08, type: "spring" }}
                      >
                        <Star className="w-10 h-10 fill-yellow-300 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,1)] animate-pulse" />
                      </motion.div>
                    )}

                    {/* Sparkles for selected */}
                    {selected && unlocked && (
                      <>
                        <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-300 animate-pulse" />
                        <Sparkles className="absolute bottom-2 left-2 w-6 h-6 text-pink-300 animate-pulse" />
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Level Info Panel */}
            <motion.div 
              className="flex flex-col items-center gap-6 p-8 sm:p-10 bg-white/20 backdrop-blur-xl rounded-[40px] border-4 border-white/50 shadow-[0_10px_40px_rgba(236,72,153,0.4),inset_0_4px_20px_rgba(255,255,255,0.3)] max-w-[800px] mx-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              {/* Floating flowers around panel */}
              <motion.div
                className="absolute -top-6 left-[20%] text-4xl"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🌹
              </motion.div>
              <motion.div
                className="absolute -top-6 right-[20%] text-4xl"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                🌺
              </motion.div>

              <div className="text-center space-y-3">
                <motion.p 
                  className="text-4xl sm:text-5xl font-fredoka font-black bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Level {currentLevel}
                </motion.p>
                <motion.p 
                  className="text-2xl sm:text-3xl font-comic text-white font-black flex items-center justify-center gap-2 drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span>Phần thưởng:</span>
                  <span className="text-yellow-300">{getCoinReward(currentLevel)}</span>
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🪙
                  </motion.span>
                </motion.p>
                <p className="text-lg sm:text-xl text-white/90 font-comic drop-shadow-md">
                  🌈 Độ khó: +{(currentLevel - 1) * 5}% so với Level 1
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onStartGame}
                  size="lg"
                  className="w-full sm:w-auto font-fredoka font-black text-3xl sm:text-4xl px-16 sm:px-20 py-10 sm:py-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-500 shadow-[0_10px_40px_rgba(236,72,153,0.6),0_0_60px_rgba(168,85,247,0.5)] hover:shadow-[0_15px_60px_rgba(236,72,153,0.8),0_0_100px_rgba(168,85,247,0.7)] transform transition-all duration-300 rounded-[40px] border-4 border-white/50 text-white"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mr-3"
                  >
                    🚀
                  </motion.span>
                  Bắt Đầu Chơi!
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="ml-3"
                  >
                    ✨
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          </Card>
        </motion.div>
      </div>

      <style>{`
        @keyframes parallax {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};
