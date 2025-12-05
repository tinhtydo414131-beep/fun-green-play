import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityCreatorStore } from '@/stores/cityCreatorStore';
import { BUILDING_CONFIGS } from '@/utils/cityCreatorConfig';
import type { BuildingType, ResourceType } from '@/types/cityCreatorRPG';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BuildingToolbarProps {
  selectedBuilding: BuildingType | null;
  onSelectBuilding: (type: BuildingType | null) => void;
}

export const BuildingToolbar: React.FC<BuildingToolbarProps> = ({
  selectedBuilding,
  onSelectBuilding,
}) => {
  const { hero, resources } = useCityCreatorStore();

  const canAfford = (type: BuildingType) => {
    const config = BUILDING_CONFIGS[type];
    return Object.entries(config.cost).every(
      ([res, amount]) => resources[res as ResourceType] >= (amount || 0)
    );
  };

  const isUnlocked = (type: BuildingType) => {
    return BUILDING_CONFIGS[type].unlockLevel <= hero.level;
  };

  const buildingCategories = {
    '🏠 Housing': ['house', 'tavern', 'castle'] as BuildingType[],
    '🌾 Production': ['farm', 'mine', 'warehouse', 'windmill'] as BuildingType[],
    '💰 Commerce': ['shop', 'market', 'bakery'] as BuildingType[],
    '🛡️ Defense': ['wall', 'tower', 'barracks', 'blacksmith'] as BuildingType[],
    '🏛️ Special': ['park', 'fountain', 'library', 'school', 'hospital', 'temple', 'statue'] as BuildingType[],
  };

  return (
    <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-2xl p-3 shadow-xl border-4 border-amber-300">
      <h3 className="font-bold text-center mb-2 text-amber-800">🏗️ Buildings</h3>
      
      <ScrollArea className="h-[400px] pr-2">
        {Object.entries(buildingCategories).map(([category, types]) => (
          <div key={category} className="mb-4">
            <h4 className="text-xs font-bold text-amber-700 mb-2">{category}</h4>
            <div className="grid grid-cols-2 gap-2">
              {types.map((type) => {
                const config = BUILDING_CONFIGS[type];
                const unlocked = isUnlocked(type);
                const affordable = canAfford(type);
                const isSelected = selectedBuilding === type;

                return (
                  <motion.button
                    key={type}
                    onClick={() => onSelectBuilding(isSelected ? null : type)}
                    disabled={!unlocked || !affordable}
                    className={`
                      relative p-2 rounded-xl transition-all text-left
                      ${isSelected 
                        ? 'bg-yellow-400 ring-2 ring-yellow-600 shadow-lg scale-105' 
                        : unlocked && affordable
                          ? 'bg-white hover:bg-yellow-100 shadow'
                          : 'bg-gray-200 opacity-60'
                      }
                    `}
                    whileHover={unlocked && affordable ? { scale: 1.02 } : {}}
                    whileTap={unlocked && affordable ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate">{config.name}</p>
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {Object.entries(config.cost).map(([res, amount]) => (
                            <span
                              key={res}
                              className={`
                                ${resources[res as ResourceType] >= (amount || 0) 
                                  ? 'text-green-600' 
                                  : 'text-red-500'
                                }
                              `}
                            >
                              {res === 'wood' && '🪵'}
                              {res === 'stone' && '🪨'}
                              {res === 'gold' && '💰'}
                              {res === 'food' && '🍞'}
                              {amount}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lock Overlay */}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xs font-bold">🔒 Lv{config.unlockLevel}</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Selected Building Info */}
      <AnimatePresence>
        {selectedBuilding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 p-3 bg-yellow-300 rounded-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{BUILDING_CONFIGS[selectedBuilding].emoji}</span>
              <div>
                <p className="font-bold">{BUILDING_CONFIGS[selectedBuilding].name}</p>
                <p className="text-xs text-amber-800">{BUILDING_CONFIGS[selectedBuilding].description}</p>
              </div>
            </div>
            <button
              onClick={() => onSelectBuilding(null)}
              className="w-full mt-2 py-1 bg-white/50 rounded-lg text-sm font-bold hover:bg-white/80 transition-colors"
            >
              ❌ Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
