import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";
import { ArrowLeft, Heart, TrendingUp, Star, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Tile {
  id: number;
  shape: string;
  color: string;
  selected: boolean;
  matched: boolean;
}

const SHAPES = ['●', '■', '▲', '◆', '★', '♥', '⬟', '⬢'];
const COLORS = [
  'from-red-400 to-red-500',
  'from-blue-400 to-blue-500', 
  'from-green-400 to-green-500',
  'from-yellow-400 to-yellow-500',
  'from-purple-400 to-purple-500',
  'from-pink-400 to-pink-500',
  'from-cyan-400 to-cyan-500',
  'from-orange-400 to-orange-500',
];

const SHADOW_COLORS = [
  'shadow-red-500/50',
  'shadow-blue-500/50',
  'shadow-green-500/50',
  'shadow-yellow-500/50',
  'shadow-purple-500/50',
  'shadow-pink-500/50',
  'shadow-cyan-500/50',
  'shadow-orange-500/50',
];

export const ColorMatch = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete,
  onBack
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const gridSize = Math.min(4 + Math.floor(level / 3), 6);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stars, setStars] = useState(0);
  const targetScore = Math.floor(100 * level * difficultyMultiplier);
  
  const { playScore, playError, startBackgroundMusic, stopBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  const generateTiles = useCallback(() => {
    const totalTiles = gridSize * gridSize;
    const pairsNeeded = Math.floor(totalTiles / 2);
    const newTiles: Tile[] = [];
    
    for (let i = 0; i < pairsNeeded; i++) {
      const colorIndex = i % COLORS.length;
      const shapeIndex = Math.floor(i / COLORS.length) % SHAPES.length;
      
      // Create pair
      for (let j = 0; j < 2; j++) {
        newTiles.push({
          id: newTiles.length,
          shape: SHAPES[shapeIndex],
          color: COLORS[colorIndex],
          selected: false,
          matched: false,
        });
      }
    }
    
    // Add extra tile if odd number
    if (totalTiles % 2 === 1) {
      newTiles.push({
        id: newTiles.length,
        shape: SHAPES[0],
        color: COLORS[0],
        selected: false,
        matched: true, // Pre-matched so it doesn't affect gameplay
      });
    }
    
    // Shuffle
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }
    
    return newTiles.map((tile, index) => ({ ...tile, id: index }));
  }, [gridSize]);

  const startGame = () => {
    setTiles(generateTiles());
    setScore(0);
    setCombo(0);
    setMoves(0);
    setStars(0);
    setSelectedTiles([]);
    setIsPlaying(true);
    startBackgroundMusic();
  };

  useEffect(() => {
    if (!isPlaying) stopBackgroundMusic();
  }, [isPlaying]);

  useEffect(() => {
    if (score >= targetScore && isPlaying) {
      setIsPlaying(false);
      stopBackgroundMusic();
      const earnedStars = moves <= gridSize * 3 ? 3 : moves <= gridSize * 5 ? 2 : 1;
      setStars(earnedStars);
      toast.success(`🎉 Level Complete! ${earnedStars} ⭐`);
      setTimeout(() => onLevelComplete?.(), 1500);
    }
  }, [score, targetScore, isPlaying, moves, gridSize, onLevelComplete]);

  const handleTileClick = (index: number) => {
    if (!isPlaying || tiles[index].matched || tiles[index].selected) return;
    if (selectedTiles.length >= 2) return;

    const newTiles = [...tiles];
    newTiles[index].selected = true;
    setTiles(newTiles);

    const newSelected = [...selectedTiles, index];
    setSelectedTiles(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newSelected;
      
      if (tiles[first].shape === tiles[second].shape && tiles[first].color === tiles[second].color) {
        // Match found!
        setTimeout(() => {
          const matchedTiles = [...tiles];
          matchedTiles[first].matched = true;
          matchedTiles[second].matched = true;
          matchedTiles[first].selected = false;
          matchedTiles[second].selected = false;
          setTiles(matchedTiles);
          setSelectedTiles([]);
          
          const comboBonus = combo * 5;
          setScore(s => s + 10 + comboBonus);
          setCombo(c => c + 1);
          playScore();
          
          if (combo >= 2) {
            toast.success(`🔥 ${combo + 1}x Combo! +${10 + comboBonus} points`);
          }
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          const resetTiles = [...tiles];
          resetTiles[first].selected = false;
          resetTiles[second].selected = false;
          setTiles(resetTiles);
          setSelectedTiles([]);
          setCombo(0);
          playError();
        }, 800);
      }
    }
  };

  const getColorIndex = (color: string) => COLORS.indexOf(color);

  return (
    <div className="flex flex-col items-center gap-4 p-4 animate-fade-in min-h-screen">
      {/* Header */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          {onBack && !isPlaying && (
            <Button 
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Color Match
          </h2>
          <AudioControls 
            isMusicEnabled={isMusicEnabled}
            isSoundEnabled={isSoundEnabled}
            onToggleMusic={toggleMusic}
            onToggleSound={toggleSound}
          />
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <span className="font-bold text-foreground">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-foreground">{combo}x</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <Star 
                key={s} 
                className={`w-5 h-5 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Game Grid */}
      <div 
        className="bg-gradient-to-br from-green-300 via-teal-300 to-cyan-300 p-4 rounded-3xl shadow-2xl"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: '8px',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <AnimatePresence>
          {tiles.map((tile, index) => (
            <motion.button
              key={tile.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: tile.matched ? 0 : 1, 
                rotate: 0,
                y: tile.selected ? -5 : 0,
              }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: index * 0.02 
              }}
              onClick={() => handleTileClick(index)}
              disabled={!isPlaying || tile.matched}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-2xl md:text-3xl
                transition-all duration-200 cursor-pointer
                ${tile.matched ? 'invisible' : ''}
                ${tile.selected 
                  ? `bg-gradient-to-br ${tile.color} shadow-lg ${SHADOW_COLORS[getColorIndex(tile.color)]} ring-4 ring-white` 
                  : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'
                }
              `}
              style={{
                minWidth: '50px',
                minHeight: '50px',
              }}
            >
              {tile.selected || tile.matched ? (
                <span className="text-white drop-shadow-lg filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                  {tile.shape}
                </span>
              ) : (
                <span className="text-slate-400/50">?</span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Level Info */}
      <div className="text-center text-muted-foreground">
        <p className="text-sm">Level {level} • Target: {targetScore} points</p>
        <p className="text-xs">Moves: {moves}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isPlaying ? (
          <Button 
            onClick={startGame}
            size="lg"
            className="bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-xl transform hover:scale-105 transition-all px-8"
          >
            {tiles.length === 0 ? '🎮 Start Game' : '🔄 Play Again'}
          </Button>
        ) : (
          <Button 
            onClick={startGame}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        )}
      </div>
    </div>
  );
};
