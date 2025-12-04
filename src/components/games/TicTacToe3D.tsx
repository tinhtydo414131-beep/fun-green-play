import React, { useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface TicTacToe3DProps {
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
  value: 'X' | 'O' | null;
  onClick: () => void;
  isWinning: boolean;
}

function Cell({ position, value, onClick, isWinning }: CellProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = React.useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && isWinning) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
    }
  });
  
  return (
    <group position={position} ref={meshRef}>
      {/* Cell background */}
      <RoundedBox
        args={[1.8, 1.8, 0.3]}
        radius={0.1}
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
      
      {/* X mark */}
      {value === 'X' && (
        <group>
          <mesh position={[0, 0, 0.2]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.4, 0.25, 0.2]} />
            <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.2]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[1.4, 0.25, 0.2]} />
            <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      )}
      
      {/* O mark */}
      {value === 'O' && (
        <mesh position={[0, 0, 0.2]}>
          <torusGeometry args={[0.5, 0.15, 16, 32]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

function Board({ board, onCellClick, winningLine }: { 
  board: ('X' | 'O' | null)[]; 
  onCellClick: (index: number) => void;
  winningLine: number[] | null;
}) {
  const positions: [number, number, number][] = [
    [-2, 2, 0], [0, 2, 0], [2, 2, 0],
    [-2, 0, 0], [0, 0, 0], [2, 0, 0],
    [-2, -2, 0], [0, -2, 0], [2, -2, 0]
  ];
  
  return (
    <group>
      {/* Board frame */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[6.5, 6.5, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Grid lines */}
      {[-1, 1].map((offset) => (
        <React.Fragment key={offset}>
          <mesh position={[offset, 0, 0]}>
            <boxGeometry args={[0.1, 6, 0.15]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, offset, 0]}>
            <boxGeometry args={[6, 0.1, 0.15]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </React.Fragment>
      ))}
      
      {/* Cells */}
      {board.map((value, index) => (
        <Cell
          key={index}
          position={positions[index]}
          value={value}
          onClick={() => onCellClick(index)}
          isWinning={winningLine?.includes(index) || false}
        />
      ))}
    </group>
  );
}

interface GameSceneProps {
  board: ('X' | 'O' | null)[];
  onCellClick: (index: number) => void;
  winningLine: number[] | null;
  currentPlayer: 'X' | 'O';
  score: { X: number; O: number };
}

function GameScene({ board, onCellClick, winningLine, currentPlayer, score }: GameSceneProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.3} color="#3b82f6" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#ef4444" />
      
      <Board board={board} onCellClick={onCellClick} winningLine={winningLine} />
      
      {/* Current player indicator */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color={currentPlayer === 'X' ? '#ef4444' : '#3b82f6'}
        anchorX="center"
      >
        {`${currentPlayer}'s Turn`}
      </Text>
      
      {/* Score display */}
      <Text position={[-3, 4, 0]} fontSize={0.4} color="#ef4444" anchorX="center">
        {`X: ${score.X}`}
      </Text>
      <Text position={[3, 4, 0]} fontSize={0.4} color="#3b82f6" anchorX="center">
        {`O: ${score.O}`}
      </Text>
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
      
      <Environment preset="city" />
    </>
  );
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

export default function TicTacToe3D({ level = 1, onLevelComplete, onBack }: TicTacToe3DProps) {
  const [board, setBoard] = useState<('X' | 'O' | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [isVsAI, setIsVsAI] = useState(true);
  
  const checkWinner = useCallback((currentBoard: ('X' | 'O' | null)[]) => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw' as const, line: null };
    }
    return null;
  }, []);
  
  const minimax = useCallback((currentBoard: ('X' | 'O' | null)[], isMaximizing: boolean, depth: number): number => {
    const result = checkWinner(currentBoard);
    if (result) {
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      return 0;
    }
    
    const availableMoves = currentBoard.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
    
    if (isMaximizing) {
      let best = -Infinity;
      for (const move of availableMoves) {
        const newBoard = [...currentBoard];
        newBoard[move] = 'O';
        best = Math.max(best, minimax(newBoard, false, depth + 1));
      }
      return best;
    } else {
      let best = Infinity;
      for (const move of availableMoves) {
        const newBoard = [...currentBoard];
        newBoard[move] = 'X';
        best = Math.min(best, minimax(newBoard, true, depth + 1));
      }
      return best;
    }
  }, [checkWinner]);
  
  const getAIMove = useCallback((currentBoard: ('X' | 'O' | null)[]) => {
    const availableMoves = currentBoard.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
    
    // Easy AI for lower levels - random moves sometimes
    if (level < 3 && Math.random() < 0.4) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    let bestMove = availableMoves[0];
    let bestScore = -Infinity;
    
    for (const move of availableMoves) {
      const newBoard = [...currentBoard];
      newBoard[move] = 'O';
      const score = minimax(newBoard, false, 0);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }, [level, minimax]);
  
  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      if (result.winner !== 'draw') {
        setWinner(result.winner);
        setWinningLine(result.line);
        setScore(prev => ({
          ...prev,
          [result.winner as 'X' | 'O']: prev[result.winner as 'X' | 'O'] + 1
        }));
        if (result.winner === 'X' && onLevelComplete) {
          setTimeout(() => onLevelComplete(100, 10), 1500);
        }
      } else {
        setWinner('draw');
      }
      return;
    }
    
    if (isVsAI && currentPlayer === 'X') {
      setCurrentPlayer('O');
      // AI move after short delay
      setTimeout(() => {
        const aiMove = getAIMove(newBoard);
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);
        
        const aiResult = checkWinner(aiBoard);
        if (aiResult) {
          if (aiResult.winner !== 'draw') {
            setWinner(aiResult.winner);
            setWinningLine(aiResult.line);
            setScore(prev => ({
              ...prev,
              [aiResult.winner as 'X' | 'O']: prev[aiResult.winner as 'X' | 'O'] + 1
            }));
          } else {
            setWinner('draw');
          }
        } else {
          setCurrentPlayer('X');
        }
      }, 500);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  }, [board, currentPlayer, winner, isVsAI, checkWinner, getAIMove, onLevelComplete]);
  
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };
  
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
        
        <div className="flex gap-2">
          <Button
            variant={isVsAI ? "default" : "outline"}
            size="sm"
            onClick={() => { setIsVsAI(true); resetGame(); }}
            className={isVsAI ? "bg-purple-600" : "bg-white/10 text-white border-white/20"}
          >
            vs AI
          </Button>
          <Button
            variant={!isVsAI ? "default" : "outline"}
            size="sm"
            onClick={() => { setIsVsAI(false); resetGame(); }}
            className={!isVsAI ? "bg-purple-600" : "bg-white/10 text-white border-white/20"}
          >
            2 Players
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetGame}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <React.Suspense fallback={<Loader />}>
          <GameScene
            board={board}
            onCellClick={handleCellClick}
            winningLine={winningLine}
            currentPlayer={currentPlayer}
            score={score}
          />
        </React.Suspense>
      </Canvas>
      
      {/* Winner overlay */}
      {winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            {winner === 'draw' ? (
              <>
                <h2 className="text-3xl font-bold text-gray-600 mb-4">It's a Draw!</h2>
                <p className="text-gray-500 mb-6">Good game! Try again?</p>
              </>
            ) : (
              <>
                <h2 className={`text-3xl font-bold mb-4 ${winner === 'X' ? 'text-red-500' : 'text-blue-500'}`}>
                  {winner} Wins! 🎉
                </h2>
                {winner === 'X' && <p className="text-green-500 mb-4">+10 coins earned!</p>}
              </>
            )}
            <Button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700">
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
