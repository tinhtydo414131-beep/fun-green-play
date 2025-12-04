import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface CinemaBoss3DProps {
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
          <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Customer {
  id: string;
  wants: 'popcorn' | 'drink' | 'candy' | 'combo';
  patience: number;
  served: boolean;
}

function CustomerModel({ wants, patience }: { wants: string; patience: number }) {
  const ref = useRef<THREE.Group>(null);
  const color = patience > 70 ? '#22c55e' : patience > 40 ? '#eab308' : '#ef4444';
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03;
    }
  });
  
  return (
    <group ref={ref}>
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {/* Want bubble */}
      <mesh position={[0.5, 1.4, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <Text position={[0.5, 1.4, 0.2]} fontSize={0.25}>
        {wants === 'popcorn' ? '🍿' : wants === 'drink' ? '🥤' : wants === 'candy' ? '🍬' : '🎬'}
      </Text>
      {/* Patience bar */}
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.05]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[-0.4 + (patience / 100) * 0.4, 1.7, 0.03]}>
        <boxGeometry args={[(patience / 100) * 0.8, 0.08, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Counter({ position, customers, selectedItem, onServe }: { 
  position: [number, number, number]; 
  customers: Customer[]; 
  selectedItem: string | null;
  onServe: (id: string) => void;
}) {
  const customerPositions: [number, number, number][] = [[-2, 0, 1.5], [0, 0, 1.5], [2, 0, 1.5]];
  
  return (
    <group position={position}>
      {/* Counter */}
      <RoundedBox args={[6, 1, 1]} radius={0.1} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#7c3aed" />
      </RoundedBox>
      {/* Counter top */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[6.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#a78bfa" />
      </mesh>
      {/* Customers */}
      {customers.slice(0, 3).map((customer, i) => (
        <group key={customer.id} position={customerPositions[i]} onClick={() => selectedItem === customer.wants && onServe(customer.id)}>
          <CustomerModel wants={customer.wants} patience={customer.patience} />
        </group>
      ))}
    </group>
  );
}

function Screen({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[8, 4, 0.2]} />
      <meshStandardMaterial color="#1e1b4b" emissive="#4f46e5" emissiveIntensity={0.3} />
    </mesh>
  );
}

function GameScene({ customers, selectedItem, onServe, score }: { 
  customers: Customer[]; 
  selectedItem: string | null;
  onServe: (id: string) => void;
  score: number;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#a78bfa" />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[15, 12]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      {/* Cinema screen */}
      <Screen position={[0, 3, -5]} />
      {/* Counter */}
      <Counter position={[0, 0, 2]} customers={customers} selectedItem={selectedItem} onServe={onServe} />
      <Text position={[0, 5.5, 0]} fontSize={0.5} color="#fbbf24">🎬 Cinema Score: {score}</Text>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={15} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="night" />
    </>
  );
}

const ITEMS: Customer['wants'][] = ['popcorn', 'drink', 'candy', 'combo'];

export default function CinemaBoss3D({ level = 1, onLevelComplete, onBack }: CinemaBoss3DProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [servedCount, setServedCount] = useState(0);
  const targetServed = 15 + level * 5;
  const nextCustomerId = useRef(0);

  // Spawn customers
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (customers.filter(c => !c.served).length < 3) {
        setCustomers(prev => [...prev, {
          id: `customer-${nextCustomerId.current++}`,
          wants: ITEMS[Math.floor(Math.random() * ITEMS.length)],
          patience: 100,
          served: false
        }]);
      }
    }, 2500 - level * 150);
    return () => clearInterval(interval);
  }, [level, customers]);

  // Decrease patience
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCustomers(prev => prev.map(c => !c.served ? { ...c, patience: Math.max(0, c.patience - 1) } : c)
        .filter(c => c.served || c.patience > 0));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (servedCount >= targetServed && onLevelComplete) {
      onLevelComplete(score, Math.floor(score / 15));
    }
  }, [servedCount, targetServed, score, onLevelComplete]);

  const handleServe = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (customer && selectedItem === customer.wants) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      const bonus = Math.floor(customer.patience / 10);
      setScore(prev => prev + 50 + bonus);
      setServedCount(prev => prev + 1);
      setSelectedItem(null);
    }
  };

  const resetGame = () => {
    setCustomers([]);
    setScore(0);
    setServedCount(0);
    setSelectedItem(null);
    nextCustomerId.current = 0;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/20 text-white border-white/30"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-purple-500/80 text-white rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-green-500/80 text-white rounded-full px-4 py-2 font-bold">Served: {servedCount}/{targetServed}</span>
          <span className="bg-yellow-500/80 text-white rounded-full px-4 py-2 font-bold">Score: {score}</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/20 text-white border-white/30"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 6, 10], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene customers={customers} selectedItem={selectedItem} onServe={handleServe} score={score} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {ITEMS.map(item => (
          <Button key={item} size="lg" onClick={() => setSelectedItem(item)} 
            className={`${selectedItem === item ? 'bg-yellow-500 scale-110' : 'bg-purple-600'} text-white text-2xl px-6`}>
            {item === 'popcorn' ? '🍿' : item === 'drink' ? '🥤' : item === 'candy' ? '🍬' : '🎬'}
          </Button>
        ))}
      </div>
      {servedCount >= targetServed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-purple-600 mb-4">🎬 Level Complete!</h2>
            <p className="text-gray-600 mb-2">Customers served: {servedCount}</p>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(score / 15)} coins</p>
            <Button onClick={onBack} className="bg-purple-600">Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
