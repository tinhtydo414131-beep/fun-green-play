import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { BUILDINGS, CROPS } from '@/data/harvestHavenData';
import { GameHUD } from './GameHUD';
import { GameToolbar } from './GameToolbar';
import { GameMap } from './GameMap';
import { BuildMenu } from './BuildMenu';
import { OrdersPanel } from './OrdersPanel';
import { InventoryPanel } from './InventoryPanel';
import { CropSelector } from './CropSelector';
import { TutorialModal } from './TutorialModal';
import { SettingsModal } from './SettingsModal';
import { toast } from 'sonner';

interface HarvestHavenProps {
  onBack?: () => void;
}

export const HarvestHaven: React.FC<HarvestHavenProps> = ({ onBack }) => {
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [buildCategory, setBuildCategory] = useState('farm');
  const [showOrders, setShowOrders] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCropSelector, setShowCropSelector] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  const {
    showTutorial,
    selectedTool,
    selectedBuildingId,
    setSelectedTool,
    setSelectedBuildingId,
    placeBuilding,
    plantCrop,
    harvestCrop,
    collectAnimalProduct,
    removeBuilding,
    placedBuildings,
    plantedCrops,
    ownedAnimals,
    regenerateEnergy,
    generateNewOrder,
    activeOrders,
    level,
  } = useHarvestHavenStore();
  
  // Regenerate energy periodically
  useEffect(() => {
    const interval = setInterval(() => {
      regenerateEnergy();
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [regenerateEnergy]);
  
  // Generate orders if needed
  useEffect(() => {
    if (activeOrders.length < 3) {
      generateNewOrder();
    }
  }, [activeOrders.length, generateNewOrder]);
  
  const handleTileClick = useCallback((x: number, y: number) => {
    if (selectedTool === 'build' && selectedBuildingId) {
      const building = BUILDINGS.find((b) => b.id === selectedBuildingId);
      if (!building) return;
      
      // Check if space is available
      const isOccupied = placedBuildings.some((pb) => {
        const b = BUILDINGS.find((bd) => bd.id === pb.buildingId);
        if (!b) return false;
        return (
          x < pb.x + b.width && x + building.width > pb.x &&
          y < pb.y + b.height && y + building.height > pb.y
        );
      });
      
      if (isOccupied) {
        toast.error('Space is occupied!');
        return;
      }
      
      const success = placeBuilding(selectedBuildingId, x, y);
      if (success) {
        toast.success(`Built ${building.name}!`, { icon: building.emoji });
      } else {
        toast.error('Not enough coins!');
      }
    }
  }, [selectedTool, selectedBuildingId, placedBuildings, placeBuilding]);
  
  const handleBuildingClick = useCallback((buildingPlacedId: string) => {
    const placed = placedBuildings.find((b) => b.id === buildingPlacedId);
    if (!placed) return;
    
    const building = BUILDINGS.find((b) => b.id === placed.buildingId);
    if (!building) return;
    
    if (selectedTool === 'demolish') {
      removeBuilding(buildingPlacedId);
      toast.success(`Removed ${building.name}`, { icon: '🗑️' });
      return;
    }
    
    if (selectedTool === 'harvest') {
      // Check for ready crops
      const fieldCrops = plantedCrops.filter(
        (c) => c.fieldId === buildingPlacedId && !c.harvested
      );
      
      for (const crop of fieldCrops) {
        const cropData = CROPS.find((c) => c.id === crop.cropId);
        if (!cropData) continue;
        
        const elapsed = Date.now() - crop.plantedAt;
        if (elapsed >= cropData.growTime * 1000) {
          harvestCrop(crop.id);
          toast.success(`Harvested ${cropData.name}!`, { icon: cropData.emoji });
        }
      }
      
      // Check for ready animal products
      const penAnimals = ownedAnimals.filter((a) => a.penId === buildingPlacedId);
      for (const animal of penAnimals) {
        if (collectAnimalProduct(animal.id)) {
          toast.success('Collected product!', { icon: '🎁' });
        }
      }
      
      return;
    }
    
    // Select tool - show options based on building type
    if (selectedTool === 'select') {
      if (building.id === 'field') {
        // Check if field has a crop
        const existingCrop = plantedCrops.find(
          (c) => c.fieldId === buildingPlacedId && !c.harvested
        );
        
        if (!existingCrop) {
          setSelectedFieldId(buildingPlacedId);
          setShowCropSelector(true);
        } else {
          const cropData = CROPS.find((c) => c.id === existingCrop.cropId);
          if (cropData) {
            const elapsed = Date.now() - existingCrop.plantedAt;
            const remaining = Math.max(0, cropData.growTime * 1000 - elapsed);
            
            if (remaining > 0) {
              const seconds = Math.ceil(remaining / 1000);
              toast.info(`${cropData.emoji} ${cropData.name}: ${seconds}s remaining`);
            } else {
              toast.info(`${cropData.emoji} ${cropData.name} is ready to harvest!`);
            }
          }
        }
      }
    }
  }, [selectedTool, placedBuildings, plantedCrops, ownedAnimals, removeBuilding, harvestCrop, collectAnimalProduct]);
  
  const handleCropSelect = useCallback((cropId: string) => {
    if (selectedFieldId) {
      const success = plantCrop(cropId, selectedFieldId);
      if (success) {
        const crop = CROPS.find((c) => c.id === cropId);
        toast.success(`Planted ${crop?.name}!`, { icon: crop?.emoji });
      }
    }
    setShowCropSelector(false);
    setSelectedFieldId(null);
  }, [selectedFieldId, plantCrop]);
  
  const handleBuildSelect = useCallback((buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedTool('build');
    setShowBuildMenu(false);
    toast.info('Tap on the map to place the building');
  }, [setSelectedBuildingId, setSelectedTool]);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-sky-200 overflow-hidden">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-30 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      )}
      
      {/* Game Map */}
      <GameMap onTileClick={handleTileClick} onBuildingClick={handleBuildingClick} />
      
      {/* HUD */}
      <GameHUD onOpenSettings={() => setShowSettings(true)} />
      
      {/* Toolbar */}
      <GameToolbar
        onOpenBuildMenu={(category) => {
          setBuildCategory(category);
          setShowBuildMenu(true);
        }}
        onOpenOrders={() => setShowOrders(true)}
        onOpenInventory={() => setShowInventory(true)}
      />
      
      {/* Modals */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialModal onComplete={() => {}} />
        )}
        
        {showBuildMenu && (
          <BuildMenu
            category={buildCategory}
            onClose={() => setShowBuildMenu(false)}
            onSelect={handleBuildSelect}
          />
        )}
        
        {showOrders && (
          <OrdersPanel onClose={() => setShowOrders(false)} />
        )}
        
        {showInventory && (
          <InventoryPanel onClose={() => setShowInventory(false)} />
        )}
        
        {showCropSelector && selectedFieldId && (
          <CropSelector
            fieldId={selectedFieldId}
            onClose={() => {
              setShowCropSelector(false);
              setSelectedFieldId(null);
            }}
            onSelect={handleCropSelect}
          />
        )}
        
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
      
      {/* Level Up Celebration */}
      <LevelUpCelebration />
    </div>
  );
};

// Level up celebration component
const LevelUpCelebration: React.FC = () => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [celebratedLevel, setCelebratedLevel] = useState(1);
  const { level } = useHarvestHavenStore();
  
  useEffect(() => {
    if (level > celebratedLevel) {
      setShowLevelUp(true);
      setCelebratedLevel(level);
      
      setTimeout(() => {
        setShowLevelUp(false);
      }, 3000);
    }
  }, [level, celebratedLevel]);
  
  if (!showLevelUp) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 0.5, repeat: 2 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-4xl font-bold text-white drop-shadow-lg">
          Level {level}!
        </h2>
        <p className="text-xl text-white/90 drop-shadow">
          Congratulations!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default HarvestHaven;
