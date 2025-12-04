import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface SchoolBuilder3DProps {
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
          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Building {
  id: string;
  type: 'classroom' | 'library' | 'gym' | 'cafeteria' | 'lab' | 'playground';
  position: [number, number, number];
}

const BUILDING_COLORS: Record<string, string> = {
  classroom: '#3b82f6',
  library: '#8b5cf6',
  gym: '#ef4444',
  cafeteria: '#f59e0b',
  lab: '#10b981',
  playground: '#ec4899'
};

const BUILDING_POINTS: Record<string, number> = {
  classroom: 100,
  library: 150,
  gym: 120,
  cafeteria: 80,
  lab: 200,
  playground: 90
};

function Classroom({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[2, 1.5, 1.5]} radius={0.1} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </RoundedBox>
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[1.3, 0.8, 4]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      {/* Windows */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.8, 0.76]}>
          <boxGeometry args={[0.4, 0.4, 0.05]} />
          <meshStandardMaterial color="#bfdbfe" />
        </mesh>
      ))}
      <Text position={[0, 2.5, 0]} fontSize={0.2} color="#1e40af">📚 Classroom</Text>
    </group>
  );
}

function Library({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[2.5, 2, 1.5]} radius={0.1} position={[0, 1, 0]}>
        <meshStandardMaterial color="#8b5cf6" />
      </RoundedBox>
      {/* Columns */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1, 0.8]}>
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      <Text position={[0, 2.8, 0]} fontSize={0.2} color="#5b21b6">📖 Library</Text>
    </group>
  );
}

function Gym({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[3, 1.6, 2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1, 1, 3, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <Text position={[0, 3, 0]} fontSize={0.2} color="#991b1b">🏀 Gym</Text>
    </group>
  );
}

function Cafeteria({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[2.5, 1.2, 2]} radius={0.1} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#f59e0b" />
      </RoundedBox>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[2.7, 0.3, 2.2]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.2} color="#92400e">🍽️ Cafeteria</Text>
    </group>
  );
}

function ScienceLab({ position }: { position: [number, number, number] }) {
  const beakerRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (beakerRef.current) {
      beakerRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  return (
    <group position={position}>
      <RoundedBox args={[2, 1.8, 1.5]} radius={0.1} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#10b981" />
      </RoundedBox>
      {/* Beaker */}
      <mesh ref={beakerRef} position={[0, 1.5, 0.8]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="#5eead4" transparent opacity={0.7} />
      </mesh>
      <Text position={[0, 2.5, 0]} fontSize={0.2} color="#047857">🔬 Science Lab</Text>
    </group>
  );
}

function Playground({ position }: { position: [number, number, number] }) {
  const swingRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (swingRef.current) {
      swingRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });
  
  return (
    <group position={position}>
      {/* Ground */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>
      {/* Swing frame */}
      <group ref={swingRef} position={[0, 1.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 1.5, 0.1]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.3]} />
          <meshStandardMaterial color="#ec4899" />
        </mesh>
      </group>
      {/* Frame */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1, 0]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#a855f7" />
        </mesh>
      ))}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#a855f7" />
      </mesh>
      <Text position={[0, 2.5, 0]} fontSize={0.2} color="#86198f">🎢 Playground</Text>
    </group>
  );
}

function BuildingModel({ type, position }: { type: string; position: [number, number, number] }) {
  switch (type) {
    case 'classroom': return <Classroom position={position} />;
    case 'library': return <Library position={position} />;
    case 'gym': return <Gym position={position} />;
    case 'cafeteria': return <Cafeteria position={position} />;
    case 'lab': return <ScienceLab position={position} />;
    case 'playground': return <Playground position={position} />;
    default: return null;
  }
}

function GameScene({ buildings, score }: { buildings: Building[]; score: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[25, 20]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>
      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[2, 20]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      {/* Buildings */}
      {buildings.map(building => (
        <BuildingModel key={building.id} type={building.type} position={building.position} />
      ))}
      <Text position={[0, 6, 0]} fontSize={0.6} color="#1e40af">🏫 School Score: {score}</Text>
      <OrbitControls enablePan={false} minDistance={10} maxDistance={25} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="park" />
    </>
  );
}

const BUILDING_TYPES: Building['type'][] = ['classroom', 'library', 'gym', 'cafeteria', 'lab', 'playground'];

export default function SchoolBuilder3D({ level = 1, onLevelComplete, onBack }: SchoolBuilder3DProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedType, setSelectedType] = useState<Building['type']>('classroom');
  const [score, setScore] = useState(0);
  const targetScore = 500 + level * 200;
  const nextId = useRef(0);

  const getNextPosition = (): [number, number, number] => {
    const row = Math.floor(buildings.length / 3);
    const col = buildings.length % 3;
    return [-6 + col * 6, 0, -4 + row * 4];
  };

  const handleBuild = () => {
    if (buildings.length >= 9) return;
    
    const newBuilding: Building = {
      id: `building-${nextId.current++}`,
      type: selectedType,
      position: getNextPosition()
    };
    
    setBuildings(prev => [...prev, newBuilding]);
    setScore(prev => prev + BUILDING_POINTS[selectedType]);
  };

  React.useEffect(() => {
    if (score >= targetScore && onLevelComplete) {
      onLevelComplete(score, Math.floor(score / 50));
    }
  }, [score, targetScore, onLevelComplete]);

  const resetGame = () => {
    setBuildings([]);
    setScore(0);
    nextId.current = 0;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-300 to-green-300">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-blue-500/80 text-white rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-green-500/80 text-white rounded-full px-4 py-2 font-bold">{score}/{targetScore}</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 12, 18], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene buildings={buildings} score={score} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {BUILDING_TYPES.map(type => (
            <Button key={type} size="sm" onClick={() => setSelectedType(type)}
              className={`${selectedType === type ? 'ring-2 ring-yellow-400' : ''}`}
              style={{ backgroundColor: BUILDING_COLORS[type] }}>
              {type === 'classroom' ? '📚' : type === 'library' ? '📖' : type === 'gym' ? '🏀' : 
               type === 'cafeteria' ? '🍽️' : type === 'lab' ? '🔬' : '🎢'}
            </Button>
          ))}
        </div>
        <Button size="lg" onClick={handleBuild} disabled={buildings.length >= 9} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Build {selectedType} (+{BUILDING_POINTS[selectedType]} pts)
        </Button>
      </div>
      {score >= targetScore && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">🏫 School Complete!</h2>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(score / 50)} coins</p>
            <Button onClick={onBack} className="bg-blue-600">Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
