import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityCreatorStore } from '@/stores/cityCreatorStore';
import { BUILDING_CONFIGS } from '@/utils/cityCreatorConfig';
import type { BuildingType, Position } from '@/types/cityCreatorRPG';

interface CityMapProps {
  selectedBuilding: BuildingType | null;
  onBuildingPlaced: () => void;
}

export const CityMap: React.FC<CityMapProps> = ({ selectedBuilding, onBuildingPlaced }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { buildings, mapSize, placeBuilding, removeBuilding, hero } = useCityCreatorStore();
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [showBuildEffect, setShowBuildEffect] = useState<Position | null>(null);

  const tileSize = 48 * zoom;
  const gridWidth = mapSize * tileSize;
  const gridHeight = mapSize * tileSize;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(2, Math.max(0.5, prev + delta)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !selectedBuilding) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTileClick = (x: number, y: number) => {
    const position = { x, y };
    
    if (selectedBuilding) {
      const success = placeBuilding(selectedBuilding, position);
      if (success) {
        setShowBuildEffect(position);
        setTimeout(() => setShowBuildEffect(null), 500);
        onBuildingPlaced();
      }
    } else {
      const building = buildings.find(b => b.position.x === x && b.position.y === y);
      if (building) {
        setSelectedTile(position);
      } else {
        setSelectedTile(null);
      }
    }
  };

  const getBuildingAt = (x: number, y: number) => {
    return buildings.find(b => b.position.x === x && b.position.y === y);
  };

  const getGroundColor = (x: number, y: number) => {
    const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5);
    if (noise > 0.3) return 'bg-green-400';
    if (noise < -0.3) return 'bg-green-600';
    return 'bg-green-500';
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-sky-300 to-sky-400 rounded-2xl">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(2, prev + 0.2))}
          className="w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-white transition-colors"
        >
          ➕
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
          className="w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-white transition-colors"
        >
          ➖
        </button>
        <button
          onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
          className="w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-white transition-colors"
        >
          🎯
        </button>
      </div>

      {/* Map Grid */}
      <div
        ref={mapRef}
        className="absolute cursor-grab active:cursor-grabbing"
        style={{
          width: gridWidth,
          height: gridHeight,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          left: '50%',
          top: '50%',
          marginLeft: -gridWidth / 2,
          marginTop: -gridHeight / 2,
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Tiles */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${mapSize}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${mapSize}, ${tileSize}px)`,
          }}
        >
          {Array.from({ length: mapSize * mapSize }).map((_, i) => {
            const x = i % mapSize;
            const y = Math.floor(i / mapSize);
            const building = getBuildingAt(x, y);
            const isSelected = selectedTile?.x === x && selectedTile?.y === y;
            const isShowingEffect = showBuildEffect?.x === x && showBuildEffect?.y === y;

            return (
              <motion.div
                key={`${x}-${y}`}
                className={`
                  relative border border-green-600/30 
                  ${getGroundColor(x, y)}
                  ${selectedBuilding ? 'cursor-pointer hover:brightness-110' : ''}
                  ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
                  transition-all duration-150
                `}
                style={{ width: tileSize, height: tileSize }}
                onClick={() => handleTileClick(x, y)}
                whileHover={selectedBuilding ? { scale: 1.05 } : {}}
              >
                {/* Building */}
                {building && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <span
                      className="drop-shadow-lg"
                      style={{ fontSize: tileSize * 0.7 }}
                    >
                      {BUILDING_CONFIGS[building.type].emoji}
                    </span>
                    {/* Level Badge */}
                    {building.level > 1 && (
                      <span
                        className="absolute -top-1 -right-1 bg-yellow-400 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow"
                      >
                        {building.level}
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Build Effect */}
                <AnimatePresence>
                  {isShowingEffect && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-4xl">✨</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preview when placing */}
                {selectedBuilding && !building && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                  >
                    <span style={{ fontSize: tileSize * 0.5 }}>
                      {BUILDING_CONFIGS[selectedBuilding].emoji}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Building Info */}
      <AnimatePresence>
        {selectedTile && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl z-20"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            {(() => {
              const building = getBuildingAt(selectedTile.x, selectedTile.y);
              if (!building) return null;
              const config = BUILDING_CONFIGS[building.type];
              return (
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{config.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{config.name}</h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                    <p className="text-sm">Level {building.level}/5</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const store = useCityCreatorStore.getState();
                        store.upgradeBuilding(building.id);
                      }}
                      className="px-4 py-2 bg-yellow-400 rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors"
                      disabled={building.level >= 5}
                    >
                      ⬆️ Upgrade
                    </button>
                    <button
                      onClick={() => {
                        removeBuilding(building.id);
                        setSelectedTile(null);
                      }}
                      className="px-4 py-2 bg-red-400 rounded-xl font-bold text-sm hover:bg-red-500 transition-colors text-white"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Size Indicator */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
        🗺️ {mapSize}x{mapSize}
      </div>
    </div>
  );
};
