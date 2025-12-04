import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface ZooKeeper3DProps {
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
          <div className="h-full bg-gradient-to-r from-green-400 to-yellow-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Animal {
  id: string;
  type: 'lion' | 'elephant' | 'giraffe' | 'monkey' | 'penguin' | 'bear';
  position: [number, number, number];
  happiness: number;
  hunger: number;
}

function Lion({ position, happiness }: { position: [number, number, number]; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      if (happiness > 70) ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>
      <mesh position={[0, 0.9, 0.3]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>
      {/* Mane */}
      <mesh position={[0, 0.9, 0]}>
        <torusGeometry args={[0.35, 0.15, 8, 16]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.2} color="#fff">🦁 Lion</Text>
    </group>
  );
}

function Elephant({ position, happiness }: { position: [number, number, number]; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current && happiness > 70) {
      ref.current.children[2].rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[0, 1.1, 0.3]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.8, 0.6]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <Text position={[0, 1.7, 0]} fontSize={0.2} color="#fff">🐘 Elephant</Text>
    </group>
  );
}

function Giraffe({ position, happiness }: { position: [number, number, number]; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current && happiness > 70) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.2, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <Text position={[0, 2.3, 0]} fontSize={0.2} color="#fff">🦒 Giraffe</Text>
    </group>
  );
}

function Monkey({ position, happiness }: { position: [number, number, number]; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current && happiness > 70) {
      ref.current.position.y = position[1] + Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.2;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      <Text position={[0, 1.1, 0]} fontSize={0.2} color="#fff">🐵 Monkey</Text>
    </group>
  );
}

function Penguin({ position, happiness }: { position: [number, number, number]; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current && happiness > 70) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.25, 0.4, 8, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, 0.4, 0.15]}>
        <capsuleGeometry args={[0.18, 0.3, 8, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.2} color="#fff">🐧 Penguin</Text>
    </group>
  );
}

function Bear({ position, happiness }: { position: [number, number, number]; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current && happiness > 70) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.25, 1.15, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0.25, 1.15, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.2} color="#fff">🐻 Bear</Text>
    </group>
  );
}

function Enclosure({ position, animal, onClick }: { position: [number, number, number]; animal: Animal; onClick: () => void }) {
  const animalComponents: Record<string, React.FC<{ position: [number, number, number]; happiness: number }>> = {
    lion: Lion, elephant: Elephant, giraffe: Giraffe, monkey: Monkey, penguin: Penguin, bear: Bear
  };
  const AnimalComponent = animalComponents[animal.type];
  const statusColor = animal.happiness > 70 ? '#22c55e' : animal.happiness > 40 ? '#eab308' : '#ef4444';
  
  return (
    <group position={position} onClick={onClick}>
      {/* Fence */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.5, 0.05, 2.5]} />
        <meshStandardMaterial color="#84cc16" />
      </mesh>
      {[[-1.2, 0], [1.2, 0], [0, -1.2], [0, 1.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]}>
          <boxGeometry args={[x === 0 ? 2.5 : 0.1, 0.5, z === 0 ? 2.5 : 0.1]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      ))}
      <AnimalComponent position={[0, 0.2, 0]} happiness={animal.happiness} />
      {/* Status indicator */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function GameScene({ animals, onAnimalClick, score }: { animals: Animal[]; onAnimalClick: (id: string) => void; score: number }) {
  const positions: [number, number, number][] = [[-4, 0, -2], [0, 0, -2], [4, 0, -2], [-4, 0, 2], [0, 0, 2], [4, 0, 2]];
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      {animals.map((animal, index) => (
        <Enclosure key={animal.id} position={positions[index]} animal={animal} onClick={() => onAnimalClick(animal.id)} />
      ))}
      <Text position={[0, 5, 0]} fontSize={0.6} color="#1e3a8a">Zoo Score: {score}</Text>
      <OrbitControls enablePan={false} minDistance={8} maxDistance={18} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="park" />
    </>
  );
}

const ANIMAL_TYPES: Animal['type'][] = ['lion', 'elephant', 'giraffe', 'monkey', 'penguin', 'bear'];

export default function ZooKeeper3D({ level = 1, onLevelComplete, onBack }: ZooKeeper3DProps) {
  const [animals, setAnimals] = useState<Animal[]>(() => 
    ANIMAL_TYPES.map((type, i) => ({ id: `${type}-${i}`, type, position: [0, 0, 0], happiness: 50 + Math.random() * 30, hunger: 30 + Math.random() * 40 }))
  );
  const [score, setScore] = useState(0);
  const [selectedAction, setSelectedAction] = useState<'feed' | 'play' | 'clean'>('feed');
  const targetScore = 500 + level * 100;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimals(prev => prev.map(a => ({
        ...a,
        happiness: Math.max(0, a.happiness - 0.5),
        hunger: Math.min(100, a.hunger + 0.3)
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const avgHappiness = animals.reduce((sum, a) => sum + a.happiness, 0) / animals.length;
    if (avgHappiness > 60) setScore(prev => prev + 1);
  }, [animals]);

  React.useEffect(() => {
    if (score >= targetScore && onLevelComplete) onLevelComplete(score, Math.floor(score / 10));
  }, [score, targetScore, onLevelComplete]);

  const handleAnimalClick = (id: string) => {
    setAnimals(prev => prev.map(a => {
      if (a.id !== id) return a;
      switch (selectedAction) {
        case 'feed': return { ...a, hunger: Math.max(0, a.hunger - 30), happiness: Math.min(100, a.happiness + 10) };
        case 'play': return { ...a, happiness: Math.min(100, a.happiness + 25) };
        case 'clean': return { ...a, happiness: Math.min(100, a.happiness + 15) };
        default: return a;
      }
    }));
    setScore(prev => prev + 10);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 to-green-400">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="bg-white/80 rounded-full px-4 py-2 font-bold">Level {level} | {score}/{targetScore}</div>
        <Button variant="outline" size="sm" onClick={() => setAnimals(ANIMAL_TYPES.map((type, i) => ({ id: `${type}-${i}`, type, position: [0, 0, 0], happiness: 50, hunger: 50 })))} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 8, 12], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene animals={animals} onAnimalClick={handleAnimalClick} score={score} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {(['feed', 'play', 'clean'] as const).map(action => (
          <Button key={action} size="lg" onClick={() => setSelectedAction(action)} className={`${selectedAction === action ? 'bg-yellow-500' : 'bg-white/80'} capitalize`}>
            {action === 'feed' ? '🍖' : action === 'play' ? '🎾' : '🧹'} {action}
          </Button>
        ))}
      </div>
      {score >= targetScore && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Level Complete!</h2>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(score / 10)} coins</p>
            <Button onClick={onBack}>Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
