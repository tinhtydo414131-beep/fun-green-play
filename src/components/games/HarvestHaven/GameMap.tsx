import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { CROPS, BUILDINGS, ANIMALS } from '@/data/harvestHavenData';

interface GameMapProps {
  onTileClick: (x: number, y: number) => void;
  onBuildingClick: (buildingId: string) => void;
}

const TILE_SIZE = 64;
const MAP_WIDTH = 16;
const MAP_HEIGHT = 16;

// Isometric conversion helpers
const toIso = (x: number, y: number) => ({
  isoX: (x - y) * (TILE_SIZE / 2),
  isoY: (x + y) * (TILE_SIZE / 4),
});

const fromIso = (isoX: number, isoY: number) => ({
  x: Math.floor((isoX / (TILE_SIZE / 2) + isoY / (TILE_SIZE / 4)) / 2),
  y: Math.floor((isoY / (TILE_SIZE / 4) - isoX / (TILE_SIZE / 2)) / 2),
});

export const GameMap: React.FC<GameMapProps> = ({ onTileClick, onBuildingClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [dayTime, setDayTime] = useState(0.5); // 0 = midnight, 0.5 = noon, 1 = midnight
  
  const { 
    placedBuildings, 
    plantedCrops, 
    ownedAnimals, 
    selectedTool, 
    selectedBuildingId,
    level
  } = useHarvestHavenStore();
  
  // Day/night cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setDayTime((prev) => (prev + 0.001) % 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  // Center map on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOffset({
        x: rect.width / 2,
        y: rect.height / 4,
      });
    }
  }, []);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      setOffset((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(2, Math.max(0.5, prev + delta)));
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = (e.clientX - rect.left - offset.x) / zoom;
    const clickY = (e.clientY - rect.top - offset.y) / zoom;
    
    const { x, y } = fromIso(clickX, clickY);
    
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      // Check if clicked on a building
      const clickedBuilding = placedBuildings.find((b) => {
        const building = BUILDINGS.find((bd) => bd.id === b.buildingId);
        if (!building) return false;
        return (
          x >= b.x && x < b.x + building.width &&
          y >= b.y && y < b.y + building.height
        );
      });
      
      if (clickedBuilding) {
        onBuildingClick(clickedBuilding.id);
      } else {
        onTileClick(x, y);
      }
    }
  };
  
  // Touch handlers for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [pinchDistance, setPinchDistance] = useState<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setPinchDistance(dist);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStart) {
      const dx = e.touches[0].clientX - lastPos.x;
      const dy = e.touches[0].clientY - lastPos.y;
      setOffset((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && pinchDistance !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (newDist - pinchDistance) * 0.005;
      setZoom((prev) => Math.min(2, Math.max(0.5, prev + delta)));
      setPinchDistance(newDist);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart && e.changedTouches.length === 1) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dist = Math.hypot(endX - touchStart.x, endY - touchStart.y);
      
      if (dist < 10) {
        // It's a tap, not a drag
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const clickX = (endX - rect.left - offset.x) / zoom;
          const clickY = (endY - rect.top - offset.y) / zoom;
          const { x, y } = fromIso(clickX, clickY);
          
          if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
            const clickedBuilding = placedBuildings.find((b) => {
              const building = BUILDINGS.find((bd) => bd.id === b.buildingId);
              if (!building) return false;
              return (
                x >= b.x && x < b.x + building.width &&
                y >= b.y && y < b.y + building.height
              );
            });
            
            if (clickedBuilding) {
              onBuildingClick(clickedBuilding.id);
            } else {
              onTileClick(x, y);
            }
          }
        }
      }
    }
    setTouchStart(null);
    setPinchDistance(null);
  };
  
  // Calculate sky color based on time
  const getSkyColor = () => {
    const time = dayTime;
    if (time < 0.25) {
      // Night to dawn
      return `linear-gradient(180deg, #1a1a3e ${(1 - time * 4) * 50}%, #ff7e5f 100%)`;
    } else if (time < 0.5) {
      // Dawn to noon
      return `linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)`;
    } else if (time < 0.75) {
      // Noon to dusk
      return `linear-gradient(180deg, #87CEEB 0%, #feb47b 100%)`;
    } else {
      // Dusk to night
      return `linear-gradient(180deg, #1a1a3e ${time * 100 - 75}%, #ff7e5f ${100 - (time - 0.75) * 200}%)`;
    }
  };
  
  const renderTile = (x: number, y: number) => {
    const { isoX, isoY } = toIso(x, y);
    const isUnlocked = (x + y) < 8 + Math.floor(level / 2);
    
    return (
      <div
        key={`tile-${x}-${y}`}
        className={`absolute transition-colors ${
          isUnlocked 
            ? 'hover:brightness-110' 
            : 'opacity-40'
        }`}
        style={{
          left: isoX,
          top: isoY,
          width: TILE_SIZE,
          height: TILE_SIZE / 2,
          transform: 'rotateX(60deg) rotateZ(-45deg)',
          transformOrigin: 'center',
          background: isUnlocked
            ? `linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)`
            : '#6b7280',
          borderRadius: 4,
          boxShadow: isUnlocked ? 'inset 0 -4px 8px rgba(0,0,0,0.2)' : 'none',
        }}
      />
    );
  };
  
  const renderBuilding = (placed: typeof placedBuildings[0]) => {
    const building = BUILDINGS.find((b) => b.id === placed.buildingId);
    if (!building) return null;
    
    const { isoX, isoY } = toIso(placed.x, placed.y);
    const isSelected = selectedBuildingId === placed.buildingId && selectedTool === 'build';
    
    // Check for crops in this field
    const fieldCrops = plantedCrops.filter((c) => c.fieldId === placed.id);
    const fieldAnimals = ownedAnimals.filter((a) => a.penId === placed.id);
    
    return (
      <motion.div
        key={placed.id}
        initial={{ scale: 0, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        className={`absolute cursor-pointer transition-all ${
          isSelected ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
        }`}
        style={{
          left: isoX,
          top: isoY - (building.height * 20),
          zIndex: Math.floor(placed.y * 10 + placed.x),
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {/* Building Emoji */}
          <div 
            className="text-4xl sm:text-5xl filter drop-shadow-lg"
            style={{ 
              fontSize: `${2 + building.width * 0.5}rem`,
              textShadow: '2px 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            {building.emoji}
          </div>
          
          {/* Crops in field */}
          {building.id === 'field' && fieldCrops.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              {fieldCrops.map((crop) => {
                const cropData = CROPS.find((c) => c.id === crop.cropId);
                if (!cropData) return null;
                
                const elapsed = Date.now() - crop.plantedAt;
                const progress = Math.min(1, elapsed / (cropData.growTime * 1000));
                const isReady = progress >= 1;
                
                return (
                  <motion.div
                    key={crop.id}
                    className="relative"
                    animate={isReady ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <span 
                      className="text-2xl"
                      style={{ 
                        opacity: 0.3 + progress * 0.7,
                        transform: `scale(${0.5 + progress * 0.5})`
                      }}
                    >
                      {cropData.emoji}
                    </span>
                    {isReady && (
                      <span className="absolute -top-1 -right-1 text-xs">✨</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Animals in pen */}
          {fieldAnimals.length > 0 && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {fieldAnimals.slice(0, 3).map((animal) => {
                const animalData = ANIMALS.find((a) => a.id === animal.animalId);
                if (!animalData) return null;
                
                const elapsed = Date.now() - animal.lastProduced;
                const isReady = elapsed >= animalData.produceTime * 1000;
                
                return (
                  <motion.span
                    key={animal.id}
                    className="text-lg"
                    animate={isReady ? { y: [0, -3, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    {animalData.emoji}
                    {isReady && <span className="text-xs">💭</span>}
                  </motion.span>
                );
              })}
            </div>
          )}
          
          {/* Building status indicator */}
          {building.income && (
            <motion.div
              className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-xs">💰</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };
  
  // Preview for placing buildings
  const renderBuildPreview = () => {
    if (!selectedBuildingId || selectedTool !== 'build') return null;
    
    const building = BUILDINGS.find((b) => b.id === selectedBuildingId);
    if (!building) return null;
    
    return (
      <motion.div
        className="absolute pointer-events-none opacity-60"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          left: offset.x,
          top: offset.y,
          fontSize: `${2 + building.width * 0.5}rem`,
        }}
      >
        {building.emoji}
      </motion.div>
    );
  };
  
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ background: getSkyColor() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-40"
            initial={{ x: -100 }}
            animate={{ x: '100vw' }}
            transition={{
              duration: 60 + i * 20,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 10,
            }}
            style={{ top: `${10 + i * 10}%` }}
          >
            ☁️
          </motion.div>
        ))}
      </div>
      
      {/* Sun/Moon */}
      <motion.div
        className="absolute text-6xl pointer-events-none"
        style={{
          left: `${20 + dayTime * 60}%`,
          top: `${20 + Math.abs(0.5 - dayTime) * 40}%`,
        }}
      >
        {dayTime > 0.25 && dayTime < 0.75 ? '☀️' : '🌙'}
      </motion.div>
      
      {/* Map Container */}
      <div
        className="relative"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Ground Tiles */}
        {[...Array(MAP_HEIGHT)].map((_, y) =>
          [...Array(MAP_WIDTH)].map((_, x) => renderTile(x, y))
        )}
        
        {/* Placed Buildings */}
        {placedBuildings
          .sort((a, b) => (a.y + a.x) - (b.y + b.x))
          .map(renderBuilding)}
      </div>
      
      {/* Build Preview */}
      {renderBuildPreview()}
      
      {/* Zoom Controls */}
      <div className="absolute bottom-32 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          className="w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-white"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
          className="w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-white"
        >
          −
        </button>
      </div>
    </div>
  );
};
