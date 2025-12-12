import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Check, Clock } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { CROPS, ANIMALS, BUILDINGS } from '@/data/harvestHavenData';
import { toast } from 'sonner';

interface AutoHarvestPanelProps {
  onClose: () => void;
}

export const AutoHarvestPanel: React.FC<AutoHarvestPanelProps> = ({ onClose }) => {
  const { 
    plantedCrops, 
    ownedAnimals, 
    placedBuildings,
    harvestCrop, 
    collectAnimalProduct,
    addToInventory,
    level,
    gems,
    spendGems,
  } = useHarvestHavenStore();
  
  const [autoHarvestEnabled, setAutoHarvestEnabled] = useState(false);
  const [lastAutoHarvest, setLastAutoHarvest] = useState<number>(0);
  
  // Find all ready crops
  const readyCrops = plantedCrops.filter((crop) => {
    const cropData = CROPS.find((c) => c.id === crop.cropId);
    if (!cropData) return false;
    return Date.now() - crop.plantedAt >= cropData.growTime * 1000 && !crop.harvested;
  });
  
  // Find all ready animal products
  const readyAnimals = ownedAnimals.filter((animal) => {
    const animalData = ANIMALS.find((a) => a.id === animal.animalId);
    if (!animalData) return false;
    return Date.now() - animal.lastProduced >= animalData.produceTime * 1000;
  });
  
  // Auto-harvest effect
  useEffect(() => {
    if (autoHarvestEnabled) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now - lastAutoHarvest >= 10000) { // Every 10 seconds
          let harvested = 0;
          
          // Auto-harvest crops
          readyCrops.forEach((crop) => {
            harvestCrop(crop.id);
            harvested++;
          });
          
          // Auto-collect animal products
          readyAnimals.forEach((animal) => {
            collectAnimalProduct(animal.id);
            harvested++;
          });
          
          if (harvested > 0) {
            toast.success(`Auto-harvested ${harvested} items!`, { icon: '🤖' });
          }
          
          setLastAutoHarvest(now);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [autoHarvestEnabled, lastAutoHarvest, readyCrops, readyAnimals, harvestCrop, collectAnimalProduct]);
  
  const handleHarvestAll = () => {
    let harvested = 0;
    
    readyCrops.forEach((crop) => {
      const cropData = CROPS.find((c) => c.id === crop.cropId);
      if (cropData) {
        harvestCrop(crop.id);
        harvested++;
      }
    });
    
    readyAnimals.forEach((animal) => {
      collectAnimalProduct(animal.id);
      harvested++;
    });
    
    if (harvested > 0) {
      toast.success(`Harvested ${harvested} items!`, { icon: '🌾' });
    } else {
      toast.info('Nothing to harvest yet!');
    }
    
    onClose();
  };
  
  const toggleAutoHarvest = () => {
    if (!autoHarvestEnabled) {
      if (level < 5) {
        toast.error('Auto-harvest unlocks at level 5!');
        return;
      }
      if (gems < 5) {
        toast.error('Need 5 gems to enable auto-harvest!');
        return;
      }
      spendGems(5);
      setAutoHarvestEnabled(true);
      toast.success('Auto-harvest enabled for 10 minutes!', { icon: '🤖' });
      
      // Disable after 10 minutes
      setTimeout(() => {
        setAutoHarvestEnabled(false);
        toast.info('Auto-harvest expired');
      }, 600000);
    } else {
      setAutoHarvestEnabled(false);
      toast.info('Auto-harvest disabled');
    }
  };
  
  // Calculate time until next harvest
  const getNextHarvestTime = () => {
    const pendingCrops = plantedCrops.filter((crop) => {
      const cropData = CROPS.find((c) => c.id === crop.cropId);
      if (!cropData) return false;
      return Date.now() - crop.plantedAt < cropData.growTime * 1000 && !crop.harvested;
    });
    
    if (pendingCrops.length === 0) return null;
    
    const nextCrop = pendingCrops.reduce((min, crop) => {
      const cropData = CROPS.find((c) => c.id === crop.cropId);
      if (!cropData) return min;
      const remaining = (crop.plantedAt + cropData.growTime * 1000) - Date.now();
      return remaining < min ? remaining : min;
    }, Infinity);
    
    return Math.ceil(nextCrop / 1000);
  };
  
  const nextHarvestSeconds = getNextHarvestTime();
  
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              Harvest Manager
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Ready Items Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-3xl mb-1">🌱</div>
              <div className="text-2xl font-bold text-green-600">{readyCrops.length}</div>
              <div className="text-xs text-gray-600">Crops Ready</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-3xl mb-1">🥚</div>
              <div className="text-2xl font-bold text-amber-600">{readyAnimals.length}</div>
              <div className="text-xs text-gray-600">Products Ready</div>
            </div>
          </div>
          
          {/* Next Harvest Timer */}
          {nextHarvestSeconds !== null && (
            <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-600">Next harvest in</div>
                <div className="font-bold text-blue-600">
                  {nextHarvestSeconds > 60 
                    ? `${Math.floor(nextHarvestSeconds / 60)}m ${nextHarvestSeconds % 60}s`
                    : `${nextHarvestSeconds}s`
                  }
                </div>
              </div>
            </div>
          )}
          
          {/* Harvest All Button */}
          <motion.button
            onClick={handleHarvestAll}
            disabled={readyCrops.length === 0 && readyAnimals.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
              readyCrops.length > 0 || readyAnimals.length > 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" />
            Harvest All ({readyCrops.length + readyAnimals.length})
          </motion.button>
          
          {/* Auto-Harvest Toggle */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  🤖 Auto-Harvest
                  {level < 5 && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Lvl 5</span>}
                </div>
                <div className="text-xs text-gray-500">Automatically collect ready items</div>
              </div>
              <button
                onClick={toggleAutoHarvest}
                className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1 ${
                  autoHarvestEnabled
                    ? 'bg-green-500 text-white'
                    : level >= 5
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {autoHarvestEnabled ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Active
                  </>
                ) : (
                  <>
                    💎 5 Gems
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
