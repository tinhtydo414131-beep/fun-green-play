import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniGame2048Props {
  onComplete?: (score: number) => void;
  onBack?: () => void;
}

type Grid = number[][];

const GRID_SIZE = 4;

const TILE_COLORS: Record<number, string> = {
  2: 'bg-amber-100 text-amber-800',
  4: 'bg-amber-200 text-amber-800',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-orange-500 text-white',
  64: 'bg-red-400 text-white',
  128: 'bg-yellow-300 text-yellow-900',
  256: 'bg-yellow-400 text-yellow-900',
  512: 'bg-yellow-500 text-white',
  1024: 'bg-yellow-600 text-white',
  2048: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white',
};

export function MiniGame2048({ onComplete, onBack }: MiniGame2048Props) {
  const [grid, setGrid] = useState<Grid>(() => initializeGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => 
    parseInt(localStorage.getItem('mini2048-best') || '0')
  );
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function initializeGrid(): Grid {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    return newGrid;
  }

  function addRandomTile(grid: Grid) {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) emptyCells.push([i, j]);
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function move(direction: 'up' | 'down' | 'left' | 'right') {
    if (gameOver || won) return;

    const newGrid = grid.map(row => [...row]);
    let moved = false;
    let scoreGain = 0;

    const moveRow = (row: number[]) => {
      const filtered = row.filter(x => x !== 0);
      const merged: number[] = [];
      
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i] === filtered[i + 1]) {
          const mergedValue = filtered[i] * 2;
          merged.push(mergedValue);
          scoreGain += mergedValue;
          if (mergedValue === 2048) setWon(true);
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      
      while (merged.length < GRID_SIZE) merged.push(0);
      return merged;
    };

    if (direction === 'left') {
      for (let i = 0; i < GRID_SIZE; i++) {
        const newRow = moveRow(newGrid[i]);
        if (newRow.join(',') !== newGrid[i].join(',')) moved = true;
        newGrid[i] = newRow;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < GRID_SIZE; i++) {
        const newRow = moveRow([...newGrid[i]].reverse()).reverse();
        if (newRow.join(',') !== newGrid[i].join(',')) moved = true;
        newGrid[i] = newRow;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const col = newGrid.map(row => row[j]);
        const newCol = moveRow(col);
        if (newCol.join(',') !== col.join(',')) moved = true;
        for (let i = 0; i < GRID_SIZE; i++) newGrid[i][j] = newCol[i];
      }
    } else if (direction === 'down') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const col = newGrid.map(row => row[j]).reverse();
        const newCol = moveRow(col).reverse();
        if (newCol.join(',') !== newGrid.map(row => row[j]).join(',')) moved = true;
        for (let i = 0; i < GRID_SIZE; i++) newGrid[i][j] = newCol[i];
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(s => s + scoreGain);
      
      // Check game over
      if (isGameOver(newGrid)) {
        setGameOver(true);
        const finalScore = score + scoreGain;
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          localStorage.setItem('mini2048-best', String(finalScore));
        }
        onComplete?.(finalScore);
      }
    }
  }

  function isGameOver(grid: Grid): boolean {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) return false;
        if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return false;
        if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return false;
      }
    }
    return true;
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const dir = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
      move(dir);
    }
  }, [grid, gameOver, won]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch controls
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
    setTouchStart(null);
  };

  const restart = () => {
    setGrid(initializeGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          2048
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Score</div>
            <div className="font-bold text-lg">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Best</div>
            <div className="font-bold text-lg">{bestScore}</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div 
        className="relative bg-muted/50 rounded-xl p-2 touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2">
          {grid.flat().map((value, i) => (
            <motion.div
              key={i}
              initial={{ scale: value ? 0.8 : 1 }}
              animate={{ scale: 1 }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center font-bold text-xl sm:text-2xl ${
                value ? TILE_COLORS[value] || 'bg-primary text-white' : 'bg-muted'
              }`}
            >
              {value || ''}
            </motion.div>
          ))}
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {(gameOver || won) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4"
            >
              <div className="text-4xl">{won ? '🎉' : '😢'}</div>
              <div className="text-2xl font-bold">
                {won ? 'You Won!' : 'Game Over!'}
              </div>
              <div className="text-lg">Score: {score}</div>
              <Button onClick={restart} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Button variant="outline" onClick={() => move('up')} className="h-12">
          <ArrowUp className="w-5 h-5" />
        </Button>
        <div />
        <Button variant="outline" onClick={() => move('left')} className="h-12">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button variant="outline" onClick={() => move('down')} className="h-12">
          <ArrowDown className="w-5 h-5" />
        </Button>
        <Button variant="outline" onClick={() => move('right')} className="h-12">
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={restart} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Restart
        </Button>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
