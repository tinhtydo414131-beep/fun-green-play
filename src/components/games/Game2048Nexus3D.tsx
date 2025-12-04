import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Html, Float } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface Game2048Nexus3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

const Loader = () => {
  return (
    <Html center>
      <div className="text-primary font-fredoka text-xl">Loading...</div>
    </Html>
  );
};

type Grid = (number | null)[][];

const TILE_COLORS: { [key: number]: string } = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
  4096: '#3c3a32',
  8192: '#3c3a32',
};

const Tile3D = ({ value, position, gridSize }: { value: number; position: [number, number, number]; gridSize: number }) => {
  const color = TILE_COLORS[value] || '#3c3a32';
  const textColor = value >= 8 ? '#f9f6f2' : '#776e65';
  const scale = value >= 1000 ? 0.3 : value >= 100 ? 0.4 : 0.5;
  
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={position}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.3, 0.9]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
        </mesh>
        <Text
          position={[0, 0.2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={scale}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          font="/fonts/fredoka.woff"
        >
          {value}
        </Text>
      </group>
    </Float>
  );
};

const Board3D = ({ grid }: { grid: Grid }) => {
  const gridSize = grid.length;
  const offset = (gridSize - 1) / 2;
  
  return (
    <group>
      {/* Board base */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[gridSize + 0.4, 0.3, gridSize + 0.4]} />
        <meshStandardMaterial color="#bbada0" metalness={0.2} roughness={0.7} />
      </mesh>
      
      {/* Grid cells */}
      {grid.map((row, rowIndex) =>
        row.map((_, colIndex) => (
          <mesh
            key={`cell-${rowIndex}-${colIndex}`}
            position={[colIndex - offset, -0.03, rowIndex - offset]}
          >
            <boxGeometry args={[0.92, 0.1, 0.92]} />
            <meshStandardMaterial color="#cdc1b4" metalness={0.1} roughness={0.8} />
          </mesh>
        ))
      )}
      
      {/* Tiles */}
      {grid.map((row, rowIndex) =>
        row.map((value, colIndex) =>
          value ? (
            <Tile3D
              key={`tile-${rowIndex}-${colIndex}-${value}`}
              value={value}
              position={[colIndex - offset, 0.1, rowIndex - offset]}
              gridSize={gridSize}
            />
          ) : null
        )
      )}
    </group>
  );
};

const GameScene = ({ grid, score }: { grid: Grid; score: number }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffa500" />
      
      <Board3D grid={grid} />
      
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color="#776e65"
        anchorX="center"
        anchorY="middle"
      >
        {`Score: ${score}`}
      </Text>
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 3}
        minDistance={5}
        maxDistance={12}
        target={[0, 0, 0]}
      />
      <Environment preset="sunset" />
    </>
  );
};

export const Game2048Nexus3D: React.FC<Game2048Nexus3DProps> = ({
  level = 1,
  onLevelComplete,
  onBack
}) => {
  const gridSize = 4;
  const [grid, setGrid] = useState<Grid>(() => initializeGrid(gridSize));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const targetTile = 2048 + (level - 1) * 1024;

  function initializeGrid(size: number): Grid {
    const newGrid: Grid = Array(size).fill(null).map(() => Array(size).fill(null));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    return newGrid;
  }

  function addRandomTile(grid: Grid): boolean {
    const emptyCells: [number, number][] = [];
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === null) emptyCells.push([i, j]);
      });
    });
    
    if (emptyCells.length === 0) return false;
    
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || won) return;

    const newGrid = grid.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const slideAndMerge = (line: (number | null)[]): (number | null)[] => {
      const filtered = line.filter(x => x !== null) as number[];
      const merged: (number | null)[] = [];
      
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const mergedValue = filtered[i] * 2;
          merged.push(mergedValue);
          newScore += mergedValue;
          if (mergedValue >= targetTile) {
            setWon(true);
            onLevelComplete?.(newScore, Math.floor(newScore / 100));
          }
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      
      while (merged.length < line.length) merged.push(null);
      return merged;
    };

    if (direction === 'left') {
      for (let i = 0; i < gridSize; i++) {
        const newRow = slideAndMerge(newGrid[i]);
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[i])) moved = true;
        newGrid[i] = newRow;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < gridSize; i++) {
        const newRow = slideAndMerge([...newGrid[i]].reverse()).reverse();
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[i])) moved = true;
        newGrid[i] = newRow;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < gridSize; j++) {
        const col = newGrid.map(row => row[j]);
        const newCol = slideAndMerge(col);
        if (JSON.stringify(newCol) !== JSON.stringify(col)) moved = true;
        newCol.forEach((val, i) => newGrid[i][j] = val);
      }
    } else if (direction === 'down') {
      for (let j = 0; j < gridSize; j++) {
        const col = newGrid.map(row => row[j]);
        const newCol = slideAndMerge([...col].reverse()).reverse();
        if (JSON.stringify(newCol) !== JSON.stringify(col)) moved = true;
        newCol.forEach((val, i) => newGrid[i][j] = val);
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      
      // Check game over
      const hasEmpty = newGrid.some(row => row.some(cell => cell === null));
      if (!hasEmpty) {
        let canMove = false;
        for (let i = 0; i < gridSize && !canMove; i++) {
          for (let j = 0; j < gridSize && !canMove; j++) {
            if (j < gridSize - 1 && newGrid[i][j] === newGrid[i][j + 1]) canMove = true;
            if (i < gridSize - 1 && newGrid[i][j] === newGrid[i + 1][j]) canMove = true;
          }
        }
        if (!canMove) setGameOver(true);
      }
    }
  }, [grid, score, gameOver, won, targetTile, onLevelComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': move('up'); break;
        case 'ArrowDown': case 's': case 'S': move('down'); break;
        case 'ArrowLeft': case 'a': case 'A': move('left'); break;
        case 'ArrowRight': case 'd': case 'D': move('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const resetGame = () => {
    setGrid(initializeGrid(gridSize));
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="w-full h-[500px] md:h-[600px] relative">
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="font-fredoka">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-fredoka text-lg bg-primary/20 px-3 py-1 rounded-lg">
            Score: {score}
          </span>
          <span className="font-fredoka text-sm bg-secondary/20 px-2 py-1 rounded-lg">
            Target: {targetTile}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="font-fredoka">
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
      </div>

      {(gameOver || won) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="bg-background p-6 rounded-xl text-center space-y-4">
            <h2 className="text-2xl font-fredoka font-bold text-primary">
              {won ? '🎉 You Won!' : '😔 Game Over'}
            </h2>
            <p className="font-comic text-muted-foreground">Final Score: {score}</p>
            <Button onClick={resetGame} className="font-fredoka">
              Play Again
            </Button>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 8, 6], fov: 45 }}>
        <Suspense fallback={<Loader />}>
          <GameScene grid={grid} score={score} />
        </Suspense>
      </Canvas>

      {/* Touch controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 grid grid-cols-3 gap-1 md:hidden">
        <div />
        <Button size="sm" onClick={() => move('up')} className="font-fredoka">↑</Button>
        <div />
        <Button size="sm" onClick={() => move('left')} className="font-fredoka">←</Button>
        <Button size="sm" onClick={() => move('down')} className="font-fredoka">↓</Button>
        <Button size="sm" onClick={() => move('right')} className="font-fredoka">→</Button>
      </div>
    </div>
  );
};

export default Game2048Nexus3D;
