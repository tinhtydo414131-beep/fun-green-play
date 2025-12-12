import React from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Coins } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { BUILDINGS, Building } from '@/data/harvestHavenData';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BuildMenuProps {
  category: string;
  onClose: () => void;
  onSelect: (buildingId: string) => void;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({ category, onClose, onSelect }) => {
  const { level, coins } = useHarvestHavenStore();
  
  const categoryBuildings = BUILDINGS.filter((b) => b.category === category);
  
  const getCategoryTitle = () => {
    switch (category) {
      case 'farm': return '🌾 Farm Buildings';
      case 'production': return '🏭 Production';
      case 'residential': return '🏠 Housing';
      case 'commercial': return '🏪 Commercial';
      case 'decoration': return '🌳 Decorations';
      case 'landmark': return '🏰 Landmarks';
      default: return 'Buildings';
    }
  };
  
  const getCategoryColor = () => {
    switch (category) {
      case 'farm': return 'from-green-500 to-green-700';
      case 'production': return 'from-orange-500 to-orange-700';
      case 'residential': return 'from-blue-500 to-blue-700';
      case 'commercial': return 'from-pink-500 to-pink-700';
      case 'decoration': return 'from-emerald-500 to-emerald-700';
      case 'landmark': return 'from-yellow-500 to-yellow-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getCategoryColor()} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{getCategoryTitle()}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm opacity-80 mt-1">
            Tap to select, then tap on map to place
          </p>
        </div>
        
        {/* Building List */}
        <ScrollArea className="h-[60vh]">
          <div className="p-4 grid grid-cols-2 gap-3">
            {categoryBuildings.map((building) => {
              const isUnlocked = level >= building.unlockLevel;
              const canAfford = coins >= building.cost;
              
              return (
                <motion.button
                  key={building.id}
                  onClick={() => isUnlocked && onSelect(building.id)}
                  disabled={!isUnlocked}
                  whileHover={isUnlocked ? { scale: 1.02 } : {}}
                  whileTap={isUnlocked ? { scale: 0.98 } : {}}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    isUnlocked
                      ? canAfford
                        ? 'border-green-400 bg-green-50 hover:bg-green-100'
                        : 'border-amber-400 bg-amber-50'
                      : 'border-gray-300 bg-gray-100 opacity-60'
                  }`}
                >
                  {/* Lock Overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-2xl">
                      <div className="text-center text-white">
                        <Lock className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs">Level {building.unlockLevel}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Building Info */}
                  <div className="text-4xl mb-2">{building.emoji}</div>
                  <h3 className="font-bold text-gray-800 text-sm">{building.name}</h3>
                  <div className="text-xs text-gray-500">{building.width}x{building.height}</div>
                  
                  {/* Cost */}
                  <div className={`mt-2 flex items-center justify-center gap-1 text-sm font-bold ${
                    canAfford ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <Coins className="w-4 h-4" />
                    {building.cost.toLocaleString()}
                  </div>
                  
                  {/* Special Info */}
                  {building.income && (
                    <div className="mt-1 text-xs text-yellow-600">
                      💰 +{building.income}/min
                    </div>
                  )}
                  {building.produces && (
                    <div className="mt-1 text-xs text-blue-600">
                      ⚙️ Produces goods
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};
