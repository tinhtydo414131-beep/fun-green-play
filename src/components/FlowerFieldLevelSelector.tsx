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
        background: 'linear-gradient(180deg, #87CEEB 0%, #98D8E8 30%, #B4E7CE 60%, #90EE90 100%)',
      }}
    >
      {/* Morning mist overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.6) 0%, transparent 70%)',
          animation: 'mist 15s ease-in-out infinite',
        }}
      />
      
      {/* Grass and flowers at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-green-500/60 to-transparent">
        <motion.div className="absolute bottom-4 left-[10%] text-4xl" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>🌸</motion.div>
        <motion.div className="absolute bottom-6 left-[25%] text-5xl" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>🌺</motion.div>
        <motion.div className="absolute bottom-3 left-[40%] text-4xl" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>🌻</motion.div>
        <motion.div className="absolute bottom-5 left-[55%] text-5xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 2.8, repeat: Infinity }}>🌷</motion.div>
        <motion.div className="absolute bottom-4 left-[70%] text-4xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.3, repeat: Infinity }}>🌹</motion.div>
        <motion.div className="absolute bottom-7 left-[85%] text-5xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2.6, repeat: Infinity }}>💐</motion.div>
      </div>

      {/* BIG HAPPY SUNRISE SUN - Top Right */}
      <motion.div
        className="absolute top-4 right-8 sm:top-6 sm:right-12 z-5"
        animate={{ 
          rotate: [0, 3, -3, 0],
          scale: [1, 1.03, 1]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Sun glow aura */}
        <div className="relative">
          <motion.div 
            className="absolute -inset-8 rounded-full bg-gradient-to-br from-yellow-200 via-orange-200 to-yellow-300 blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          {/* Main sun body */}
          <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-yellow-100 via-yellow-300 to-orange-400 shadow-[0_0_80px_rgba(251,191,36,1),0_0_120px_rgba(251,146,60,0.7)]">
            {/* Shiny spots on sun */}
            <div className="absolute top-6 left-8 w-6 h-6 bg-white/60 rounded-full blur-sm" />
            <div className="absolute top-10 right-10 w-4 h-4 bg-white/50 rounded-full blur-sm" />
            
            {/* BIG SPARKLING EYES */}
            <motion.div 
              className="absolute top-[35%] left-[22%] sm:top-12 sm:left-10"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            >
              <div className="relative w-5 h-6 sm:w-6 sm:h-7 bg-black rounded-full">
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </motion.div>
            <motion.div 
              className="absolute top-[35%] right-[22%] sm:top-12 sm:right-10"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            >
              <div className="relative w-5 h-6 sm:w-6 sm:h-7 bg-black rounded-full">
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </motion.div>
            
            {/* Cute little nose */}
            <div className="absolute top-[52%] sm:top-[54%] left-1/2 -translate-x-1/2 w-2 h-3 sm:w-3 sm:h-4 bg-orange-700 rounded-full" />
            
            {/* BIG HAPPY SMILE - Toe toét */}
            <motion.div 
              className="absolute bottom-[22%] sm:bottom-8 left-1/2 -translate-x-1/2 w-14 h-9 sm:w-20 sm:h-12 border-b-[5px] border-black rounded-b-full"
              animate={{ 
                scaleX: [1, 1.15, 1],
                scaleY: [1, 1.1, 1]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            {/* Smile corners - rosy cheeks effect */}
            <div className="absolute bottom-[28%] sm:bottom-10 left-[15%] w-4 h-2 sm:w-5 sm:h-3 bg-pink-400/60 rounded-full blur-sm" />
            <div className="absolute bottom-[28%] sm:bottom-10 right-[15%] w-4 h-2 sm:w-5 sm:h-3 bg-pink-400/60 rounded-full blur-sm" />
            
            {/* SUN RAYS - 12 rays */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 sm:w-2 h-8 sm:h-12 bg-gradient-to-b from-yellow-300 via-yellow-400 to-transparent rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                  transform: `rotate(${i * 30}deg) translate(${window.innerWidth < 640 ? '58px' : '85px'}, -4px)`,
                }}
                animate={{ 
                  height: [32, 48, 32],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* COLORFUL FLOWERS around Sun - Floating */}
      <motion.div className="absolute top-[8%] right-[28%] text-3xl sm:text-4xl" animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }} transition={{ duration: 3, repeat: Infinity }}>🌸</motion.div>
      <motion.div className="absolute top-[5%] right-[22%] text-4xl sm:text-5xl" animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>🌺</motion.div>
      <motion.div className="absolute top-[15%] right-[35%] text-3xl sm:text-4xl" animate={{ y: [0, -10, 0], x: [0, 5, 0] }} transition={{ duration: 2.8, repeat: Infinity }}>🌻</motion.div>
      <motion.div className="absolute top-[12%] right-[15%] text-4xl sm:text-5xl" animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 4, repeat: Infinity }}>🌷</motion.div>
      <motion.div className="absolute top-[22%] right-[40%] text-3xl sm:text-4xl" animate={{ scale: [1, 1.15, 1], y: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity }}>🌹</motion.div>
      <motion.div className="absolute top-[18%] right-[8%] text-4xl sm:text-5xl" animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 3.8, repeat: Infinity }}>💐</motion.div>
      <motion.div className="absolute top-[25%] right-[25%] text-3xl sm:text-4xl" animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3.3, repeat: Infinity }}>🏵️</motion.div>
      <motion.div className="absolute top-[28%] right-[12%] text-4xl sm:text-5xl" animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 4.2, repeat: Infinity }}>🌼</motion.div>

      {/* MORE SCATTERED FLOWERS - All around */}
      <motion.div className="absolute top-[15%] left-[8%] text-3xl sm:text-4xl" animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>🌸</motion.div>
      <motion.div className="absolute top-[12%] left-[20%] text-4xl sm:text-5xl" animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>🌺</motion.div>
      <motion.div className="absolute top-[25%] left-[5%] text-3xl sm:text-4xl" animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>🌻</motion.div>
      <motion.div className="absolute top-[35%] left-[12%] text-4xl sm:text-5xl" animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>🌷</motion.div>
      <motion.div className="absolute top-[48%] left-[7%] text-3xl sm:text-4xl" animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>🌹</motion.div>
      
      <motion.div className="absolute top-[38%] right-[6%] text-4xl sm:text-5xl" animate={{ y: [0, -7, 0], rotate: [0, -10, 0] }} transition={{ duration: 3.8, repeat: Infinity }}>🌼</motion.div>
      <motion.div className="absolute top-[52%] right-[12%] text-3xl sm:text-4xl" animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.08, 1] }} transition={{ duration: 4, repeat: Infinity }}>🌸</motion.div>
      
      <motion.div className="absolute bottom-[35%] left-[18%] text-4xl sm:text-5xl" animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3.5, repeat: Infinity }}>🌻</motion.div>
      <motion.div className="absolute bottom-[38%] right-[15%] text-3xl sm:text-4xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>🌷</motion.div>

      {/* CUTE CLOUDS with Faces - Moving slowly */}
      <motion.div
        className="absolute top-12 left-[8%] z-10"
        animate={{ x: [0, 60, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative text-6xl sm:text-7xl">☁️
          <div className="absolute top-[45%] left-[40%] flex gap-2 text-black">
            <div className="w-1.5 h-2 bg-black rounded-full" />
            <div className="w-1.5 h-2 bg-black rounded-full" />
          </div>
          <div className="absolute top-[58%] left-[45%] w-3 h-1.5 border-b-2 border-black rounded-b-full" />
        </div>
      </motion.div>
      
      <motion.div
        className="absolute top-16 left-[30%] z-10"
        animate={{ x: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative text-5xl sm:text-6xl opacity-80">☁️
          <div className="absolute top-[45%] left-[40%] flex gap-1.5 text-black">
            <div className="w-1 h-1.5 bg-black rounded-full" />
            <div className="w-1 h-1.5 bg-black rounded-full" />
          </div>
          <div className="absolute top-[58%] left-[43%] w-2.5 h-1 border-b-2 border-black rounded-b-full" />
        </div>
      </motion.div>
      
      <motion.div
        className="absolute top-8 right-[45%] z-10"
        animate={{ x: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative text-6xl sm:text-7xl opacity-90">☁️
          <div className="absolute top-[45%] left-[38%] flex gap-2 text-black">
            <div className="w-1.5 h-2 bg-black rounded-full" />
            <div className="w-1.5 h-2 bg-black rounded-full" />
          </div>
          <div className="absolute top-[58%] left-[43%] w-3 h-1.5 border-b-2 border-black rounded-b-full" />
        </div>
      </motion.div>
      
      <motion.div
        className="absolute top-20 left-[55%] z-10"
        animate={{ x: [0, -45, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative text-5xl sm:text-6xl opacity-75">☁️
          <div className="absolute top-[45%] left-[40%] flex gap-1.5 text-black">
            <div className="w-1 h-1.5 bg-black rounded-full" />
            <div className="w-1 h-1.5 bg-black rounded-full" />
          </div>
          <div className="absolute top-[58%] left-[45%] w-2.5 h-1 border-b-2 border-black rounded-b-full" />
        </div>
      </motion.div>


      {/* Rainbow */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-7xl sm:text-8xl opacity-20">
        🌈
      </div>

      {/* BUTTERFLY PARTICLE SYSTEM - Natural curved flight paths */}
      {/* Butterfly 1 - Large figure-8 pattern */}
      <motion.div
        className="absolute text-4xl sm:text-5xl z-20"
        style={{ left: '15%', top: '20%' }}
        animate={{ 
          x: [0, 120, 180, 120, 0, -80, -120, -80, 0],
          y: [0, -60, 0, 60, 80, 60, 0, -60, 0],
          rotate: [0, 15, 30, 15, 0, -15, -30, -15, 0]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.div>
      
      {/* Butterfly 2 - Diagonal swooping */}
      <motion.div
        className="absolute text-4xl sm:text-5xl z-20"
        style={{ right: '20%', top: '25%' }}
        animate={{ 
          x: [0, -100, -140, -100, -60, 0],
          y: [0, 80, 120, 60, 20, 0],
          rotate: [0, -20, -10, 10, 20, 0],
          scale: [1, 1.1, 1.2, 1.1, 1, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.div>

      {/* Butterfly 3 - Spiral pattern */}
      <motion.div
        className="absolute text-3xl sm:text-4xl z-20"
        style={{ left: '40%', top: '15%' }}
        animate={{ 
          x: [0, 60, 80, 60, 0, -60, -80, -60, 0],
          y: [0, 40, 80, 120, 100, 80, 40, 0, 0],
          rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        🦋
      </motion.div>

      {/* Butterfly 4 - Wave pattern across top */}
      <motion.div
        className="absolute text-4xl sm:text-5xl z-20"
        style={{ left: '10%', top: '30%' }}
        animate={{ 
          x: [0, 200, 400, 600, 400, 200, 0],
          y: [0, -40, -60, -40, 0, 40, 0],
          rotate: [0, 10, -10, 10, -10, 5, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.div>

      {/* Butterfly 5 - Small circles */}
      <motion.div
        className="absolute text-3xl sm:text-4xl z-20"
        style={{ left: '70%', top: '35%' }}
        animate={{ 
          x: [0, 40, 40, 0, -40, -40, 0],
          y: [0, -40, -80, -100, -80, -40, 0],
          rotate: [0, 30, 60, 90, 120, 150, 180]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.div>

      {/* Butterfly 6 - Bottom corner sweep */}
      <motion.div
        className="absolute text-4xl sm:text-5xl z-20"
        style={{ left: '5%', bottom: '25%' }}
        animate={{ 
          x: [0, 150, 200, 150, 0],
          y: [0, -80, -120, -80, 0],
          rotate: [0, 15, 0, -15, 0],
          scale: [1, 1.15, 1, 1.15, 1]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.div>

      {/* BEE PARTICLE SYSTEM - Busy zigzag patterns */}
      {/* Bee 1 - Fast zigzag */}
      <motion.div
        className="absolute text-3xl sm:text-4xl z-20"
        style={{ left: '25%', top: '40%' }}
        animate={{ 
          x: [0, 80, 40, 120, 60, 140, 80, 0],
          y: [0, 30, -20, 40, -30, 20, -10, 0],
          rotate: [0, 10, -10, 10, -10, 10, -10, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        🐝
      </motion.div>

      {/* Bee 2 - Figure-8 near flowers */}
      <motion.div
        className="absolute text-3xl sm:text-4xl z-20"
        style={{ right: '15%', top: '45%' }}
        animate={{ 
          x: [0, -60, -80, -60, 0, 60, 80, 60, 0],
          y: [0, 40, 0, -40, -60, -40, 0, 40, 0],
          rotate: [0, 15, 30, 15, 0, -15, -30, -15, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        🐝
      </motion.div>

      {/* Bee 3 - Horizontal patrol */}
      <motion.div
        className="absolute text-3xl sm:text-4xl z-20"
        style={{ left: '30%', top: '50%' }}
        animate={{ 
          x: [0, 300, 500, 300, 0],
          y: [0, -20, 0, 20, 0],
          rotate: [0, 5, 0, -5, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        🐝
      </motion.div>

      {/* Bee 4 - Small rapid circles */}
      <motion.div
        className="absolute text-2xl sm:text-3xl z-20"
        style={{ left: '55%', top: '42%' }}
        animate={{ 
          x: [0, 30, 30, 0, -30, -30, 0],
          y: [0, -30, -60, -70, -60, -30, 0],
          rotate: [0, 45, 90, 135, 180, 225, 270]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        🐝
      </motion.div>

      {/* Bee 5 - Diagonal sweep */}
      <motion.div
        className="absolute text-3xl sm:text-4xl z-20"
        style={{ left: '10%', top: '55%' }}
        animate={{ 
          x: [0, 150, 250, 150, 0],
          y: [0, -100, -150, -100, 0],
          rotate: [0, 20, 10, -10, 0]
        }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      >
        🐝
      </motion.div>

      {/* Bee 6 - Near sun patrol */}
      <motion.div
        className="absolute text-3xl sm:text-4xl z-20"
        style={{ right: '25%', top: '18%' }}
        animate={{ 
          x: [0, -50, -80, -50, 0, 50, 80, 50, 0],
          y: [0, 30, 50, 30, 0, -30, -50, -30, 0],
          rotate: [0, -15, -30, -15, 0, 15, 30, 15, 0]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      >
        🐝
      </motion.div>

      {/* Bee 7 - Bottom wanderer */}
      <motion.div
        className="absolute text-3xl sm:text-4xl z-20"
        style={{ left: '45%', bottom: '20%' }}
        animate={{ 
          x: [0, 100, 150, 100, 0, -100, -150, -100, 0],
          y: [0, -50, -80, -50, 0, -50, -80, -50, 0],
          rotate: [0, 10, 0, -10, 0, 10, 0, -10, 0]
        }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
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
            {/* Falling flowers decoration - from title */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl sm:text-3xl pointer-events-none"
                style={{ 
                  left: `${(i + 1) * 8}%`,
                  top: '-50px'
                }}
                animate={{ 
                  y: [0, 850],
                  rotate: [0, 360],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: 7 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.6,
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
                <h2 className="text-[48px] sm:text-6xl font-fredoka font-black bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(255,105,180,0.8)] animate-pulse">
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
                      scale: 1.18,
                      rotate: [0, -5, 5, -5, 0],
                      transition: { duration: 0.4 }
                    } : {}}
                    onHoverStart={() => {
                      // Flower bloom effect on hover - handled by CSS
                    }}
                    whileTap={unlocked ? { scale: 0.95 } : {}}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-full transition-all duration-500 group",
                      "w-[130px] h-[130px] sm:w-[150px] sm:h-[150px]",
                      "border-4 border-white/30",
                      unlocked && "bg-gradient-to-br from-pink-300 via-fuchsia-400 to-cyan-300 shadow-[0_8px_35px_rgba(236,72,153,0.7),0_0_60px_rgba(168,85,247,0.6),inset_0_3px_20px_rgba(255,255,255,0.6)] hover:shadow-[0_15px_60px_rgba(236,72,153,1),0_0_100px_rgba(168,85,247,0.9),0_0_40px_rgba(255,255,255,0.8)] hover:scale-110 hover:border-white/60",
                      selected && unlocked && "scale-115 animate-pulse shadow-[0_0_80px_rgba(236,72,153,1),0_0_120px_rgba(168,85,247,0.9)]",
                      !unlocked && "bg-gradient-to-br from-gray-300 to-gray-200 cursor-not-allowed opacity-40"
                    )}
                  >

                    {/* Glowing aura for all levels */}
                    {unlocked && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-60 animate-pulse" />
                        <motion.div 
                          className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-300/60 via-fuchsia-300/60 to-cyan-300/60 blur-xl"
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.6, 0.9, 0.6]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </>
                    )}

                    {/* Flower border around levels - blooms on hover */}
                    {unlocked ? (
                      <>
                        <motion.div 
                          className="absolute -top-3 -left-3 text-2xl sm:text-3xl transition-all duration-300 group-hover:text-4xl group-hover:sm:text-5xl"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          🌸
                        </motion.div>
                        <motion.div 
                          className="absolute -top-3 -right-3 text-2xl sm:text-3xl transition-all duration-300 group-hover:text-4xl group-hover:sm:text-5xl"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          🌺
                        </motion.div>
                        <motion.div 
                          className="absolute -bottom-3 -left-3 text-2xl sm:text-3xl transition-all duration-300 group-hover:text-4xl group-hover:sm:text-5xl"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          🌻
                        </motion.div>
                        <motion.div 
                          className="absolute -bottom-3 -right-3 text-2xl sm:text-3xl transition-all duration-300 group-hover:text-4xl group-hover:sm:text-5xl"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          🌷
                        </motion.div>
                        {/* Extra flowers on sides - appear on hover */}
                        <motion.div 
                          className="absolute top-1/2 -left-4 text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          🌹
                        </motion.div>
                        <motion.div 
                          className="absolute top-1/2 -right-4 text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                          💐
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <div className="absolute -top-3 -left-3 text-xl sm:text-2xl opacity-30">🌸</div>
                        <div className="absolute -top-3 -right-3 text-xl sm:text-2xl opacity-30">🌺</div>
                        <div className="absolute -bottom-3 -left-3 text-xl sm:text-2xl opacity-30">🌻</div>
                        <div className="absolute -bottom-3 -right-3 text-xl sm:text-2xl opacity-30">🌷</div>
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
                  className="w-full sm:w-auto font-fredoka font-black text-3xl sm:text-4xl px-16 sm:px-20 py-10 sm:py-12 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-300 hover:from-pink-500 hover:via-fuchsia-500 hover:to-cyan-400 shadow-[0_10px_40px_rgba(236,72,153,0.8),0_0_60px_rgba(168,85,247,0.7)] hover:shadow-[0_15px_60px_rgba(236,72,153,1),0_0_100px_rgba(168,85,247,0.9)] transform transition-all duration-300 rounded-[40px] border-4 border-white/50 text-white"
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
        @keyframes mist {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
};
