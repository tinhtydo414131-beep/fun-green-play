import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface FarmBuilder3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface FarmItem {
  id: number;
  type: 'crop' | 'tree' | 'animal' | 'barn' | 'fence' | 'windmill';
  position: [number, number, number];
  color: string;
  scale: number;
  growth: number;
}

function Crop3D({ position, color, scale, growth }: { position: [number, number, number]; color: string; scale: number; growth: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
      <group ref={ref} position={position} scale={scale * growth}>
        {/* Soil mound */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.1, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Stem */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* Crop head */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Leaves */}
        {[-0.08, 0.08].map((x, i) => (
          <mesh key={i} position={[x, 0.25, 0]} rotation={[0, 0, i === 0 ? 0.5 : -0.5]}>
            <boxGeometry args={[0.12, 0.02, 0.06]} />
            <meshStandardMaterial color="#32CD32" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function FruitTree3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.children[1].rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      {/* Fruits */}
      {[[0.3, 0.9, 0.2], [-0.25, 1.1, 0.15], [0.1, 0.85, -0.3], [-0.15, 1.2, -0.1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Animal3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Idle animation
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) > 0 ? 0 : Math.PI;
    }
  });

  const isChicken = color === '#FFD700';
  const isPig = color === '#FFC0CB';

  return (
    <group ref={ref} position={position} scale={scale}>
      {isChicken ? (
        <>
          {/* Chicken body */}
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {/* Head */}
          <mesh position={[0.1, 0.25, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {/* Beak */}
          <mesh position={[0.18, 0.25, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.03, 0.06, 4]} />
            <meshStandardMaterial color="#FFA500" />
          </mesh>
          {/* Comb */}
          <mesh position={[0.1, 0.33, 0]}>
            <boxGeometry args={[0.06, 0.05, 0.02]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
        </>
      ) : isPig ? (
        <>
          {/* Pig body */}
          <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.12, 0.2, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Head */}
          <mesh position={[0.2, 0.15, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Snout */}
          <mesh position={[0.28, 0.13, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          {/* Ears */}
          {[0.04, -0.04].map((z, i) => (
            <mesh key={i} position={[0.18, 0.22, z]}>
              <boxGeometry args={[0.04, 0.06, 0.02]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {/* Cow body */}
          <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.2, 0.3, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Head */}
          <mesh position={[0.35, 0.3, 0]}>
            <boxGeometry args={[0.2, 0.18, 0.15]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Horns */}
          {[0.06, -0.06].map((z, i) => (
            <mesh key={i} position={[0.35, 0.42, z]} rotation={[0, 0, i === 0 ? 0.3 : -0.3]}>
              <coneGeometry args={[0.02, 0.1, 8]} />
              <meshStandardMaterial color="#F5F5DC" />
            </mesh>
          ))}
          {/* Legs */}
          {[[-0.15, 0.1, 0.1], [0.15, 0.1, 0.1], [-0.15, 0.1, -0.1], [0.15, 0.1, -0.1]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function Barn3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Main building */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.25, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.7, 0.1, 1.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 1.6, 3, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.35, 0.51]}>
        <boxGeometry args={[0.4, 0.7, 0.02]} />
        <meshStandardMaterial color="#4A3728" />
      </mesh>
      {/* Windows */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0.51]}>
          <boxGeometry args={[0.2, 0.2, 0.02]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
      ))}
    </group>
  );
}

function Fence3D({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Posts */}
      {[-0.4, 0, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
      {/* Rails */}
      {[0.1, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.04]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>
      ))}
    </group>
  );
}

function Windmill3D({ position, scale }: { position: [number, number, number]; scale: number }) {
  const bladesRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Tower */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 1.5, 8]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      {/* Top */}
      <mesh position={[0, 1.55, 0]}>
        <coneGeometry args={[0.2, 0.2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Blades */}
      <mesh ref={bladesRef} position={[0, 1.3, 0.2]}>
        <group>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0, 0]} rotation={[0, 0, (i * Math.PI) / 2]}>
              <boxGeometry args={[0.08, 0.6, 0.02]} />
              <meshStandardMaterial color="#F5F5DC" />
            </mesh>
          ))}
        </group>
      </mesh>
      {/* Hub */}
      <mesh position={[0, 1.3, 0.22]}>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
    </group>
  );
}

function FarmGround() {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Grass patches */}
      {[[-4, 0.01, -4], [4, 0.01, 4], [-3, 0.01, 3], [3, 0.01, -3]].map((pos, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={pos as [number, number, number]}>
          <circleGeometry args={[2, 16]} />
          <meshStandardMaterial color="#7CFC00" />
        </mesh>
      ))}
      {/* Plowed field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 10 + Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    }
  });

  return (
    <mesh ref={ref} position={[8, 10, -5]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
    </mesh>
  );
}

function GameScene({ items, score, targetScore }: { items: FarmItem[]; score: number; targetScore: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
      <pointLight position={[8, 10, -5]} intensity={0.8} color="#FFD700" />
      
      <FarmGround />
      <Sun />
      
      {items.map((item) => {
        const props = { position: item.position, color: item.color, scale: item.scale };
        switch (item.type) {
          case 'crop': return <Crop3D key={item.id} {...props} growth={item.growth} />;
          case 'tree': return <FruitTree3D key={item.id} {...props} />;
          case 'animal': return <Animal3D key={item.id} {...props} />;
          case 'barn': return <Barn3D key={item.id} {...props} />;
          case 'fence': return <Fence3D key={item.id} position={item.position} scale={item.scale} />;
          case 'windmill': return <Windmill3D key={item.id} position={item.position} scale={item.scale} />;
          default: return null;
        }
      })}
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#8B4513" anchorX="center">
        {`🌾 ${score} / ${targetScore}`}
      </Text>
      
      <OrbitControls enablePan={true} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="park" />
    </>
  );
}

const farmItems: Array<{ type: FarmItem['type']; label: string; points: number; colors: string[] }> = [
  { type: 'crop', label: '🌽 Crop', points: 10, colors: ['#FFD700', '#FF6347', '#9370DB', '#32CD32'] },
  { type: 'tree', label: '🍎 Tree', points: 20, colors: ['#FF0000', '#FFA500', '#FFFF00'] },
  { type: 'animal', label: '🐄 Animal', points: 25, colors: ['#FFFFFF', '#FFC0CB', '#FFD700'] },
  { type: 'barn', label: '🏠 Barn', points: 30, colors: ['#DC143C', '#8B0000'] },
  { type: 'fence', label: '🪵 Fence', points: 8, colors: ['#8B4513'] },
  { type: 'windmill', label: '🌀 Windmill', points: 35, colors: ['#E8E8E8'] },
];

export function FarmBuilder3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: FarmBuilder3DProps) {
  const [items, setItems] = useState<FarmItem[]>([]);
  const [score, setScore] = useState(0);
  const itemIdRef = useRef(0);

  const targetScore = Math.floor(150 * level * difficultyMultiplier);

  // Grow crops over time
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => 
        item.type === 'crop' && item.growth < 1
          ? { ...item, growth: Math.min(1, item.growth + 0.1) }
          : item
      ));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleAddItem = (type: FarmItem['type']) => {
    const config = farmItems.find(f => f.type === type);
    if (!config) return;

    const newItem: FarmItem = {
      id: itemIdRef.current++,
      type,
      position: [
        Math.random() * 8 - 4,
        0,
        Math.random() * 8 - 4,
      ],
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      scale: 0.8 + Math.random() * 0.4,
      growth: type === 'crop' ? 0.3 : 1,
    };

    setItems(prev => [...prev, newItem]);
    
    const newScore = score + config.points;
    setScore(newScore);

    if (newScore >= targetScore) {
      const stars = newScore >= targetScore * 1.5 ? 3 : newScore >= targetScore * 1.2 ? 2 : 1;
      onLevelComplete?.(newScore, stars);
    }
  };

  const handleReset = () => {
    setItems([]);
    setScore(0);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80 backdrop-blur-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-amber-700">
          🌾 {score}/{targetScore}
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/80 backdrop-blur-sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-full">
        {farmItems.map((item) => (
          <button
            key={item.type}
            onClick={() => handleAddItem(item.type)}
            className="px-3 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-sm transition-all hover:scale-110"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }} shadows>
        <GameScene items={items} score={score} targetScore={targetScore} />
      </Canvas>
    </div>
  );
}
