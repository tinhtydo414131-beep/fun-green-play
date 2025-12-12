import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';
import { CROPS, BUILDINGS, ANIMALS } from '@/data/harvestHavenData';

interface GameMapProps {
  onTileClick: (x: number, y: number) => void;
  onBuildingClick: (buildingId: string) => void;
}

const TILE_SIZE = 64;
const MAP_WIDTH = 24; // Increased from 16
const MAP_HEIGHT = 24; // Increased from 16

// Isometric conversion helpers
const toIso = (x: number, y: number) => ({
  isoX: (x - y) * (TILE_SIZE / 2),
  isoY: (x + y) * (TILE_SIZE / 4),
});

const fromIso = (isoX: number, isoY: number) => ({
  x: Math.floor((isoX / (TILE_SIZE / 2) + isoY / (TILE_SIZE / 4)) / 2),
  y: Math.floor((isoY / (TILE_SIZE / 4) - isoX / (TILE_SIZE / 2)) / 2),
});

// Weather types
type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

// Particle component for effects
const Particle: React.FC<{ type: 'rain' | 'snow' | 'sparkle'; delay: number }> = ({ type, delay }) => {
  const style = type === 'rain' 
    ? { background: 'linear-gradient(180deg, transparent, #88ccff)' }
    : type === 'snow'
    ? { background: 'white', borderRadius: '50%' }
    : { background: 'gold', borderRadius: '50%' };
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${Math.random() * 100}%`,
        width: type === 'rain' ? 2 : type === 'snow' ? 6 : 4,
        height: type === 'rain' ? 20 : type === 'snow' ? 6 : 4,
        ...style,
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ 
        y: '100vh', 
        opacity: [0, 1, 1, 0],
        x: type === 'snow' ? [0, 20, -20, 0] : 0,
      }}
      transition={{
        duration: type === 'rain' ? 1 : type === 'snow' ? 4 : 2,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

export const GameMap: React.FC<GameMapProps> = ({ onTileClick, onBuildingClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [dayTime, setDayTime] = useState(0.5);
  const [weather, setWeather] = useState<Weather>('sunny');
  const [showWeatherEffect, setShowWeatherEffect] = useState(false);
  
  const { 
    placedBuildings, 
    plantedCrops, 
    ownedAnimals, 
    selectedTool, 
    selectedBuildingId,
    level
  } = useHarvestHavenStore();
  
  // Day/night cycle - slower for better ambiance
  useEffect(() => {
    const interval = setInterval(() => {
      setDayTime((prev) => (prev + 0.0005) % 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  // Random weather changes
  useEffect(() => {
    const changeWeather = () => {
      const weathers: Weather[] = ['sunny', 'sunny', 'sunny', 'cloudy', 'rainy', 'snowy'];
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setWeather(newWeather);
      setShowWeatherEffect(newWeather === 'rainy' || newWeather === 'snowy');
    };
    
    const interval = setInterval(changeWeather, 60000); // Change every minute
    return () => clearInterval(interval);
  }, []);
  
  // Center map on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOffset({
        x: rect.width / 2,
        y: rect.height / 3,
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
    setZoom((prev) => Math.min(2, Math.max(0.3, prev + delta)));
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = (e.clientX - rect.left - offset.x) / zoom;
    const clickY = (e.clientY - rect.top - offset.y) / zoom;
    
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
      const delta = (newDist - pinchDistance) * 0.003;
      setZoom((prev) => Math.min(2, Math.max(0.3, prev + delta)));
      setPinchDistance(newDist);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart && e.changedTouches.length === 1) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dist = Math.hypot(endX - touchStart.x, endY - touchStart.y);
      
      if (dist < 10) {
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
  
  // Enhanced sky gradient based on time and weather
  const getSkyColor = () => {
    const time = dayTime;
    let baseGradient = '';
    
    if (time < 0.2) {
      // Night
      baseGradient = 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
    } else if (time < 0.3) {
      // Dawn
      baseGradient = 'linear-gradient(180deg, #2c3e50 0%, #fd746c 50%, #ff9068 100%)';
    } else if (time < 0.7) {
      // Day
      baseGradient = weather === 'cloudy' || weather === 'rainy'
        ? 'linear-gradient(180deg, #606c88 0%, #3f4c6b 100%)'
        : 'linear-gradient(180deg, #56CCF2 0%, #2F80ED 50%, #87CEEB 100%)';
    } else if (time < 0.85) {
      // Sunset
      baseGradient = 'linear-gradient(180deg, #ff7e5f 0%, #feb47b 50%, #ff6b6b 100%)';
    } else {
      // Dusk
      baseGradient = 'linear-gradient(180deg, #1a1a3e 0%, #4a4a6a 50%, #2d2d4a 100%)';
    }
    
    return baseGradient;
  };
  
  // Get terrain type based on position
  const getTerrainType = (x: number, y: number) => {
    const distFromCenter = Math.sqrt(Math.pow(x - MAP_WIDTH/2, 2) + Math.pow(y - MAP_HEIGHT/2, 2));
    
    if (distFromCenter > MAP_WIDTH/2 - 2) return 'water';
    if (distFromCenter > MAP_WIDTH/2 - 4) return 'sand';
    if ((x + y) % 7 === 0 && distFromCenter > 5) return 'forest';
    return 'grass';
  };
  
  const renderTile = (x: number, y: number) => {
    const { isoX, isoY } = toIso(x, y);
    const maxUnlockedDist = 10 + Math.floor(level / 2);
    const distFromCenter = Math.abs(x - MAP_WIDTH/2) + Math.abs(y - MAP_HEIGHT/2);
    const isUnlocked = distFromCenter < maxUnlockedDist;
    const terrainType = getTerrainType(x, y);
    
    const getTerrainColor = () => {
      if (!isUnlocked) return '#4b5563';
      switch (terrainType) {
        case 'water': return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
        case 'sand': return 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)';
        case 'forest': return 'linear-gradient(135deg, #166534 0%, #15803d 100%)';
        default: return 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)';
      }
    };
    
    return (
      <div
        key={`tile-${x}-${y}`}
        className={`absolute transition-all duration-200 ${
          isUnlocked && terrainType === 'grass'
            ? 'hover:brightness-110 cursor-pointer' 
            : terrainType === 'water'
            ? 'cursor-not-allowed'
            : 'opacity-40 cursor-not-allowed'
        }`}
        style={{
          left: isoX,
          top: isoY,
          width: TILE_SIZE,
          height: TILE_SIZE / 2,
          transform: 'rotateX(60deg) rotateZ(-45deg)',
          transformOrigin: 'center',
          background: getTerrainColor(),
          borderRadius: 4,
          boxShadow: isUnlocked ? 'inset 0 -4px 8px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {/* Terrain decorations */}
        {terrainType === 'water' && isUnlocked && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-xs"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ~
          </motion.div>
        )}
        {terrainType === 'forest' && isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center text-sm">
            🌲
          </div>
        )}
      </div>
    );
  };
  
  const renderBuilding = (placed: typeof placedBuildings[0]) => {
    const building = BUILDINGS.find((b) => b.id === placed.buildingId);
    if (!building) return null;
    
    const { isoX, isoY } = toIso(placed.x, placed.y);
    const isSelected = selectedBuildingId === placed.buildingId && selectedTool === 'build';
    
    const fieldCrops = plantedCrops.filter((c) => c.fieldId === placed.id);
    const fieldAnimals = ownedAnimals.filter((a) => a.penId === placed.id);
    
    // Calculate if any crops are ready
    const hasReadyCrops = fieldCrops.some((crop) => {
      const cropData = CROPS.find((c) => c.id === crop.cropId);
      if (!cropData) return false;
      return Date.now() - crop.plantedAt >= cropData.growTime * 1000;
    });
    
    // Calculate if any animals have products
    const hasReadyProducts = fieldAnimals.some((animal) => {
      const animalData = ANIMALS.find((a) => a.id === animal.animalId);
      if (!animalData) return false;
      return Date.now() - animal.lastProduced >= animalData.produceTime * 1000;
    });
    
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
          top: isoY - (building.height * 24),
          zIndex: Math.floor(placed.y * 10 + placed.x),
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {/* Building Shadow */}
          <div 
            className="absolute rounded-full bg-black/20 blur-sm"
            style={{
              width: building.width * 32,
              height: building.height * 16,
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          
          {/* Building Emoji */}
          <div 
            className="text-4xl sm:text-5xl filter drop-shadow-lg relative"
            style={{ 
              fontSize: `${2.5 + building.width * 0.5}rem`,
              textShadow: '2px 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            {building.emoji}
            
            {/* Ready indicator */}
            {(hasReadyCrops || hasReadyProducts) && (
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <span className="text-2xl">✨</span>
              </motion.div>
            )}
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
                
                // Weather bonus visual
                const hasWeatherBonus = (weather === 'rainy' && ['wheat', 'corn', 'lettuce'].includes(crop.cropId)) ||
                                        (weather === 'sunny' && ['tomato', 'strawberry', 'watermelon'].includes(crop.cropId));
                
                return (
                  <motion.div
                    key={crop.id}
                    className="relative"
                    animate={isReady ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <span 
                      className="text-3xl"
                      style={{ 
                        opacity: 0.3 + progress * 0.7,
                        transform: `scale(${0.5 + progress * 0.5})`
                      }}
                    >
                      {cropData.emoji}
                    </span>
                    {isReady && (
                      <motion.span 
                        className="absolute -top-1 -right-1 text-sm"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ✨
                      </motion.span>
                    )}
                    {hasWeatherBonus && !isReady && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">
                        ⚡
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Animals in pen */}
          {fieldAnimals.length > 0 && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {fieldAnimals.slice(0, 4).map((animal, idx) => {
                const animalData = ANIMALS.find((a) => a.id === animal.animalId);
                if (!animalData) return null;
                
                const elapsed = Date.now() - animal.lastProduced;
                const isReady = elapsed >= animalData.produceTime * 1000;
                
                return (
                  <motion.span
                    key={animal.id}
                    className="text-xl"
                    animate={{
                      y: isReady ? [0, -5, 0] : [0, -2, 0],
                      x: [0, idx % 2 ? 2 : -2, 0],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: isReady ? 0.4 : 2,
                      delay: idx * 0.2,
                    }}
                  >
                    {animalData.emoji}
                    {isReady && (
                      <motion.span 
                        className="absolute -top-2 -right-1 text-xs"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        {animalData.productEmoji}
                      </motion.span>
                    )}
                  </motion.span>
                );
              })}
            </div>
          )}
          
          {/* Income indicator for commercial/residential */}
          {building.income && (
            <motion.div
              className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-1.5 shadow-lg"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-xs">💰</span>
            </motion.div>
          )}
          
          {/* Production indicator */}
          {building.produces && (
            <motion.div
              className="absolute -top-3 left-1/2 -translate-x-1/2"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <span className="text-lg">⚙️</span>
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
        className="fixed pointer-events-none opacity-60 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${3 + building.width * 0.5}rem`,
        }}
      >
        {building.emoji}
        <div className="text-sm text-white text-center bg-black/50 rounded-lg px-2 py-1 mt-2">
          Tap map to place
        </div>
      </motion.div>
    );
  };
  
  // Weather indicator
  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'snowy': return '❄️';
    }
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
      {/* Weather Particles */}
      {showWeatherEffect && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(weather === 'rainy' ? 50 : 30)].map((_, i) => (
            <Particle 
              key={i} 
              type={weather === 'rainy' ? 'rain' : 'snow'} 
              delay={i * 0.1} 
            />
          ))}
        </div>
      )}
      
      {/* Clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(weather === 'cloudy' || weather === 'rainy' ? 10 : 5)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${weather === 'cloudy' || weather === 'rainy' ? 'opacity-70' : 'opacity-30'}`}
            initial={{ x: -200 }}
            animate={{ x: '110vw' }}
            transition={{
              duration: 80 + i * 15,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 8,
            }}
            style={{ 
              top: `${5 + i * 8}%`,
              fontSize: `${4 + Math.random() * 3}rem`,
            }}
          >
            ☁️
          </motion.div>
        ))}
      </div>
      
      {/* Sun/Moon */}
      <motion.div
        className="absolute text-6xl sm:text-7xl pointer-events-none filter drop-shadow-lg"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          left: `${15 + dayTime * 70}%`,
          top: `${15 + Math.abs(0.5 - dayTime) * 30}%`,
        }}
      >
        {dayTime > 0.2 && dayTime < 0.85 ? '☀️' : '🌙'}
      </motion.div>
      
      {/* Weather indicator */}
      <div className="absolute top-20 left-4 z-20">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg flex items-center gap-2"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <span className="text-2xl">{getWeatherIcon()}</span>
          <div className="text-sm">
            <div className="font-bold capitalize">{weather}</div>
            {weather === 'rainy' && <div className="text-xs text-green-600">+20% crop growth!</div>}
            {weather === 'sunny' && <div className="text-xs text-yellow-600">+10% income!</div>}
          </div>
        </motion.div>
      </div>
      
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
      <div className="absolute bottom-36 right-4 flex flex-col gap-2 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-2xl font-bold text-gray-700 hover:bg-white"
        >
          +
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-2xl font-bold text-gray-700 hover:bg-white"
        >
          −
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setOffset({ x: rect.width / 2, y: rect.height / 3 });
              setZoom(0.8);
            }
          }}
          className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-white"
        >
          🏠
        </motion.button>
      </div>
      
      {/* Map size indicator */}
      <div className="absolute bottom-36 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 z-20">
        Map: {MAP_WIDTH}x{MAP_HEIGHT} • Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};
