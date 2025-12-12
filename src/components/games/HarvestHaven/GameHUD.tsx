import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Gem, Zap, Star, Trophy, Settings } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { LEVEL_THRESHOLDS } from '@/data/harvestHavenData';
import { Progress } from '@/components/ui/progress';

interface GameHUDProps {
  onOpenSettings: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ onOpenSettings }) => {
  const { coins, gems, xp, level, energy, maxEnergy } = useHarvestHavenStore();
  
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpProgress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-2 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        {/* Level & XP */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-2 sm:p-3 shadow-lg border-2 border-amber-300"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-300 flex items-center justify-center border-2 border-white shadow-inner">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
            </div>
            <div className="text-white">
              <div className="text-xs sm:text-sm font-bold">Level {level}</div>
              <div className="w-16 sm:w-24">
                <Progress value={xpProgress} className="h-2 bg-amber-700" />
              </div>
              <div className="text-[10px] sm:text-xs opacity-80">{xp}/{nextLevelXP} XP</div>
            </div>
          </div>
        </motion.div>
        
        {/* Resources */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col gap-2"
        >
          {/* Coins */}
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg border-2 border-yellow-300">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-300 flex items-center justify-center">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            </div>
            <span className="text-white font-bold text-sm sm:text-base min-w-[60px] text-right">
              {coins.toLocaleString()}
            </span>
          </div>
          
          {/* Gems */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg border-2 border-purple-300">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-300 flex items-center justify-center">
              <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
            </div>
            <span className="text-white font-bold text-sm sm:text-base min-w-[40px] text-right">
              {gems}
            </span>
          </div>
        </motion.div>
        
        {/* Energy & Settings */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-end gap-2"
        >
          {/* Energy */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg border-2 border-green-300">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-300 flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
            </div>
            <span className="text-white font-bold text-sm sm:text-base">
              {energy}/{maxEnergy}
            </span>
          </div>
          
          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30 hover:bg-white/30 transition-colors"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
