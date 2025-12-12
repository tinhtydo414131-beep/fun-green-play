import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Coins, Star, Lock } from 'lucide-react';
import { CROPS } from '@/data/harvestHavenData';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CropSelectorProps {
  fieldId: string;
  onClose: () => void;
  onSelect: (cropId: string) => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({ fieldId, onClose, onSelect }) => {
  const { level } = useHarvestHavenStore();
  
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🌱 Choose a Crop
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Crop List */}
        <ScrollArea className="h-[55vh]">
          <div className="p-4 grid grid-cols-2 gap-3">
            {CROPS.map((crop, index) => {
              const isUnlocked = level >= crop.unlockLevel;
              
              return (
                <motion.button
                  key={crop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => isUnlocked && onSelect(crop.id)}
                  disabled={!isUnlocked}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    isUnlocked
                      ? 'border-green-400 bg-green-50 hover:bg-green-100 hover:scale-105'
                      : 'border-gray-200 bg-gray-100 opacity-60'
                  }`}
                >
                  {/* Lock Overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-2xl">
                      <div className="text-center text-white">
                        <Lock className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">Lvl {crop.unlockLevel}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Crop Icon */}
                  <div className="text-4xl mb-2">{crop.emoji}</div>
                  
                  {/* Crop Name */}
                  <h3 className="font-bold text-gray-800 text-sm">{crop.name}</h3>
                  
                  {/* Stats */}
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      {formatTime(crop.growTime)}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-yellow-600">
                      <Coins className="w-3 h-3" />
                      {crop.sellPrice}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-blue-600">
                      <Star className="w-3 h-3" />
                      +{crop.xpReward} XP
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};
