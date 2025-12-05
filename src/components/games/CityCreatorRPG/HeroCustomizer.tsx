import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityCreatorStore } from '@/stores/cityCreatorStore';
import { HERO_SKINS } from '@/utils/cityCreatorConfig';
import type { HeroSkin } from '@/types/cityCreatorRPG';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface HeroCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeroCustomizer: React.FC<HeroCustomizerProps> = ({ isOpen, onClose }) => {
  const { hero, setHeroName, setHeroSkin, unlockSkin, upgradeSkill } = useCityCreatorStore();
  const [nameInput, setNameInput] = useState(hero.name);

  const handleSkinSelect = (skin: HeroSkin) => {
    const config = HERO_SKINS[skin];
    
    if (!hero.unlockedSkins.includes(skin)) {
      if (hero.level >= config.unlockLevel) {
        unlockSkin(skin);
        setHeroSkin(skin);
        toast.success(`🎉 ${config.name} unlocked!`);
      } else {
        toast.error(`🔒 Reach level ${config.unlockLevel} to unlock!`);
      }
    } else {
      setHeroSkin(skin);
    }
  };

  const handleNameSave = () => {
    if (nameInput.trim()) {
      setHeroName(nameInput.trim());
      toast.success('Name updated!');
    }
  };

  const handleUpgradeSkill = (skill: keyof typeof hero.skills) => {
    if (hero.skills[skill] < 10) {
      upgradeSkill(skill);
      toast.success(`⬆️ ${skill.replace('_', ' ')} upgraded!`);
    }
  };

  const skillNames = {
    build_speed: { name: 'Build Speed', emoji: '🔨', desc: 'Build faster' },
    gather_boost: { name: 'Gather Boost', emoji: '⛏️', desc: 'Collect more resources' },
    defense_power: { name: 'Defense Power', emoji: '🛡️', desc: 'Stronger in battles' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-b from-purple-100 to-pink-100 rounded-3xl p-6 max-w-lg w-full shadow-2xl border-4 border-purple-300"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                🧙 Hero Profile
              </h2>
              <button
                onClick={onClose}
                className="text-2xl hover:scale-110 transition-transform"
              >
                ✖️
              </button>
            </div>

            {/* Current Hero Display */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-4 text-white text-center">
              <motion.span 
                className="text-7xl block"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {HERO_SKINS[hero.skin].emoji}
              </motion.span>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="max-w-[150px] text-center bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  placeholder="Hero name"
                />
                <button
                  onClick={handleNameSave}
                  className="px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30"
                >
                  ✅
                </button>
              </div>
              <p className="text-sm opacity-80 mt-1">Level {hero.level} • {HERO_SKINS[hero.skin].name}</p>
            </div>

            {/* Skin Selection */}
            <div className="mb-4">
              <h3 className="font-bold text-purple-700 mb-2">🎭 Choose Skin</h3>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(HERO_SKINS).map(([key, config]) => {
                  const skin = key as HeroSkin;
                  const isUnlocked = hero.unlockedSkins.includes(skin);
                  const isSelected = hero.skin === skin;
                  const canUnlock = hero.level >= config.unlockLevel;

                  return (
                    <motion.button
                      key={skin}
                      onClick={() => handleSkinSelect(skin)}
                      className={`
                        relative p-2 rounded-xl transition-all
                        ${isSelected ? 'bg-purple-400 ring-2 ring-purple-600' : 'bg-white'}
                        ${!isUnlocked && !canUnlock ? 'opacity-50' : ''}
                      `}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-3xl">{config.emoji}</span>
                      {!isUnlocked && (
                        <span className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-[10px] px-1 rounded">
                          🔒{config.unlockLevel}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="font-bold text-purple-700 mb-2">⚡ Skills</h3>
              <div className="space-y-2">
                {(Object.keys(skillNames) as Array<keyof typeof skillNames>).map((skill) => {
                  const info = skillNames[skill];
                  const level = hero.skills[skill];

                  return (
                    <div
                      key={skill}
                      className="bg-white rounded-xl p-3 flex items-center gap-3"
                    >
                      <span className="text-3xl">{info.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{info.name}</p>
                        <p className="text-xs text-gray-500">{info.desc}</p>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-4 h-2 rounded ${i < level ? 'bg-purple-500' : 'bg-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpgradeSkill(skill)}
                        disabled={level >= 10}
                        className={`
                          px-3 py-1 rounded-lg font-bold text-sm
                          ${level >= 10 
                            ? 'bg-gray-200 text-gray-500' 
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                          }
                        `}
                      >
                        {level >= 10 ? 'MAX' : '⬆️'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
