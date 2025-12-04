import { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Flower, TreeDeciduous, Shrub } from "lucide-react";

interface GardenBuilder3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface GardenItem {
  id: number;
  type: 'flower' | 'tree' | 'bush' | 'fountain' | 'bench';
  position: [number, number, number];
  color: string;
  scale: number;
}

function Flower3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref} position={position} scale={scale}>
        {/* Stem */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* Petals */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 3) * 0.15,
              0.65,
              Math.sin((i * Math.PI) / 3) * 0.15,
            ]}
            rotation={[0.3, (i * Math.PI) / 3, 0]}
          >
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
        {/* Center */}
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </group>
    </Float>
  );
}

function Tree3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.children[1].rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 1.3, 0]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.45, 0.9, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Bush3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.2, 0.2, 0.15]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.2, 0.2, -0.1]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Fountain3D({ position, scale }: { position: [number, number, number]; scale: number }) {
  const waterRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.3, 16]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>
      {/* Water basin */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.2, 16]} />
        <meshStandardMaterial color="#4169E1" transparent opacity={0.7} />
      </mesh>
      {/* Center pillar */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>
      {/* Water spray */}
      <mesh ref={waterRef} position={[0, 1, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Bench3D({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, Math.PI / 4, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1, 0.08, 0.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.6, -0.18]}>
        <boxGeometry args={[1, 0.4, 0.06]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Legs */}
      {[[-0.4, 0.17, 0.1], [0.4, 0.17, 0.1], [-0.4, 0.17, -0.1], [0.4, 0.17, -0.1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.08, 0.35, 0.08]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      ))}
    </group>
  );
}

function GardenGround() {
  return (
    <group>
      {/* Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>
      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1.5, 8]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
      {/* Decorative stones */}
      {[[-2, 0.05, 2], [2.5, 0.05, -1], [-1.5, 0.05, -2.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      ))}
    </group>
  );
}

function Butterfly({ startPosition }: { startPosition: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.position.x = startPosition[0] + Math.sin(t * 0.5) * 2;
      ref.current.position.y = startPosition[1] + Math.sin(t * 2) * 0.3;
      ref.current.position.z = startPosition[2] + Math.cos(t * 0.5) * 2;
      ref.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group ref={ref} position={startPosition} scale={0.3}>
      {/* Wings */}
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, 0.3]}>
        <circleGeometry args={[0.3, 8]} />
        <meshStandardMaterial color="#FF69B4" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.15, 0, 0]} rotation={[0, 0, -0.3]}>
        <circleGeometry args={[0.3, 8]} />
        <meshStandardMaterial color="#FF69B4" side={THREE.DoubleSide} />
      </mesh>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
    </group>
  );
}

function GameScene({ items, selectedTool, onPlaceItem }: { items: GardenItem[]; selectedTool: string | null; onPlaceItem: (position: [number, number, number]) => void }) {
  const handleGroundClick = (e: any) => {
    if (selectedTool) {
      e.stopPropagation();
      const point = e.point;
      onPlaceItem([point.x, 0, point.z]);
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#FFF8DC" />
      
      <group onClick={handleGroundClick}>
        <GardenGround />
      </group>
      
      {items.map((item) => {
        switch (item.type) {
          case 'flower':
            return <Flower3D key={item.id} position={item.position} color={item.color} scale={item.scale} />;
          case 'tree':
            return <Tree3D key={item.id} position={item.position} color={item.color} scale={item.scale} />;
          case 'bush':
            return <Bush3D key={item.id} position={item.position} color={item.color} scale={item.scale} />;
          case 'fountain':
            return <Fountain3D key={item.id} position={item.position} scale={item.scale} />;
          case 'bench':
            return <Bench3D key={item.id} position={item.position} scale={item.scale} />;
          default:
            return null;
        }
      })}
      
      {/* Butterflies */}
      <Butterfly startPosition={[2, 1.5, 1]} />
      <Butterfly startPosition={[-1, 1.2, -2]} />
      
      <OrbitControls enablePan={true} minDistance={5} maxDistance={15} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="park" />
    </>
  );
}

const tools = [
  { id: 'flower', label: '🌸 Flower', color: '#FF69B4' },
  { id: 'tree', label: '🌲 Tree', color: '#228B22' },
  { id: 'bush', label: '🌿 Bush', color: '#32CD32' },
  { id: 'fountain', label: '⛲ Fountain', color: '#4169E1' },
  { id: 'bench', label: '🪑 Bench', color: '#8B4513' },
];

export function GardenBuilder3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: GardenBuilder3DProps) {
  const [items, setItems] = useState<GardenItem[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const targetScore = Math.floor(100 * level * difficultyMultiplier);

  const handlePlaceItem = (position: [number, number, number]) => {
    if (!selectedTool) return;
    
    const colors: Record<string, string[]> = {
      flower: ['#FF69B4', '#FF6B6B', '#FFD700', '#9370DB', '#FF8C00'],
      tree: ['#228B22', '#006400', '#2E8B57'],
      bush: ['#32CD32', '#3CB371', '#2E8B57'],
      fountain: ['#4169E1'],
      bench: ['#8B4513'],
    };

    const toolColors = colors[selectedTool] || ['#888888'];
    const newItem: GardenItem = {
      id: Date.now(),
      type: selectedTool as GardenItem['type'],
      position,
      color: toolColors[Math.floor(Math.random() * toolColors.length)],
      scale: 0.8 + Math.random() * 0.4,
    };

    setItems((prev) => [...prev, newItem]);
    
    const points = selectedTool === 'fountain' ? 25 : selectedTool === 'tree' ? 15 : 10;
    const newScore = score + points;
    setScore(newScore);

    if (newScore >= targetScore) {
      const stars = newScore >= targetScore * 1.5 ? 3 : newScore >= targetScore * 1.2 ? 2 : 1;
      onLevelComplete?.(newScore, stars);
    }
  };

  const handleReset = () => {
    setItems([]);
    setScore(0);
    setSelectedTool(null);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-sky-300 to-sky-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80 backdrop-blur-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-green-700">
          🌻 {score}/{targetScore} points
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/80 backdrop-blur-sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-full">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedTool === tool.id
                ? 'bg-green-500 text-white scale-110'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* Instructions */}
      {selectedTool && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
          Click on the garden to place your {selectedTool}!
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas camera={{ position: [8, 8, 8], fov: 50 }} shadows>
        <GameScene items={items} selectedTool={selectedTool} onPlaceItem={handlePlaceItem} />
      </Canvas>
    </div>
  );
}
