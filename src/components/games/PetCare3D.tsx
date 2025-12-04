import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Utensils, Droplets, Sparkles, RotateCcw } from 'lucide-react';

interface PetCare3DProps {
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
            className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface PetStats {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
}

interface Pet3DProps {
  stats: PetStats;
  isAnimating: string | null;
}

function Pet3D({ stats, isAnimating }: Pet3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);
  
  // Calculate pet mood based on stats
  const avgStats = (stats.hunger + stats.happiness + stats.cleanliness + stats.energy) / 4;
  const isHappy = avgStats > 60;
  
  useFrame((state) => {
    if (groupRef.current) {
      // Idle bounce
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Animation based on action
      if (isAnimating === 'feed') {
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 8) * 0.1;
      } else if (isAnimating === 'play') {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 5) * 0.3;
        groupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.5;
      } else if (isAnimating === 'clean') {
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1;
      } else {
        groupRef.current.rotation.x = 0;
        groupRef.current.rotation.z = 0;
      }
    }
    
    // Tail wag
    if (tailRef.current) {
      const wagSpeed = isHappy ? 8 : 3;
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * wagSpeed) * 0.5;
    }
    
    // Ear movement
    if (earLeftRef.current && earRightRef.current) {
      const earMove = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      earLeftRef.current.rotation.z = -0.3 + earMove;
      earRightRef.current.rotation.z = 0.3 - earMove;
    }
  });
  
  const bodyColor = isHappy ? '#f59e0b' : '#d97706';
  
  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.3, 0.3]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      
      {/* Snout */}
      <mesh position={[0, 1.1, 0.9]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 1.15, 1.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.25, 1.5, 0.7]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.25, 1.5, 0.82]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={isHappy ? "#1f2937" : "#6b7280"} />
      </mesh>
      <mesh position={[0.25, 1.5, 0.7]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.25, 1.5, 0.82]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={isHappy ? "#1f2937" : "#6b7280"} />
      </mesh>
      
      {/* Ears */}
      <mesh ref={earLeftRef} position={[-0.5, 1.9, 0.1]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.25, 0.5, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh ref={earRightRef} position={[0.5, 1.9, 0.1]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.25, 0.5, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      
      {/* Legs */}
      {[[-0.5, -0.8, 0.4], [0.5, -0.8, 0.4], [-0.5, -0.8, -0.4], [0.5, -0.8, -0.4]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.2, 0.15, 0.6, 16]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      ))}
      
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.2, -1.2]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.05, 0.8, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      
      {/* Happy expression - tongue */}
      {isHappy && (
        <mesh position={[0, 0.9, 1.1]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.15, 0.25, 0.05]} />
          <meshStandardMaterial color="#ec4899" />
        </mesh>
      )}
      
      {/* Sparkles when clean */}
      {stats.cleanliness > 80 && (
        <>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[
              Math.sin(i * 1.2) * 1.5,
              1 + Math.cos(i * 0.8) * 0.5,
              Math.cos(i * 1.5) * 1.5
            ]}>
              <octahedronGeometry args={[0.1]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function FoodBowl({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
    </group>
  );
}

function WaterBowl({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Toy({ position }: { position: [number, number, number] }) {
  const toyRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (toyRef.current) {
      toyRef.current.rotation.y = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={toyRef} position={position}>
      <torusGeometry args={[0.3, 0.1, 8, 16]} />
      <meshStandardMaterial color="#a855f7" />
    </mesh>
  );
}

interface GameSceneProps {
  stats: PetStats;
  isAnimating: string | null;
  score: number;
}

function GameScene({ stats, isAnimating, score }: GameSceneProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#fbbf24" />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>
      
      {/* Pet */}
      <Pet3D stats={stats} isAnimating={isAnimating} />
      
      {/* Items */}
      <FoodBowl position={[-2, -1, 1]} />
      <WaterBowl position={[2, -1, 1]} />
      <Toy position={[0, -0.8, 2]} />
      
      {/* Score display */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.5}
        color="#4f46e5"
        anchorX="center"
      >
        {`Happiness Score: ${score}`}
      </Text>
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
      
      <Environment preset="park" />
    </>
  );
}

export default function PetCare3D({ level = 1, onLevelComplete, onBack }: PetCare3DProps) {
  const [stats, setStats] = useState<PetStats>({
    hunger: 50,
    happiness: 50,
    cleanliness: 50,
    energy: 50
  });
  const [score, setScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const targetScore = 500 + (level * 100);
  
  // Stats decay over time
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        hunger: Math.max(0, prev.hunger - 1),
        happiness: Math.max(0, prev.happiness - 0.5),
        cleanliness: Math.max(0, prev.cleanliness - 0.8),
        energy: Math.max(0, prev.energy - 0.3)
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate score based on average stats
  useEffect(() => {
    const avgStats = (stats.hunger + stats.happiness + stats.cleanliness + stats.energy) / 4;
    if (avgStats > 70) {
      setScore(prev => prev + 1);
    }
  }, [stats]);
  
  // Check for level completion
  useEffect(() => {
    if (score >= targetScore && onLevelComplete) {
      const earnedCoins = Math.floor(score / 10);
      setCoins(earnedCoins);
      onLevelComplete(score, earnedCoins);
    }
  }, [score, targetScore, onLevelComplete]);
  
  const performAction = (action: string) => {
    setIsAnimating(action);
    
    setTimeout(() => {
      setIsAnimating(null);
    }, 1000);
    
    switch (action) {
      case 'feed':
        setStats(prev => ({
          ...prev,
          hunger: Math.min(100, prev.hunger + 25),
          energy: Math.min(100, prev.energy + 10)
        }));
        setScore(prev => prev + 10);
        break;
      case 'play':
        setStats(prev => ({
          ...prev,
          happiness: Math.min(100, prev.happiness + 30),
          energy: Math.max(0, prev.energy - 15)
        }));
        setScore(prev => prev + 15);
        break;
      case 'clean':
        setStats(prev => ({
          ...prev,
          cleanliness: Math.min(100, prev.cleanliness + 35),
          happiness: Math.min(100, prev.happiness + 5)
        }));
        setScore(prev => prev + 10);
        break;
      case 'rest':
        setStats(prev => ({
          ...prev,
          energy: Math.min(100, prev.energy + 40),
          happiness: Math.min(100, prev.happiness + 5)
        }));
        setScore(prev => prev + 5);
        break;
    }
  };
  
  const resetGame = () => {
    setStats({
      hunger: 50,
      happiness: 50,
      cleanliness: 50,
      energy: 50
    });
    setScore(0);
    setCoins(0);
  };
  
  const getStatColor = (value: number) => {
    if (value > 70) return 'bg-green-500';
    if (value > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-green-200 to-green-400">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <span className="font-bold text-purple-600">Level {level}</span>
          <span className="text-gray-400">|</span>
          <span className="font-bold text-green-600">{score}/{targetScore}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetGame}
          className="bg-white/80 backdrop-blur-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Stats Panel */}
      <div className="absolute top-20 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-4 space-y-3 w-48">
        <h3 className="font-bold text-gray-700 text-center">Pet Stats</h3>
        
        {[
          { label: 'Hunger', value: stats.hunger, icon: '🍖' },
          { label: 'Happiness', value: stats.happiness, icon: '😊' },
          { label: 'Cleanliness', value: stats.cleanliness, icon: '✨' },
          { label: 'Energy', value: stats.energy, icon: '⚡' }
        ].map((stat) => (
          <div key={stat.label}>
            <div className="flex justify-between text-sm mb-1">
              <span>{stat.icon} {stat.label}</span>
              <span>{Math.round(stat.value)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getStatColor(stat.value)}`}
                style={{ width: `${stat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 3, 6], fov: 50 }}
        shadows
      >
        <React.Suspense fallback={<Loader />}>
          <GameScene stats={stats} isAnimating={isAnimating} score={score} />
        </React.Suspense>
      </Canvas>
      
      {/* Action Buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        <Button
          size="lg"
          onClick={() => performAction('feed')}
          disabled={isAnimating !== null}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 p-0"
        >
          <Utensils className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          onClick={() => performAction('play')}
          disabled={isAnimating !== null}
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-full w-16 h-16 p-0"
        >
          <Heart className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          onClick={() => performAction('clean')}
          disabled={isAnimating !== null}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 p-0"
        >
          <Droplets className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          onClick={() => performAction('rest')}
          disabled={isAnimating !== null}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full w-16 h-16 p-0"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Action Labels */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-6 text-xs text-gray-600">
        <span className="w-16 text-center">Feed</span>
        <span className="w-16 text-center">Play</span>
        <span className="w-16 text-center">Clean</span>
        <span className="w-16 text-center">Rest</span>
      </div>
      
      {/* Level Complete */}
      {score >= targetScore && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            <h2 className="text-3xl font-bold text-purple-600 mb-2">🎉 Level Complete!</h2>
            <p className="text-gray-600 mb-4">Your pet is so happy!</p>
            <p className="text-2xl font-bold text-yellow-500 mb-4">+{coins} Coins</p>
            <Button onClick={resetGame} className="bg-purple-500 hover:bg-purple-600">
              Continue Playing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
