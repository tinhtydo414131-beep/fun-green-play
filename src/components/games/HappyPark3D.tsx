import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface HappyPark3DProps {
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

interface ParkItem {
  id: string;
  type: 'tree' | 'bench' | 'fountain' | 'flowers' | 'lamp' | 'swing';
  position: [number, number, number];
}

function Tree({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0]}>
          <boxGeometry args={[0.1, 0.3, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      ))}
      <mesh position={[0, 0.5, -0.15]}>
        <boxGeometry args={[1.2, 0.3, 0.08]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
}

function Fountain({ position }: { position: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.4, 16]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.15, 16]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.7} />
      </mesh>
      <mesh ref={waterRef} position={[0, 0.8, 0]}>
        <coneGeometry args={[0.1, 0.8, 8]} />
        <meshStandardMaterial color="#93c5fd" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Flowers({ position }: { position: [number, number, number] }) {
  const colors = ['#ef4444', '#f59e0b', '#ec4899', '#a855f7', '#3b82f6'];
  return (
    <group position={position}>
      {colors.map((color, i) => (
        <group key={i} position={[Math.cos(i * 1.2) * 0.3, 0, Math.sin(i * 1.2) * 0.3]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 2, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Swing({ position }: { position: [number, number, number] }) {
  const swingRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (swingRef.current) {
      swingRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.4;
    }
  });
  return (
    <group position={position}>
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      ))}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <group ref={swingRef} position={[0, 2.3, 0]}>
        <mesh position={[0, -0.8, 0]}>
          <boxGeometry args={[0.05, 1.6, 0.05]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, -1.5, 0]}>
          <boxGeometry args={[0.4, 0.08, 0.2]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      </group>
    </group>
  );
}

function ParkItemModel({ type, position }: { type: string; position: [number, number, number] }) {
  switch (type) {
    case 'tree': return <Tree position={position} />;
    case 'bench': return <Bench position={position} />;
    case 'fountain': return <Fountain position={position} />;
    case 'flowers': return <Flowers position={position} />;
    case 'lamp': return <Lamp position={position} />;
    case 'swing': return <Swing position={position} />;
    default: return null;
  }
}

function GameScene({ items, happiness }: { items: ParkItem[]; happiness: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>
      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3, 4, 32]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {/* Items */}
      {items.map(item => (
        <ParkItemModel key={item.id} type={item.type} position={item.position} />
      ))}
      <Text position={[0, 5, 0]} fontSize={0.5} color="#166534">🌳 Park Happiness: {happiness}%</Text>
      <OrbitControls enablePan={false} minDistance={8} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="park" />
    </>
  );
}

const ITEM_TYPES: ParkItem['type'][] = ['tree', 'bench', 'fountain', 'flowers', 'lamp', 'swing'];
const ITEM_POINTS: Record<string, number> = { tree: 10, bench: 8, fountain: 20, flowers: 5, lamp: 7, swing: 15 };
const ITEM_EMOJIS: Record<string, string> = { tree: '🌳', bench: '🪑', fountain: '⛲', flowers: '🌸', lamp: '💡', swing: '🎠' };

export default function HappyPark3D({ level = 1, onLevelComplete, onBack }: HappyPark3DProps) {
  const [items, setItems] = useState<ParkItem[]>([]);
  const [selectedType, setSelectedType] = useState<ParkItem['type']>('tree');
  const [happiness, setHappiness] = useState(0);
  const targetHappiness = 80 + level * 5;
  const nextId = useRef(0);

  const getRandomPosition = (): [number, number, number] => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 8;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  };

  const handlePlace = () => {
    const newItem: ParkItem = {
      id: `item-${nextId.current++}`,
      type: selectedType,
      position: getRandomPosition()
    };
    setItems(prev => [...prev, newItem]);
    setHappiness(prev => Math.min(100, prev + ITEM_POINTS[selectedType]));
  };

  React.useEffect(() => {
    if (happiness >= targetHappiness && onLevelComplete) {
      onLevelComplete(happiness * 10, Math.floor(happiness / 5));
    }
  }, [happiness, targetHappiness, onLevelComplete]);

  const resetGame = () => {
    setItems([]);
    setHappiness(0);
    nextId.current = 0;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 to-green-400">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-green-600/80 text-white rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-yellow-500/80 text-white rounded-full px-4 py-2 font-bold">😊 {happiness}%/{targetHappiness}%</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 10, 15], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene items={items} happiness={happiness} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {ITEM_TYPES.map(type => (
            <Button key={type} size="sm" onClick={() => setSelectedType(type)}
              className={`${selectedType === type ? 'ring-2 ring-yellow-400 scale-110' : ''} bg-white/80`}>
              {ITEM_EMOJIS[type]}
            </Button>
          ))}
        </div>
        <Button size="lg" onClick={handlePlace} className="bg-green-600 hover:bg-green-700 text-white px-8">
          Place {selectedType} (+{ITEM_POINTS[selectedType]}%)
        </Button>
      </div>
      {happiness >= targetHappiness && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🌳 Park Complete!</h2>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(happiness / 5)} coins</p>
            <Button onClick={onBack} className="bg-green-600">Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
