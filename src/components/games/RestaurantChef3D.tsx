import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface RestaurantChef3DProps {
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
          <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white text-sm">Loading... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Order {
  id: string;
  dish: 'burger' | 'pizza' | 'salad' | 'pasta';
  timeLeft: number;
  completed: boolean;
}

interface CookingStation {
  dish: string | null;
  progress: number;
}

const DISH_EMOJIS: Record<string, string> = { burger: '🍔', pizza: '🍕', salad: '🥗', pasta: '🍝' };

function DishModel({ dish, progress }: { dish: string; progress: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current && progress > 0 && progress < 100) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  const colors: Record<string, string> = { burger: '#f59e0b', pizza: '#ef4444', salad: '#22c55e', pasta: '#fbbf24' };
  
  return (
    <group ref={ref}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.35, 0.25, 16]} />
        <meshStandardMaterial color={colors[dish]} />
      </mesh>
      {progress >= 100 && (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

function Station({ position, station, onCook, onServe, isSelected }: {
  position: [number, number, number];
  station: CookingStation;
  onCook: () => void;
  onServe: () => void;
  isSelected: boolean;
}) {
  return (
    <group position={position} onClick={station.dish && station.progress >= 100 ? onServe : onCook}>
      {/* Stove */}
      <RoundedBox args={[1.2, 0.8, 1.2]} radius={0.05} position={[0, 0.4, 0]}>
        <meshStandardMaterial color={isSelected ? '#fbbf24' : '#374151'} />
      </RoundedBox>
      {/* Burner */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 16]} />
        <meshStandardMaterial color={station.dish ? '#ef4444' : '#1f2937'} emissive={station.dish ? '#ef4444' : '#000'} emissiveIntensity={station.dish ? 0.5 : 0} />
      </mesh>
      {/* Pan */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.4, 0.35, 0.1, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Dish being cooked */}
      {station.dish && (
        <group position={[0, 1.1, 0]}>
          <DishModel dish={station.dish} progress={station.progress} />
        </group>
      )}
      {/* Progress bar */}
      {station.dish && station.progress < 100 && (
        <>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[1, 0.1, 0.05]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          <mesh position={[-0.5 + (station.progress / 100) * 0.5, 1.6, 0.03]}>
            <boxGeometry args={[(station.progress / 100), 0.08, 0.05]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </>
      )}
      {station.progress >= 100 && <Text position={[0, 1.6, 0]} fontSize={0.2} color="#22c55e">Ready!</Text>}
    </group>
  );
}

function OrderBoard({ position, orders }: { position: [number, number, number]; orders: Order[] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[6, 2, 0.2]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <Text position={[0, 0.7, 0.15]} fontSize={0.25} color="#fff">📋 Orders</Text>
      {orders.filter(o => !o.completed).slice(0, 4).map((order, i) => (
        <group key={order.id} position={[-2 + i * 1.4, 0, 0.15]}>
          <Text position={[0, 0.2, 0]} fontSize={0.4}>{DISH_EMOJIS[order.dish]}</Text>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[1, 0.15, 0.05]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          <mesh position={[-0.5 + (order.timeLeft / 100) * 0.5, -0.3, 0.03]}>
            <boxGeometry args={[(order.timeLeft / 100), 0.12, 0.05]} />
            <meshStandardMaterial color={order.timeLeft > 50 ? '#22c55e' : order.timeLeft > 25 ? '#eab308' : '#ef4444'} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GameScene({ orders, stations, selectedDish, onCook, onServe, score }: {
  orders: Order[];
  stations: CookingStation[];
  selectedDish: string | null;
  onCook: (index: number) => void;
  onServe: (index: number) => void;
  score: number;
}) {
  const stationPositions: [number, number, number][] = [[-2.5, 0, 0], [0, 0, 0], [2.5, 0, 0]];
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 3, 2]} intensity={0.4} color="#fbbf24" />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      {/* Wall */}
      <mesh position={[0, 2, -4]}>
        <boxGeometry args={[12, 4, 0.2]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      {/* Order board */}
      <OrderBoard position={[0, 3, -3.8]} orders={orders} />
      {/* Cooking stations */}
      {stations.map((station, i) => (
        <Station key={i} position={stationPositions[i]} station={station} 
          onCook={() => onCook(i)} onServe={() => onServe(i)} isSelected={selectedDish !== null && !station.dish} />
      ))}
      <Text position={[0, 5, 0]} fontSize={0.5} color="#dc2626">🍳 Chef Score: {score}</Text>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={14} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="apartment" />
    </>
  );
}

const DISHES: Order['dish'][] = ['burger', 'pizza', 'salad', 'pasta'];

export default function RestaurantChef3D({ level = 1, onLevelComplete, onBack }: RestaurantChef3DProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stations, setStations] = useState<CookingStation[]>([{ dish: null, progress: 0 }, { dish: null, progress: 0 }, { dish: null, progress: 0 }]);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [servedCount, setServedCount] = useState(0);
  const targetServed = 12 + level * 4;
  const nextOrderId = useRef(0);

  // Spawn orders
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (orders.filter(o => !o.completed).length < 4) {
        setOrders(prev => [...prev, {
          id: `order-${nextOrderId.current++}`,
          dish: DISHES[Math.floor(Math.random() * DISHES.length)],
          timeLeft: 100,
          completed: false
        }]);
      }
    }, 3000 - level * 200);
    return () => clearInterval(interval);
  }, [level, orders]);

  // Update timers and cooking
  React.useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(o => !o.completed ? { ...o, timeLeft: Math.max(0, o.timeLeft - 1) } : o).filter(o => o.completed || o.timeLeft > 0));
      setStations(prev => prev.map(s => s.dish && s.progress < 100 ? { ...s, progress: Math.min(100, s.progress + 2) } : s));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (servedCount >= targetServed && onLevelComplete) {
      onLevelComplete(score, Math.floor(score / 25));
    }
  }, [servedCount, targetServed, score, onLevelComplete]);

  const handleCook = (index: number) => {
    if (selectedDish && !stations[index].dish) {
      setStations(prev => prev.map((s, i) => i === index ? { dish: selectedDish, progress: 0 } : s));
      setSelectedDish(null);
    }
  };

  const handleServe = (index: number) => {
    const station = stations[index];
    if (station.dish && station.progress >= 100) {
      const matchingOrder = orders.find(o => !o.completed && o.dish === station.dish);
      if (matchingOrder) {
        const bonus = Math.floor(matchingOrder.timeLeft / 2);
        setScore(prev => prev + 100 + bonus);
        setOrders(prev => prev.map(o => o.id === matchingOrder.id ? { ...o, completed: true } : o));
        setServedCount(prev => prev + 1);
      }
      setStations(prev => prev.map((s, i) => i === index ? { dish: null, progress: 0 } : s));
    }
  };

  const resetGame = () => {
    setOrders([]);
    setStations([{ dish: null, progress: 0 }, { dish: null, progress: 0 }, { dish: null, progress: 0 }]);
    setSelectedDish(null);
    setScore(0);
    setServedCount(0);
    nextOrderId.current = 0;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-orange-100 to-red-200">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-orange-600/80 text-white rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-green-500/80 text-white rounded-full px-4 py-2 font-bold">Served: {servedCount}/{targetServed}</span>
          <span className="bg-yellow-500/80 text-white rounded-full px-4 py-2 font-bold">Score: {score}</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 5, 8], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene orders={orders} stations={stations} selectedDish={selectedDish} onCook={handleCook} onServe={handleServe} score={score} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {DISHES.map(dish => (
          <Button key={dish} size="lg" onClick={() => setSelectedDish(dish)}
            className={`${selectedDish === dish ? 'bg-orange-500 scale-110' : 'bg-white/80'} text-2xl px-6`}>
            {DISH_EMOJIS[dish]}
          </Button>
        ))}
      </div>
      {servedCount >= targetServed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-orange-600 mb-4">🍳 Level Complete!</h2>
            <p className="text-gray-600 mb-2">Dishes served: {servedCount}</p>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(score / 25)} coins</p>
            <Button onClick={onBack} className="bg-orange-600">Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
