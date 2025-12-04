import React, { useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Lightbulb } from 'lucide-react';

interface Sudoku3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface CellProps {
  position: [number, number, number];
  value: number;
  isOriginal: boolean;
  isSelected: boolean;
  isError: boolean;
  onClick: () => void;
}

function Cell({ position, value, isOriginal, isSelected, isError, onClick }: CellProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = React.useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.z = 0.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });
  
  const bgColor = isError ? '#fecaca' : isSelected ? '#bfdbfe' : hovered ? '#e0f2fe' : '#ffffff';
  const textColor = isOriginal ? '#1e293b' : '#3b82f6';
  
  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[0.9, 0.9, 0.2]}
        radius={0.05}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial color={bgColor} />
      </RoundedBox>
      {value !== 0 && (
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.5}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          font={isOriginal ? undefined : undefined}
        >
          {value}
        </Text>
      )}
    </group>
  );
}

interface BoardProps {
  board: number[][];
  originalBoard: number[][];
  selectedCell: [number, number] | null;
  errors: Set<string>;
  onCellClick: (row: number, col: number) => void;
}

function Board({ board, originalBoard, selectedCell, errors, onCellClick }: BoardProps) {
  return (
    <group>
      {/* Board background */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[9.5, 9.5, 0.2]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      
      {/* 3x3 box dividers */}
      {[0, 1, 2].map(boxRow => (
        [0, 1, 2].map(boxCol => (
          <mesh
            key={`box-${boxRow}-${boxCol}`}
            position={[(boxCol - 1) * 3, (1 - boxRow) * 3, -0.1]}
          >
            <boxGeometry args={[2.95, 2.95, 0.15]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        ))
      ))}
      
      {/* Cells */}
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            position={[colIndex - 4, 4 - rowIndex, 0]}
            value={value}
            isOriginal={originalBoard[rowIndex][colIndex] !== 0}
            isSelected={selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex}
            isError={errors.has(`${rowIndex}-${colIndex}`)}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </group>
  );
}

interface GameSceneProps {
  board: number[][];
  originalBoard: number[][];
  selectedCell: [number, number] | null;
  errors: Set<string>;
  onCellClick: (row: number, col: number) => void;
  progress: number;
}

function GameScene({ board, originalBoard, selectedCell, errors, onCellClick, progress }: GameSceneProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <pointLight position={[-5, 5, 5]} intensity={0.4} color="#3b82f6" />
      
      <Board
        board={board}
        originalBoard={originalBoard}
        selectedCell={selectedCell}
        errors={errors}
        onCellClick={onCellClick}
      />
      
      {/* Progress text */}
      <Text position={[0, 5.5, 0]} fontSize={0.4} color="#94a3b8">
        {`Progress: ${progress}%`}
      </Text>
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={15}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
      
      <Environment preset="city" />
    </>
  );
}

// Sudoku puzzle generator
function generateSudoku(difficulty: number): { puzzle: number[][]; solution: number[][] } {
  // Simple puzzle templates based on difficulty
  const puzzles = [
    // Easy
    {
      puzzle: [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
      ],
      solution: [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
      ]
    },
    // Medium
    {
      puzzle: [
        [0,0,0,2,6,0,7,0,1],
        [6,8,0,0,7,0,0,9,0],
        [1,9,0,0,0,4,5,0,0],
        [8,2,0,1,0,0,0,4,0],
        [0,0,4,6,0,2,9,0,0],
        [0,5,0,0,0,3,0,2,8],
        [0,0,9,3,0,0,0,7,4],
        [0,4,0,0,5,0,0,3,6],
        [7,0,3,0,1,8,0,0,0]
      ],
      solution: [
        [4,3,5,2,6,9,7,8,1],
        [6,8,2,5,7,1,4,9,3],
        [1,9,7,8,3,4,5,6,2],
        [8,2,6,1,9,5,3,4,7],
        [3,7,4,6,8,2,9,1,5],
        [9,5,1,7,4,3,6,2,8],
        [5,1,9,3,2,6,8,7,4],
        [2,4,8,9,5,7,1,3,6],
        [7,6,3,4,1,8,2,5,9]
      ]
    }
  ];
  
  const index = Math.min(difficulty - 1, puzzles.length - 1);
  return puzzles[Math.max(0, index)];
}

export default function Sudoku3D({ level = 1, onLevelComplete, onBack }: Sudoku3DProps) {
  const [gameData] = useState(() => generateSudoku(level));
  const [board, setBoard] = useState<number[][]>(gameData.puzzle.map(row => [...row]));
  const [originalBoard] = useState<number[][]>(gameData.puzzle);
  const [solution] = useState<number[][]>(gameData.solution);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const maxHints = 3;
  
  const calculateProgress = useCallback(() => {
    let filled = 0;
    let total = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (originalBoard[i][j] === 0) {
          total++;
          if (board[i][j] !== 0) filled++;
        }
      }
    }
    return total > 0 ? Math.round((filled / total) * 100) : 100;
  }, [board, originalBoard]);
  
  const checkErrors = useCallback(() => {
    const newErrors = new Set<string>();
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== 0 && board[i][j] !== solution[i][j]) {
          newErrors.add(`${i}-${j}`);
        }
      }
    }
    
    setErrors(newErrors);
    return newErrors.size === 0;
  }, [board, solution]);
  
  const checkCompletion = useCallback(() => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== solution[i][j]) return false;
      }
    }
    return true;
  }, [board, solution]);
  
  const handleCellClick = (row: number, col: number) => {
    if (originalBoard[row][col] === 0) {
      setSelectedCell([row, col]);
    }
  };
  
  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    if (originalBoard[row][col] !== 0) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    // Check errors after a short delay
    setTimeout(() => {
      checkErrors();
      if (checkCompletion() && onLevelComplete) {
        onLevelComplete(1000 - (hintsUsed * 100), 20 - (hintsUsed * 5));
      }
    }, 100);
  };
  
  const handleHint = () => {
    if (hintsUsed >= maxHints || !selectedCell) return;
    
    const [row, col] = selectedCell;
    if (originalBoard[row][col] !== 0) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHintsUsed(prev => prev + 1);
    
    setTimeout(() => {
      checkErrors();
      if (checkCompletion() && onLevelComplete) {
        onLevelComplete(1000 - (hintsUsed * 100), 20 - (hintsUsed * 5));
      }
    }, 100);
  };
  
  const resetGame = () => {
    setBoard(originalBoard.map(row => [...row]));
    setSelectedCell(null);
    setErrors(new Set());
    setHintsUsed(0);
  };
  
  const progress = calculateProgress();
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-blue-900">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-2 items-center">
          <span className="text-white bg-white/10 px-3 py-1 rounded-full text-sm">
            Level {level}
          </span>
          <span className="text-white bg-blue-500/30 px-3 py-1 rounded-full text-sm">
            {progress}% Complete
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleHint}
            disabled={hintsUsed >= maxHints || !selectedCell}
            className="bg-yellow-500/20 backdrop-blur-sm border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            {maxHints - hintsUsed}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetGame}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <React.Suspense fallback={<Loader />}>
          <GameScene
            board={board}
            originalBoard={originalBoard}
            selectedCell={selectedCell}
            errors={errors}
            onCellClick={handleCellClick}
            progress={progress}
          />
        </React.Suspense>
      </Canvas>
      
      {/* Number pad */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <Button
                key={num}
                size="lg"
                onClick={() => handleNumberInput(num)}
                disabled={!selectedCell}
                className={`w-12 h-12 text-xl font-bold ${
                  num === 0 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' 
                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-white'
                }`}
              >
                {num === 0 ? '×' : num}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Completion screen */}
      {checkCompletion() && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            <h2 className="text-3xl font-bold text-green-600 mb-2">🎉 Puzzle Solved!</h2>
            <p className="text-gray-600 mb-4">You completed the Sudoku!</p>
            <p className="text-yellow-500 font-bold mb-6">+{20 - (hintsUsed * 5)} coins</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
