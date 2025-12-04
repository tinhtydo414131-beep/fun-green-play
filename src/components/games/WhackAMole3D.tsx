import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

interface WhackAMole3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

interface MoleState {
  id: number;
  isUp: boolean;
  isGolden: boolean;
  isBomb: boolean;
  hitTime: number | null;
}

// Mole Component
const Mole3D = ({ 
  position, 
  moleState, 
  onHit 
}: { 
  position: [number, number, number], 
  moleState: MoleState,
  onHit: () => void 
}) => {
  const moleRef = useRef<THREE.Group>(null);
  const targetY = moleState.isUp ? 0.5 : -0.5;
  
  useFrame(() => {
    if (moleRef.current) {
      moleRef.current.position.y = THREE.MathUtils.lerp(
        moleRef.current.position.y,
        targetY,
        0.15
      );
    }
  });

  const moleColor = moleState.isBomb ? '#333' : moleState.isGolden ? '#FFD700' : '#8B4513';
  const wasHit = moleState.hitTime !== null;

  return (
    <group position={position}>
      {/* Hole */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#2d1b0e" />
      </mesh>
      
      {/* Hole rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.45, 0.55, 32]} />
        <meshStandardMaterial color="#4a3020" />
      </mesh>
      
      {/* Mole */}
      <group ref={moleRef} position={[0, -0.5, 0]} onClick={onHit}>
        {/* Body */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial 
            color={wasHit ? '#FF6B6B' : moleColor} 
            emissive={moleState.isGolden ? '#FFD700' : '#000'}
            emissiveIntensity={moleState.isGolden ? 0.3 : 0}
          />
        </mesh>
        
        {/* Nose */}
        <mesh position={[0, 0.35, 0.3]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={moleState.isBomb ? '#FF0000' : '#FF69B4'} />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.1, 0.45, 0.25]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={wasHit ? '#FF0000' : '#000'} />
        </mesh>
        <mesh position={[0.1, 0.45, 0.25]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={wasHit ? '#FF0000' : '#000'} />
        </mesh>
        
        {/* Ears */}
        <mesh position={[-0.25, 0.5, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={moleColor} />
        </mesh>
        <mesh position={[0.25, 0.5, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={moleColor} />
        </mesh>
        
        {/* Bomb fuse */}
        {moleState.isBomb && (
          <group position={[0, 0.7, 0]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
              <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={0.5} />
            </mesh>
          </group>
        )}
        
        {/* Golden crown */}
        {moleState.isGolden && (
          <mesh position={[0, 0.7, 0]}>
            <coneGeometry args={[0.15, 0.2, 5]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
        )}
      </group>
    </group>
  );
};

// Ground
const GameGround = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#228B22" />
    </mesh>
  );
};

// Game Scene
const GameScene = ({ 
  moles, 
  onMoleHit,
  score 
}: { 
  moles: MoleState[],
  onMoleHit: (id: number) => void,
  score: number
}) => {
  const HOLE_POSITIONS: [number, number, number][] = [
    [-2, 0, -2], [0, 0, -2], [2, 0, -2],
    [-2, 0, 0], [0, 0, 0], [2, 0, 0],
    [-2, 0, 2], [0, 0, 2], [2, 0, 2],
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.3} color="#FFD700" />
      
      <GameGround />
      
      {moles.map((mole, index) => (
        <Mole3D 
          key={mole.id}
          position={HOLE_POSITIONS[index]}
          moleState={mole}
          onHit={() => onMoleHit(mole.id)}
        />
      ))}
      
      <Text position={[0, 4, 0]} fontSize={0.8} color="#8B4513" anchorX="center">
        🔨 Whack-A-Mole
      </Text>
      <Text position={[0, 3.2, 0]} fontSize={0.5} color="#333" anchorX="center">
        Score: {score}
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={8} 
        maxDistance={15}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 3}
      />
      <Environment preset="park" />
    </>
  );
};

const WhackAMole3D: React.FC<WhackAMole3DProps> = ({
  level = 1,
  onLevelComplete,
  onBack
}) => {
  const [moles, setMoles] = useState<MoleState[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const targetScore = level * 150;
  
  const initMoles = useCallback(() => {
    return Array.from({ length: 9 }, (_, i) => ({
      id: i,
      isUp: false,
      isGolden: false,
      isBomb: false,
      hitTime: null
    }));
  }, []);

  const startGame = useCallback(() => {
    setMoles(initMoles());
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setIsPlaying(true);
    setShowGameOver(false);
    setIsWin(false);
  }, [initMoles]);

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          setShowGameOver(true);
          setIsWin(score >= targetScore);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, targetScore]);

  // Mole popup logic
  useEffect(() => {
    if (!isPlaying) return;
    
    const popupInterval = setInterval(() => {
      setMoles(prev => {
        const newMoles = prev.map(mole => ({
          ...mole,
          hitTime: mole.hitTime && Date.now() - mole.hitTime > 300 ? null : mole.hitTime
        }));
        
        // Hide old moles
        const visibleMoles = newMoles.filter(m => m.isUp && !m.hitTime);
        if (visibleMoles.length > 0 && Math.random() > 0.7) {
          const moleToHide = visibleMoles[Math.floor(Math.random() * visibleMoles.length)];
          newMoles[moleToHide.id] = { ...newMoles[moleToHide.id], isUp: false };
        }
        
        // Show new moles
        const hiddenMoles = newMoles.filter(m => !m.isUp);
        if (hiddenMoles.length > 0 && Math.random() > 0.3) {
          const moleToShow = hiddenMoles[Math.floor(Math.random() * hiddenMoles.length)];
          const rand = Math.random();
          newMoles[moleToShow.id] = { 
            ...newMoles[moleToShow.id], 
            isUp: true,
            isGolden: rand > 0.9,
            isBomb: rand > 0.8 && rand <= 0.9,
            hitTime: null
          };
        }
        
        return newMoles;
      });
    }, 500 - level * 30);
    
    return () => clearInterval(popupInterval);
  }, [isPlaying, level]);

  const handleMoleHit = useCallback((id: number) => {
    if (!isPlaying) return;
    
    setMoles(prev => {
      const mole = prev[id];
      if (!mole.isUp || mole.hitTime) return prev;
      
      const newMoles = [...prev];
      newMoles[id] = { ...mole, hitTime: Date.now() };
      
      if (mole.isBomb) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setIsPlaying(false);
            setShowGameOver(true);
            setIsWin(false);
          }
          return newLives;
        });
      } else {
        const points = mole.isGolden ? 50 : 10;
        setScore(s => {
          const newScore = s + points;
          if (newScore >= targetScore && !showGameOver) {
            setTimeout(() => {
              setIsPlaying(false);
              setShowGameOver(true);
              setIsWin(true);
            }, 500);
          }
          return newScore;
        });
      }
      
      return newMoles;
    });
  }, [isPlaying, targetScore, showGameOver]);

  const handleGameEnd = () => {
    if (isWin) {
      onLevelComplete?.(score, Math.floor(score / 20));
    }
    setShowGameOver(false);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 via-green-300 to-green-600">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        
        {isPlaying && (
          <div className="flex items-center gap-4">
            <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-green-900">
              ⏱️ {timeLeft}s
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-green-900">
              ❤️ {lives}
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-green-900">
              🎯 {score} / {targetScore}
            </div>
          </div>
        )}
        
        <Button variant="ghost" onClick={startGame} className="text-white hover:bg-white/20">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Start Screen */}
      {!isPlaying && !showGameOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-4">
            <div className="text-6xl mb-4">🔨</div>
            <h2 className="text-3xl font-bold text-amber-800 mb-2">Whack-A-Mole 3D</h2>
            <p className="text-gray-600 mb-4">Level {level}</p>
            <p className="text-sm text-gray-500 mb-6">
              Whack the moles! Golden moles = 50 pts. Avoid bombs!
              <br />Target: {targetScore} points
            </p>
            <Button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg">
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {showGameOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-4">
            <div className="text-6xl mb-4">{isWin ? '🎉' : '💥'}</div>
            <h2 className="text-3xl font-bold mb-2">
              {isWin ? 'Victory!' : 'Game Over!'}
            </h2>
            <p className="text-2xl text-amber-600 mb-4">Score: {score}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={startGame} variant="outline">
                Try Again
              </Button>
              {isWin && (
                <Button onClick={handleGameEnd} className="bg-green-500 hover:bg-green-600">
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 10, 8], fov: 50 }} shadows>
        <GameScene moles={moles} onMoleHit={handleMoleHit} score={score} />
      </Canvas>
    </div>
  );
};

export default WhackAMole3D;
