import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Game2048Props {
  onBack?: () => void;
}

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

const GRID_SIZE = 4;

const tileColors: Record<number, { bg: string; text: string }> = {
  2: { bg: "bg-amber-100", text: "text-amber-900" },
  4: { bg: "bg-amber-200", text: "text-amber-900" },
  8: { bg: "bg-orange-300", text: "text-white" },
  16: { bg: "bg-orange-400", text: "text-white" },
  32: { bg: "bg-orange-500", text: "text-white" },
  64: { bg: "bg-orange-600", text: "text-white" },
  128: { bg: "bg-yellow-400", text: "text-white" },
  256: { bg: "bg-yellow-500", text: "text-white" },
  512: { bg: "bg-yellow-600", text: "text-white" },
  1024: { bg: "bg-amber-500", text: "text-white" },
  2048: { bg: "bg-amber-600", text: "text-white" },
};

const Game2048: React.FC<Game2048Props> = ({ onBack }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [tileIdCounter, setTileIdCounter] = useState(0);

  // Touch handling
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Level calculation: each level = 1000 points
  const level = useMemo(() => Math.floor(score / 1000) + 1, [score]);
  const pointsToNextLevel = useMemo(() => 1000 - (score % 1000), [score]);
  const levelProgress = useMemo(() => ((score % 1000) / 1000) * 100, [score]);

  const getNextId = useCallback(() => {
    setTileIdCounter((prev) => prev + 1);
    return tileIdCounter;
  }, [tileIdCounter]);

  const getEmptyCells = useCallback((currentTiles: Tile[]) => {
    const occupied = new Set(currentTiles.map((t) => `${t.row}-${t.col}`));
    const empty: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!occupied.has(`${row}-${col}`)) {
          empty.push({ row, col });
        }
      }
    }
    return empty;
  }, []);

  const addRandomTile = useCallback(
    (currentTiles: Tile[], count: number = 1): Tile[] => {
      const newTiles = [...currentTiles];
      for (let i = 0; i < count; i++) {
        const emptyCells = getEmptyCells(newTiles);
        if (emptyCells.length === 0) break;
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        newTiles.push({
          id: Date.now() + i,
          value: Math.random() < 0.9 ? 2 : 4,
          row,
          col,
          isNew: true,
        });
      }
      return newTiles;
    },
    [getEmptyCells]
  );

  const initGame = useCallback(() => {
    const initialTiles = addRandomTile([], 2);
    setTiles(initialTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setTileIdCounter(initialTiles.length);
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
    const saved = localStorage.getItem("2048-best-score");
    if (saved) setBestScore(parseInt(saved));
  }, [initGame]);

  const canMove = useCallback((currentTiles: Tile[]): boolean => {
    if (getEmptyCells(currentTiles).length > 0) return true;
    
    // Check for possible merges
    for (const tile of currentTiles) {
      const neighbors = currentTiles.filter(
        (t) =>
          (t.row === tile.row && Math.abs(t.col - tile.col) === 1) ||
          (t.col === tile.col && Math.abs(t.row - tile.row) === 1)
      );
      if (neighbors.some((n) => n.value === tile.value)) return true;
    }
    return false;
  }, [getEmptyCells]);

  const move = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (gameOver) return;

      let newTiles: Tile[] = tiles.map((t) => ({ ...t, isNew: false, isMerged: false }));
      let moved = false;
      let scoreGain = 0;

      const sortTiles = (tiles: Tile[]) => {
        switch (direction) {
          case "up":
            return [...tiles].sort((a, b) => a.row - b.row);
          case "down":
            return [...tiles].sort((a, b) => b.row - a.row);
          case "left":
            return [...tiles].sort((a, b) => a.col - b.col);
          case "right":
            return [...tiles].sort((a, b) => b.col - a.col);
        }
      };

      const getNewPosition = (tile: Tile, merged: Set<string>) => {
        let { row, col } = tile;
        const delta = direction === "up" || direction === "left" ? -1 : 1;
        const isVertical = direction === "up" || direction === "down";

        while (true) {
          const nextRow = isVertical ? row + delta : row;
          const nextCol = isVertical ? col : col + delta;

          if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) break;

          const blocking = newTiles.find(
            (t) => t.row === nextRow && t.col === nextCol && t.id !== tile.id
          );

          if (blocking) {
            if (blocking.value === tile.value && !merged.has(`${nextRow}-${nextCol}`)) {
              return { row: nextRow, col: nextCol, merge: true };
            }
            break;
          }

          row = nextRow;
          col = nextCol;
        }

        return { row, col, merge: false };
      };

      const merged = new Set<string>();
      const sorted = sortTiles(newTiles);

      for (const tile of sorted) {
        const { row, col, merge } = getNewPosition(tile, merged);

        if (row !== tile.row || col !== tile.col) {
          moved = true;
        }

        if (merge) {
          const target = newTiles.find((t) => t.row === row && t.col === col && t.id !== tile.id);
          if (target) {
            target.value *= 2;
            target.isMerged = true;
            scoreGain += target.value;
            merged.add(`${row}-${col}`);
            newTiles = newTiles.filter((t) => t.id !== tile.id);
            
            if (target.value === 2048 && !won) {
              setWon(true);
            }
          }
        } else {
          tile.row = row;
          tile.col = col;
        }
      }

      if (moved) {
        newTiles = addRandomTile(newTiles);
        setTiles(newTiles);
        const newScore = score + scoreGain;
        setScore(newScore);
        
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem("2048-best-score", newScore.toString());
        }

        if (!canMove(newTiles)) {
          setGameOver(true);
        }
      }
    },
    [tiles, score, bestScore, gameOver, won, addRandomTile, canMove]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace("Arrow", "").toLowerCase() as "up" | "down" | "left" | "right";
        move(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    const minSwipe = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipe) {
        move(deltaX > 0 ? "right" : "left");
      }
    } else {
      if (Math.abs(deltaY) > minSwipe) {
        move(deltaY > 0 ? "down" : "up");
      }
    }

    setTouchStart(null);
  };

  const getTileStyle = (value: number) => {
    return tileColors[value] || { bg: "bg-amber-700", text: "text-white" };
  };

  const getTileSize = () => {
    return "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24";
  };

  const getFontSize = (value: number) => {
    if (value < 100) return "text-2xl sm:text-3xl md:text-4xl";
    if (value < 1000) return "text-xl sm:text-2xl md:text-3xl";
    return "text-lg sm:text-xl md:text-2xl";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 p-4 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2 bg-white/80 dark:bg-gray-800/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400">
            2048
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={initGame}
            className="gap-2 bg-white/80 dark:bg-gray-800/80"
          >
            <RotateCcw className="w-4 h-4" />
            New
          </Button>
        </div>

        {/* Score & Level */}
        <div className="flex justify-center gap-3 mb-4 flex-wrap">
          <div className="bg-amber-500 text-white px-4 py-2 rounded-lg text-center min-w-[80px]">
            <div className="text-xs opacity-80">SCORE</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-center min-w-[80px]">
            <div className="text-xs opacity-80 flex items-center justify-center gap-1">
              <Star className="w-3 h-3" /> LEVEL
            </div>
            <div className="text-xl font-bold">{level}</div>
          </div>
          <div className="bg-amber-600 text-white px-4 py-2 rounded-lg text-center min-w-[80px]">
            <div className="text-xs opacity-80">BEST</div>
            <div className="text-xl font-bold">{bestScore}</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Level {level}</span>
            <span>{pointsToNextLevel} pts to Level {level + 1}</span>
          </div>
          <div className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative bg-amber-300/50 dark:bg-amber-800/50 rounded-xl p-2 sm:p-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid Background */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`${getTileSize()} bg-amber-200/50 dark:bg-amber-900/50 rounded-lg`}
            />
          ))}
        </div>

        {/* Tiles */}
        <div className="absolute inset-2 sm:inset-3">
          <AnimatePresence>
            {tiles.map((tile) => {
              const style = getTileStyle(tile.value);
              const gapSize = window.innerWidth < 640 ? 8 : 12;
              const tileSize = window.innerWidth < 640 ? 64 : window.innerWidth < 768 ? 80 : 96;
              
              return (
                <motion.div
                  key={tile.id}
                  initial={tile.isNew ? { scale: 0 } : false}
                  animate={{
                    x: tile.col * (tileSize + gapSize),
                    y: tile.row * (tileSize + gapSize),
                    scale: tile.isMerged ? [1, 1.15, 1] : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    scale: { duration: 0.15 },
                  }}
                  className={`absolute ${getTileSize()} ${style.bg} ${style.text} rounded-lg flex items-center justify-center font-bold shadow-lg ${getFontSize(tile.value)}`}
                >
                  {tile.value}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {(gameOver || won) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center gap-4"
            >
              <div className="text-center">
                {won ? (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Trophy className="w-8 h-8" />
                    <span className="text-3xl font-bold">You Win!</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-white">Game Over!</span>
                )}
                <div className="text-white mt-2">Score: {score}</div>
              </div>
              <Button onClick={initGame} className="bg-amber-500 hover:bg-amber-600">
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p className="hidden sm:block">Use arrow keys to move tiles</p>
        <p className="sm:hidden">Swipe to move tiles</p>
      </div>
    </div>
  );
};

export default Game2048;
