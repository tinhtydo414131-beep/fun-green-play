import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface RockPaperScissors3DProps {
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
            className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

type Choice = 'rock' | 'paper' | 'scissors' | null;

function Rock({ position, isSelected, isAnimating }: { position: [number, number, number]; isSelected: boolean; isAnimating: boolean }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      if (isAnimating) {
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.5;
      } else {
        ref.current.position.y = position[1] + (isSelected ? 0.3 : 0);
      }
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <mesh>
        <dodecahedronGeometry args={[0.8]} />
        <meshStandardMaterial 
          color={isSelected ? '#fbbf24' : '#64748b'} 
          metalness={0.3} 
          roughness={0.7}
        />
      </mesh>
      <Text position={[0, -1.3, 0]} fontSize={0.3} color="white">Rock</Text>
    </group>
  );
}

function Paper({ position, isSelected, isAnimating }: { position: [number, number, number]; isSelected: boolean; isAnimating: boolean }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      if (isAnimating) {
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.5;
      } else {
        ref.current.position.y = position[1] + (isSelected ? 0.3 : 0);
      }
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.1, 1.5]} />
        <meshStandardMaterial 
          color={isSelected ? '#fbbf24' : '#f8fafc'} 
          metalness={0.1} 
          roughness={0.9}
        />
      </mesh>
      {/* Paper fold effect */}
      <mesh position={[0.4, 0.1, -0.5]} rotation={[0.2, 0, 0.1]}>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color={isSelected ? '#f59e0b' : '#e2e8f0'} />
      </mesh>
      <Text position={[0, -1.3, 0]} fontSize={0.3} color="white">Paper</Text>
    </group>
  );
}

function Scissors({ position, isSelected, isAnimating }: { position: [number, number, number]; isSelected: boolean; isAnimating: boolean }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      if (isAnimating) {
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.5;
      } else {
        ref.current.position.y = position[1] + (isSelected ? 0.3 : 0);
      }
      // Cutting animation
      const scissorAngle = Math.sin(state.clock.elapsedTime * 3) * 0.2;
      ref.current.children[0].rotation.z = scissorAngle;
      ref.current.children[1].rotation.z = -scissorAngle;
    }
  });
  
  const bladeColor = isSelected ? '#fbbf24' : '#94a3b8';
  
  return (
    <group ref={ref} position={position}>
      {/* Blade 1 */}
      <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.15, 1.2, 0.1]} />
        <meshStandardMaterial color={bladeColor} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Blade 2 */}
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.15, 1.2, 0.1]} />
        <meshStandardMaterial color={bladeColor} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.7, 0]}>
        <torusGeometry args={[0.25, 0.08, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, -0.7, 0]} rotation={[0, Math.PI, 0]}>
        <torusGeometry args={[0.25, 0.08, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <Text position={[0, -1.3, 0]} fontSize={0.3} color="white">Scissors</Text>
    </group>
  );
}

function VS() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });
  
  return (
    <Text
      ref={ref}
      position={[0, 1, 0]}
      fontSize={0.8}
      color="#ef4444"
      anchorX="center"
      outlineWidth={0.03}
      outlineColor="#000"
    >
      VS
    </Text>
  );
}

interface GameSceneProps {
  playerChoice: Choice;
  computerChoice: Choice;
  isAnimating: boolean;
  result: 'win' | 'lose' | 'draw' | null;
}

function GameScene({ playerChoice, computerChoice, isAnimating, result }: GameSceneProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[-3, 3, 3]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#ef4444" />
      
      {/* Player side */}
      <Text position={[-3, 3, 0]} fontSize={0.4} color="#3b82f6">You</Text>
      {playerChoice === 'rock' && <Rock position={[-3, 0, 0]} isSelected={true} isAnimating={isAnimating} />}
      {playerChoice === 'paper' && <Paper position={[-3, 0, 0]} isSelected={true} isAnimating={isAnimating} />}
      {playerChoice === 'scissors' && <Scissors position={[-3, 0, 0]} isSelected={true} isAnimating={isAnimating} />}
      
      {/* VS */}
      {playerChoice && computerChoice && <VS />}
      
      {/* Computer side */}
      <Text position={[3, 3, 0]} fontSize={0.4} color="#ef4444">CPU</Text>
      {computerChoice === 'rock' && <Rock position={[3, 0, 0]} isSelected={true} isAnimating={isAnimating} />}
      {computerChoice === 'paper' && <Paper position={[3, 0, 0]} isSelected={true} isAnimating={isAnimating} />}
      {computerChoice === 'scissors' && <Scissors position={[3, 0, 0]} isSelected={true} isAnimating={isAnimating} />}
      
      {/* Result text */}
      {result && (
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.6}
          color={result === 'win' ? '#22c55e' : result === 'lose' ? '#ef4444' : '#eab308'}
          anchorX="center"
        >
          {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : "It's a Draw!"}
        </Text>
      )}
      
      <Environment preset="sunset" />
    </>
  );
}

export default function RockPaperScissors3D({ level = 1, onLevelComplete, onBack }: RockPaperScissors3DProps) {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const targetWins = 3 + level;
  
  const choices: Choice[] = ['rock', 'paper', 'scissors'];
  
  const determineWinner = (player: Choice, computer: Choice): 'win' | 'lose' | 'draw' => {
    if (player === computer) return 'draw';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };
  
  const handleChoice = (choice: Choice) => {
    if (isAnimating || !choice) return;
    
    setPlayerChoice(choice);
    setIsAnimating(true);
    setResult(null);
    
    // Animate for a bit before revealing computer choice
    setTimeout(() => {
      const cpuChoice = choices[Math.floor(Math.random() * 3)];
      setComputerChoice(cpuChoice);
      setIsAnimating(false);
      
      const gameResult = determineWinner(choice, cpuChoice);
      setResult(gameResult);
      
      setScore(prev => ({
        wins: prev.wins + (gameResult === 'win' ? 1 : 0),
        losses: prev.losses + (gameResult === 'lose' ? 1 : 0),
        draws: prev.draws + (gameResult === 'draw' ? 1 : 0)
      }));
      
      setRound(prev => prev + 1);
    }, 1000);
  };
  
  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setScore({ wins: 0, losses: 0, draws: 0 });
    setRound(1);
  };
  
  const nextRound = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };
  
  // Check for game completion
  React.useEffect(() => {
    if (score.wins >= targetWins && onLevelComplete) {
      setTimeout(() => {
        onLevelComplete(score.wins * 100, score.wins * 5);
      }, 1500);
    }
  }, [score.wins, targetWins, onLevelComplete]);
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
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
        
        <div className="flex gap-4 text-white font-bold text-sm">
          <span className="bg-green-500/30 px-3 py-1 rounded-full">Wins: {score.wins}/{targetWins}</span>
          <span className="bg-red-500/30 px-3 py-1 rounded-full">Losses: {score.losses}</span>
          <span className="bg-yellow-500/30 px-3 py-1 rounded-full">Draws: {score.draws}</span>
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
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <React.Suspense fallback={<Loader />}>
          <GameScene
            playerChoice={playerChoice}
            computerChoice={computerChoice}
            isAnimating={isAnimating}
            result={result}
          />
        </React.Suspense>
      </Canvas>
      
      {/* Choice buttons */}
      {!playerChoice && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
          {choices.map((choice) => (
            <Button
              key={choice}
              size="lg"
              onClick={() => handleChoice(choice)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-6 text-lg capitalize"
            >
              {choice === 'rock' && '🪨'}
              {choice === 'paper' && '📄'}
              {choice === 'scissors' && '✂️'}
              <span className="ml-2">{choice}</span>
            </Button>
          ))}
        </div>
      )}
      
      {/* Next round button */}
      {result && score.wins < targetWins && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <Button
            size="lg"
            onClick={nextRound}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
          >
            Next Round
          </Button>
        </div>
      )}
      
      {/* Win screen */}
      {score.wins >= targetWins && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            <h2 className="text-3xl font-bold text-green-600 mb-2">🎉 Victory!</h2>
            <p className="text-gray-600 mb-4">You won {score.wins} rounds!</p>
            <p className="text-yellow-500 font-bold mb-6">+{score.wins * 5} coins</p>
            <Button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700">
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
