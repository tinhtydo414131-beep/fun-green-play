import React from 'react';
import { motion } from 'framer-motion';
import { useCityCreatorStore } from '@/stores/cityCreatorStore';
import { Progress } from '@/components/ui/progress';
import { HERO_SKINS } from '@/utils/cityCreatorConfig';

interface GameHUDProps {
  totalCoins: number;
  onSettingsClick: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ totalCoins, onSettingsClick }) => {
  const { hero, resources, cityScore, cityTier, population, cityName } = useCityCreatorStore();
  const skinConfig = HERO_SKINS[hero.skin];

  const tierEmoji = {
    village: '🏘️',
    town: '🏙️',
    city: '🌆',
    mega_city: '🌃',
  };

  const tierNames = {
    village: 'Village',
    town: 'Town',
    city: 'City',
    mega_city: 'Mega City',
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-3">
      <div className="flex flex-wrap items-start gap-3">
        {/* Hero Info */}
        <motion.div
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-3 shadow-xl text-white min-w-[200px]"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-4xl">{skinConfig.emoji}</span>
              <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                {hero.level}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{hero.name}</p>
              <p className="text-xs opacity-80">{skinConfig.name}</p>
              <div className="mt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>XP</span>
                  <span>{hero.xp}/{hero.xpToNext}</span>
                </div>
                <Progress value={(hero.xp / hero.xpToNext) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-3 shadow-xl"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <span className="text-2xl">🪵</span>
              <p className="font-bold text-sm">{Math.floor(resources.wood)}</p>
            </div>
            <div className="text-center">
              <span className="text-2xl">🪨</span>
              <p className="font-bold text-sm">{Math.floor(resources.stone)}</p>
            </div>
            <div className="text-center">
              <span className="text-2xl">💰</span>
              <p className="font-bold text-sm">{Math.floor(resources.gold)}</p>
            </div>
            <div className="text-center">
              <span className="text-2xl">🍞</span>
              <p className="font-bold text-sm">{Math.floor(resources.food)}</p>
            </div>
          </div>
        </motion.div>

        {/* City Score */}
        <motion.div
          className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-3 shadow-xl text-white"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tierEmoji[cityTier]}</span>
            <div>
              <p className="font-bold">{cityName}</p>
              <p className="text-xs opacity-80">{tierNames[cityTier]}</p>
              <div className="flex items-center gap-2 text-xs">
                <span>⭐ {cityScore}</span>
                <span>👥 {population}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Camly Coins */}
        <motion.div
          className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-3 shadow-xl"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl">🪙</span>
            <div>
              <p className="text-xs font-bold text-amber-800">Camly Coins</p>
              <p className="font-bold text-lg">{totalCoins.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Button */}
        <motion.button
          onClick={onSettingsClick}
          className="bg-white/90 rounded-full p-3 shadow-xl hover:bg-white transition-colors"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl">⚙️</span>
        </motion.button>
      </div>
    </div>
  );
};
