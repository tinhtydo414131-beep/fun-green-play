import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Environment, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface TicTacToe3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

const BOARD_SIZE = 30;
const WIN_LENGTH = 5;
const CELL_SIZE = 1.2;
const CELL_GAP = 0.1;

type Player = 'X' | 'O' | null;
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
type GameMode = 'vsAI' | 'vsPlayer';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
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
  value: Player;
  onClick: () => void;
  isWinning: boolean;
  cellSize: number;
}

function Cell({ position, value, onClick, isWinning, cellSize }: CellProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = React.useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && isWinning) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
    }
  });
  
  const actualSize = cellSize * 0.9;
  
  return (
    <group position={position} ref={meshRef}>
      <RoundedBox
        args={[actualSize, actualSize, 0.15]}
        radius={0.05}
        onClick={value ? undefined : onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={isWinning ? '#22c55e' : hovered && !value ? '#e0e7ff' : '#f1f5f9'} 
          metalness={0.1}
          roughness={0.8}
        />
      </RoundedBox>
      
      {value === 'X' && (
        <group>
          <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[actualSize * 0.7, actualSize * 0.12, 0.1]} />
            <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.1]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[actualSize * 0.7, actualSize * 0.12, 0.1]} />
            <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      )}
      
      {value === 'O' && (
        <mesh position={[0, 0, 0.1]}>
          <torusGeometry args={[actualSize * 0.25, actualSize * 0.08, 16, 32]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

function CameraController({ targetPosition }: { targetPosition: [number, number, number] }) {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame(() => {
    currentTarget.current.lerp(new THREE.Vector3(...targetPosition), 0.05);
    camera.lookAt(currentTarget.current);
  });
  
  return null;
}

function Board({ 
  board, 
  onCellClick, 
  winningCells,
  viewOffset,
  viewSize
}: { 
  board: Player[]; 
  onCellClick: (index: number) => void;
  winningCells: Set<number>;
  viewOffset: { x: number; y: number };
  viewSize: number;
}) {
  const cellSpacing = CELL_SIZE + CELL_GAP;
  const visibleCells: { index: number; x: number; y: number }[] = [];
  
  // Only render visible cells for performance
  const startX = Math.max(0, Math.floor(viewOffset.x));
  const startY = Math.max(0, Math.floor(viewOffset.y));
  const endX = Math.min(BOARD_SIZE, startX + viewSize + 2);
  const endY = Math.min(BOARD_SIZE, startY + viewSize + 2);
  
  for (let row = startY; row < endY; row++) {
    for (let col = startX; col < endX; col++) {
      const index = row * BOARD_SIZE + col;
      visibleCells.push({ index, x: col, y: row });
    }
  }
  
  const boardWidth = BOARD_SIZE * cellSpacing;
  const boardHeight = BOARD_SIZE * cellSpacing;
  
  return (
    <group>
      {/* Board background */}
      <mesh position={[boardWidth / 2 - cellSpacing / 2, -boardHeight / 2 + cellSpacing / 2, -0.2]}>
        <boxGeometry args={[boardWidth + 0.5, boardHeight + 0.5, 0.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Cells */}
      {visibleCells.map(({ index, x, y }) => {
        const posX = x * cellSpacing;
        const posY = -y * cellSpacing;
        
        return (
          <Cell
            key={index}
            position={[posX, posY, 0]}
            value={board[index]}
            onClick={() => onCellClick(index)}
            isWinning={winningCells.has(index)}
            cellSize={CELL_SIZE}
          />
        );
      })}
    </group>
  );
}

interface GameSceneProps {
  board: Player[];
  onCellClick: (index: number) => void;
  winningCells: Set<number>;
  cameraPos: [number, number, number];
  viewOffset: { x: number; y: number };
  viewSize: number;
}

function GameScene({ board, onCellClick, winningCells, cameraPos, viewOffset, viewSize }: GameSceneProps) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(...cameraPos);
  }, [camera, cameraPos]);
  
  const centerX = (viewOffset.x + viewSize / 2) * (CELL_SIZE + CELL_GAP);
  const centerY = -(viewOffset.y + viewSize / 2) * (CELL_SIZE + CELL_GAP);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 10]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.3} color="#3b82f6" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#ef4444" />
      
      <Board 
        board={board} 
        onCellClick={onCellClick} 
        winningCells={winningCells}
        viewOffset={viewOffset}
        viewSize={viewSize}
      />
      
      <CameraController targetPosition={[centerX, centerY, 0]} />
      <Environment preset="city" />
    </>
  );
}

export default function TicTacToe3D({ level = 1, onLevelComplete, onBack }: TicTacToe3DProps) {
  const [board, setBoard] = useState<Player[]>(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  const [winningCells, setWinningCells] = useState<Set<number>>(new Set());
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('vsAI');
  const [gameStarted, setGameStarted] = useState(false);
  const [viewOffset, setViewOffset] = useState({ x: 10, y: 10 });
  const [zoom, setZoom] = useState(30);
  
  const viewSize = Math.floor(zoom / (CELL_SIZE + CELL_GAP));
  const cameraZ = zoom;
  const cameraPos: [number, number, number] = [
    (viewOffset.x + viewSize / 2) * (CELL_SIZE + CELL_GAP),
    -(viewOffset.y + viewSize / 2) * (CELL_SIZE + CELL_GAP),
    cameraZ
  ];
  
  const checkWinner = useCallback((squares: Player[], lastMove: number): { winner: Player; cells: number[] } | null => {
    if (lastMove === -1) return null;
    
    const row = Math.floor(lastMove / BOARD_SIZE);
    const col = lastMove % BOARD_SIZE;
    const player = squares[lastMove];
    
    if (!player) return null;

    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      const cells = [lastMove];
      
      // Check positive direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
          if (squares[r * BOARD_SIZE + c] === player) {
            cells.push(r * BOARD_SIZE + c);
          } else break;
        } else break;
      }
      
      // Check negative direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
          if (squares[r * BOARD_SIZE + c] === player) {
            cells.push(r * BOARD_SIZE + c);
          } else break;
        } else break;
      }
      
      if (cells.length >= WIN_LENGTH) {
        return { winner: player, cells };
      }
    }
    
    return null;
  }, []);
  
  const getEmptyCells = (squares: Player[]): number[] => {
    return squares.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
  };
  
  const evaluatePosition = useCallback((squares: Player[], player: Player): number => {
    let score = 0;
    const opponent = player === 'O' ? 'X' : 'O';
    
    // Check around played cells only for performance
    const playedCells = squares.map((cell, i) => cell !== null ? i : -1).filter(i => i !== -1);
    
    for (const cell of playedCells) {
      const row = Math.floor(cell / BOARD_SIZE);
      const col = cell % BOARD_SIZE;
      
      if (squares[cell] === player) {
        // Bonus for center positions
        const distFromCenter = Math.abs(row - BOARD_SIZE / 2) + Math.abs(col - BOARD_SIZE / 2);
        score += Math.max(0, BOARD_SIZE - distFromCenter) * 0.1;
      }
    }
    
    return score;
  }, []);
  
  const getBestMove = useCallback((squares: Player[]): number => {
    const emptyCells = getEmptyCells(squares);
    if (emptyCells.length === 0) return -1;
    
    // Find cells near existing plays
    const playedCells = squares.map((cell, i) => cell !== null ? i : -1).filter(i => i !== -1);
    const nearbyEmpty: number[] = [];
    
    for (const played of playedCells) {
      const row = Math.floor(played / BOARD_SIZE);
      const col = played % BOARD_SIZE;
      
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            const idx = r * BOARD_SIZE + c;
            if (squares[idx] === null && !nearbyEmpty.includes(idx)) {
              nearbyEmpty.push(idx);
            }
          }
        }
      }
    }
    
    const candidates = nearbyEmpty.length > 0 ? nearbyEmpty : emptyCells;
    
    // Easy: mostly random moves
    if (difficulty === 'easy' && Math.random() < 0.8) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    
    // Medium: 40% random
    if (difficulty === 'medium' && Math.random() < 0.4) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    
    // Hard: 15% random
    if (difficulty === 'hard' && Math.random() < 0.15) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    
    // Expert: always optimal + look ahead for threats
    if (difficulty === 'expert') {
      // Check for creating winning threat (4 in a row with open ends)
      for (const move of candidates) {
        const newSquares = [...squares];
        newSquares[move] = 'O';
        let threatCount = 0;
        for (const nextMove of candidates) {
          if (nextMove === move) continue;
          const testSquares = [...newSquares];
          testSquares[nextMove] = 'O';
          if (checkWinner(testSquares, nextMove)?.winner === 'O') {
            threatCount++;
          }
        }
        if (threatCount >= 2) return move; // Double threat = guaranteed win
      }
    }
    
    // Check for winning moves and blocking moves
    for (const move of candidates) {
      const newSquares = [...squares];
      newSquares[move] = 'O';
      if (checkWinner(newSquares, move)?.winner === 'O') {
        return move; // Win immediately
      }
    }
    
    for (const move of candidates) {
      const newSquares = [...squares];
      newSquares[move] = 'X';
      if (checkWinner(newSquares, move)?.winner === 'X') {
        return move; // Block opponent
      }
    }
    
    // Pick best scoring move
    let bestScore = -Infinity;
    let bestMoves: number[] = [];
    
    for (const move of candidates) {
      const newSquares = [...squares];
      newSquares[move] = 'O';
      const score = evaluatePosition(newSquares, 'O') - evaluatePosition(newSquares, 'X');
      
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
    
    return bestMoves[Math.floor(Math.random() * bestMoves.length)] || candidates[0];
  }, [difficulty, checkWinner, evaluatePosition]);
  
  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner) return;
    
    // In 2P mode, allow both players. In AI mode, only X can play directly
    if (gameMode === 'vsAI' && currentPlayer !== 'X') return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    // Center view on last move
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    setViewOffset({
      x: Math.max(0, Math.min(BOARD_SIZE - viewSize, col - viewSize / 2)),
      y: Math.max(0, Math.min(BOARD_SIZE - viewSize, row - viewSize / 2))
    });
    
    const result = checkWinner(newBoard, index);
    if (result) {
      setWinner(result.winner);
      setWinningCells(new Set(result.cells));
      setScore(prev => ({ ...prev, [result.winner as 'X' | 'O']: prev[result.winner as 'X' | 'O'] + 1 }));
      if (result.winner === 'X' && onLevelComplete) {
        setTimeout(() => onLevelComplete(100, 10), 1500);
      }
      return;
    }
    
    if (!newBoard.includes(null)) {
      setWinner('draw');
      return;
    }
    
    // 2 Player mode: switch turns
    if (gameMode === 'vsPlayer') {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      return;
    }
    
    // AI move
    setCurrentPlayer('O');
    setTimeout(() => {
      const aiMove = getBestMove(newBoard);
      if (aiMove === -1) return;
      
      const aiBoard = [...newBoard];
      aiBoard[aiMove] = 'O';
      setBoard(aiBoard);
      
      const aiResult = checkWinner(aiBoard, aiMove);
      if (aiResult) {
        setWinner(aiResult.winner);
        setWinningCells(new Set(aiResult.cells));
        if (aiResult.winner === 'O') {
          setScore(prev => ({ ...prev, O: prev.O + 1 }));
        }
      } else if (!aiBoard.includes(null)) {
        setWinner('draw');
      } else {
        setCurrentPlayer('X');
      }
    }, 300);
  }, [board, winner, currentPlayer, gameMode, viewSize, checkWinner, getBestMove, onLevelComplete]);
  
  const resetGame = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCells(new Set());
    setViewOffset({ x: 10, y: 10 });
  };
  
  const startGame = (mode: GameMode, diff?: Difficulty) => {
    setGameMode(mode);
    if (diff) setDifficulty(diff);
    setGameStarted(true);
    resetGame();
  };
  
  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 3;
    setViewOffset(prev => {
      switch (direction) {
        case 'up': return { ...prev, y: Math.max(0, prev.y - step) };
        case 'down': return { ...prev, y: Math.min(BOARD_SIZE - viewSize, prev.y + step) };
        case 'left': return { ...prev, x: Math.max(0, prev.x - step) };
        case 'right': return { ...prev, x: Math.min(BOARD_SIZE - viewSize, prev.x + step) };
        default: return prev;
      }
    });
  };
  
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(15, Math.min(60, prev + delta)));
  };
  
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 gap-6 p-4">
        <h2 className="text-3xl font-bold text-white">Caro 5 Ô (30x30)</h2>
        <p className="text-gray-400 text-center">Nối 5 ô liên tiếp để thắng</p>
        
        {/* 2 Player Mode */}
        <div className="w-full max-w-xs">
          <Button 
            onClick={() => startGame('vsPlayer')} 
            size="lg" 
            className="w-full bg-purple-500 hover:bg-purple-600 text-white mb-4"
          >
            👥 2 Người chơi
          </Button>
        </div>
        
        <p className="text-gray-500 text-sm">— hoặc chơi với máy —</p>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button 
            onClick={() => startGame('vsAI', 'easy')} 
            size="lg" 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            🌱 Dễ
          </Button>
          <Button 
            onClick={() => startGame('vsAI', 'medium')} 
            size="lg" 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            ⚡ Trung bình
          </Button>
          <Button 
            onClick={() => startGame('vsAI', 'hard')} 
            size="lg" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            🔥 Khó
          </Button>
          <Button 
            onClick={() => startGame('vsAI', 'expert')} 
            size="lg" 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            💀 Chuyên gia
          </Button>
        </div>
        
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mt-4 text-white border-white/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800">
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
        
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            gameMode === 'vsPlayer' ? 'bg-purple-500/20 text-purple-400' :
            difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
            difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            difficulty === 'hard' ? 'bg-orange-500/20 text-orange-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {gameMode === 'vsPlayer' ? '2P' :
             difficulty === 'easy' ? 'Dễ' : 
             difficulty === 'medium' ? 'TB' : 
             difficulty === 'hard' ? 'Khó' : 'Pro'}
          </span>
          <span className="text-white font-medium">
            Lượt: {gameMode === 'vsPlayer' 
              ? (currentPlayer === 'X' ? 'Người chơi 1 (X)' : 'Người chơi 2 (O)')
              : (currentPlayer === 'X' ? 'Bạn (X)' : 'Máy (O)')}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-10)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(10)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetGame}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Pan controls */}
      <div className="absolute bottom-24 right-4 z-10 grid grid-cols-3 gap-1">
        <div />
        <Button size="sm" variant="outline" onClick={() => handlePan('up')} className="bg-white/10 border-white/20 text-white">↑</Button>
        <div />
        <Button size="sm" variant="outline" onClick={() => handlePan('left')} className="bg-white/10 border-white/20 text-white">←</Button>
        <div />
        <Button size="sm" variant="outline" onClick={() => handlePan('right')} className="bg-white/10 border-white/20 text-white">→</Button>
        <div />
        <Button size="sm" variant="outline" onClick={() => handlePan('down')} className="bg-white/10 border-white/20 text-white">↓</Button>
        <div />
      </div>
      
      {/* Score display */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-4">
        <span className="text-red-400 font-bold">X: {score.X}</span>
        <span className="text-blue-400 font-bold">O: {score.O}</span>
      </div>
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: cameraPos, fov: 50 }}>
        <React.Suspense fallback={<Loader />}>
          <GameScene
            board={board}
            onCellClick={handleCellClick}
            winningCells={winningCells}
            cameraPos={cameraPos}
            viewOffset={viewOffset}
            viewSize={viewSize}
          />
        </React.Suspense>
      </Canvas>
      
      {/* Winner overlay */}
      {winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            {winner === 'draw' ? (
              <>
                <h2 className="text-3xl font-bold text-gray-600 mb-4">Hòa rồi! 🤝</h2>
                <p className="text-gray-500 mb-6">Trận đấu hay! Chơi lại nhé?</p>
              </>
            ) : (
              <>
                <h2 className={`text-3xl font-bold mb-4 ${winner === 'X' ? 'text-red-500' : 'text-blue-500'}`}>
                  {winner === 'X' ? 'Bạn thắng!' : 'Máy thắng!'} 🎉
                </h2>
                {winner === 'X' && <p className="text-green-500 mb-4">+10 coins!</p>}
              </>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700">
                Chơi lại
              </Button>
              <Button onClick={() => setGameStarted(false)} variant="outline">
                Đổi độ khó
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
