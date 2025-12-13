import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Pause, Play, ChevronDown, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TetrisGameProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 1000;

// Tetris pieces (Tetrominos)
const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f5ff', // Cyan
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#fbbf24', // Yellow
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#a855f7', // Purple
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#22c55e', // Green
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#ef4444', // Red
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#3b82f6', // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#f97316', // Orange
  },
};

type TetrominoType = keyof typeof TETROMINOS;

interface Piece {
  type: TetrominoType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

const createEmptyBoard = (): (string | null)[][] =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

const getRandomTetromino = (): TetrominoType => {
  const types = Object.keys(TETROMINOS) as TetrominoType[];
  return types[Math.floor(Math.random() * types.length)];
};

const createPiece = (type: TetrominoType): Piece => ({
  type,
  shape: TETROMINOS[type].shape,
  color: TETROMINOS[type].color,
  x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[type].shape[0].length / 2),
  y: 0,
});

const rotatePiece = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
};

export default function TetrisGame({ level = 1, onLevelComplete, onBack }: TetrisGameProps) {
  const [board, setBoard] = useState<(string | null)[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType>(getRandomTetromino());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameLevel, setGameLevel] = useState(level);
  const targetLines = 10 + level * 5;

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Check collision
  const checkCollision = useCallback(
    (piece: Piece, board: (string | null)[][], offsetX = 0, offsetY = 0): boolean => {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const newX = piece.x + c + offsetX;
            const newY = piece.y + r + offsetY;
            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return true;
            }
            if (newY >= 0 && board[newY][newX]) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  // Merge piece to board
  const mergePiece = useCallback((piece: Piece, board: (string | null)[][]): (string | null)[][] => {
    const newBoard = board.map(row => [...row]);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const y = piece.y + r;
          const x = piece.x + c;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            newBoard[y][x] = piece.color;
          }
        }
      }
    }
    return newBoard;
  }, []);

  // Clear completed lines
  const clearLines = useCallback((board: (string | null)[][]): { newBoard: (string | null)[][]; linesCleared: number } => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    return { newBoard, linesCleared };
  }, []);

  // Spawn new piece
  const spawnPiece = useCallback(() => {
    const newPiece = createPiece(nextPiece);
    setNextPiece(getRandomTetromino());
    
    if (checkCollision(newPiece, board)) {
      setGameOver(true);
      return null;
    }
    
    return newPiece;
  }, [nextPiece, board, checkCollision]);

  // Move piece
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameOver || isPaused) return;

      if (!checkCollision(currentPiece, board, dx, dy)) {
        setCurrentPiece(prev => prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null);
      } else if (dy > 0) {
        // Piece landed
        const mergedBoard = mergePiece(currentPiece, board);
        const { newBoard, linesCleared } = clearLines(mergedBoard);
        setBoard(newBoard);
        
        if (linesCleared > 0) {
          const scoreGain = linesCleared * 100 * gameLevel;
          setScore(prev => prev + scoreGain);
          setLines(prev => {
            const newLines = prev + linesCleared;
            if (newLines >= targetLines && onLevelComplete) {
              confetti({ particleCount: 100, spread: 70 });
              setTimeout(() => onLevelComplete(score + scoreGain, Math.floor((score + scoreGain) / 50)), 500);
            }
            return newLines;
          });
          
          // Level up every 10 lines
          if ((lines + linesCleared) % 10 === 0) {
            setGameLevel(prev => prev + 1);
          }
        }
        
        const newPiece = spawnPiece();
        setCurrentPiece(newPiece);
      }
    },
    [currentPiece, board, gameOver, isPaused, checkCollision, mergePiece, clearLines, spawnPiece, gameLevel, score, lines, targetLines, onLevelComplete]
  );

  // Rotate piece
  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotatedShape = rotatePiece(currentPiece.shape);
    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    // Try wall kicks
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!checkCollision({ ...rotatedPiece, x: rotatedPiece.x + kick }, board)) {
        setCurrentPiece({ ...rotatedPiece, x: rotatedPiece.x + kick });
        return;
      }
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let dropY = 0;
    while (!checkCollision(currentPiece, board, 0, dropY + 1)) {
      dropY++;
    }
    
    const droppedPiece = { ...currentPiece, y: currentPiece.y + dropY };
    const mergedBoard = mergePiece(droppedPiece, board);
    const { newBoard, linesCleared } = clearLines(mergedBoard);
    setBoard(newBoard);
    setScore(prev => prev + dropY * 2 + linesCleared * 100 * gameLevel);
    setLines(prev => prev + linesCleared);
    
    const newPiece = spawnPiece();
    setCurrentPiece(newPiece);
  }, [currentPiece, board, gameOver, isPaused, checkCollision, mergePiece, clearLines, spawnPiece, gameLevel]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    const speed = Math.max(100, INITIAL_SPEED - (gameLevel - 1) * 100);
    gameLoopRef.current = setInterval(() => {
      movePiece(0, 1);
    }, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameOver, isPaused, gameLevel, movePiece]);

  // Initialize game
  useEffect(() => {
    const piece = createPiece(getRandomTetromino());
    setCurrentPiece(piece);
    setNextPiece(getRandomTetromino());
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotate, hardDrop, gameOver]);

  // Reset game
  const resetGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setGameLevel(level);
    const piece = createPiece(getRandomTetromino());
    setCurrentPiece(piece);
    setNextPiece(getRandomTetromino());
  };

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            const y = currentPiece.y + r;
            const x = currentPiece.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white font-fredoka">🧩 Game Xếp Hình</h1>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-4 items-start">
        {/* Stats */}
        <div className="hidden md:flex flex-col gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/60 text-sm">Score</p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/60 text-sm">Lines</p>
            <p className="text-2xl font-bold text-cyan-400">{lines}/{targetLines}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/60 text-sm">Level</p>
            <p className="text-2xl font-bold text-yellow-400">{gameLevel}</p>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative">
          <div 
            className="grid gap-[1px] bg-white/10 backdrop-blur-sm p-2 rounded-xl"
            style={{ 
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            }}
          >
            {displayBoard.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm transition-colors"
                  style={{
                    backgroundColor: cell || 'rgba(255,255,255,0.05)',
                    boxShadow: cell ? `0 0 8px ${cell}40` : 'none',
                  }}
                />
              ))
            )}
          </div>

          {/* Game Over / Pause Overlay */}
          {(gameOver || isPaused) && (
            <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {gameOver ? '💥 Game Over!' : '⏸️ Paused'}
                </h2>
                {gameOver && (
                  <p className="text-white/80 mb-4">Score: {score}</p>
                )}
                <Button onClick={gameOver ? resetGame : () => setIsPaused(false)} className="bg-cyan-500 hover:bg-cyan-600">
                  {gameOver ? 'Play Again' : 'Continue'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Next Piece Preview */}
        <div className="hidden md:block">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/60 text-sm text-center mb-2">Next</p>
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${TETROMINOS[nextPiece].shape[0].length}, 1fr)` }}>
                {TETROMINOS[nextPiece].shape.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="w-4 h-4 rounded-sm"
                      style={{
                        backgroundColor: cell ? TETROMINOS[nextPiece].color : 'transparent',
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsPaused(prev => !prev)}
            className="w-full mt-3 bg-white/10 hover:bg-white/20"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="flex md:hidden gap-4 mt-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
          <p className="text-white/60 text-xs">Score</p>
          <p className="text-lg font-bold text-white">{score}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
          <p className="text-white/60 text-xs">Lines</p>
          <p className="text-lg font-bold text-cyan-400">{lines}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
          <p className="text-white/60 text-xs">Level</p>
          <p className="text-lg font-bold text-yellow-400">{gameLevel}</p>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden flex flex-col items-center gap-3 mt-4">
        <Button
          size="lg"
          className="bg-purple-500 hover:bg-purple-600 w-16 h-16 rounded-full"
          onClick={rotate}
        >
          <RotateCw className="w-6 h-6" />
        </Button>
        <div className="flex gap-3">
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 w-16 h-16 rounded-full"
            onClick={() => movePiece(-1, 0)}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-600 w-16 h-16 rounded-full"
            onClick={hardDrop}
          >
            <ChevronDown className="w-8 h-8" />
          </Button>
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 w-16 h-16 rounded-full"
            onClick={() => movePiece(1, 0)}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
        <Button
          size="lg"
          className="bg-green-500 hover:bg-green-600 px-8"
          onClick={() => movePiece(0, 1)}
        >
          <ChevronDown className="w-5 h-5 mr-2" />
          Down
        </Button>
      </div>

      {/* Instructions */}
      <p className="text-white/50 text-sm mt-4 text-center hidden md:block">
        ← → Move | ↑ Rotate | ↓ Soft Drop | Space Hard Drop | P Pause
      </p>
    </div>
  );
}
