import { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface CityCreator3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface Building {
  id: number;
  type: 'house' | 'skyscraper' | 'shop' | 'park' | 'road' | 'factory';
  position: [number, number, number];
  color: string;
  scale: number;
}

function House3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Base */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.75, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.6, 0.4, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.15, 0.31]}>
        <boxGeometry args={[0.15, 0.3, 0.02]} />
        <meshStandardMaterial color="#4A3728" />
      </mesh>
      {/* Windows */}
      {[[-0.2, 0.35], [0.2, 0.35]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.31]}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
      ))}
    </group>
  );
}

function Skyscraper3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Slight sway
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.005;
    }
  });

  const height = 1.5 + scale * 0.5;

  return (
    <group ref={ref} position={position}>
      {/* Main building */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Windows grid */}
      {Array.from({ length: Math.floor(height * 4) }).map((_, i) => (
        <group key={i}>
          {[-0.2, 0.2].map((x, j) => (
            <mesh key={j} position={[x, 0.2 + i * 0.25, 0.31]}>
              <boxGeometry args={[0.1, 0.08, 0.02]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Antenna */}
      <mesh position={[0, height + 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
    </group>
  );
}

function Shop3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Building */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.7, 0.5, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Awning */}
      <mesh position={[0, 0.4, 0.35]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
        <meshStandardMaterial color="#FF6347" />
      </mesh>
      {/* Shop window */}
      <mesh position={[0, 0.2, 0.26]}>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 0.55, 0.26]}>
        <boxGeometry args={[0.4, 0.1, 0.02]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Park3D({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Grass */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1, 0.04, 1]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>
      {/* Trees */}
      {[[-0.3, 0, -0.3], [0.3, 0, 0.3], [0, 0, 0]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}
      {/* Bench */}
      <mesh position={[0.3, 0.08, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

function Road3D({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Road surface */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Lane markings */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, 0.15]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
    </group>
  );
}

function Factory3D({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const smokeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (smokeRef.current) {
      smokeRef.current.children.forEach((smoke, i) => {
        smoke.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1 + i * 0.15;
        (smoke as THREE.Mesh).scale.setScalar(0.1 + i * 0.05);
      });
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Main building */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1, 0.6, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Chimney */}
      <mesh position={[0.3, 0.7, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Smoke */}
      <group ref={smokeRef} position={[0.3, 0.8, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * 0.15, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#808080" transparent opacity={0.5 - i * 0.1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CityGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[15, 15]} />
      <meshStandardMaterial color="#90EE90" />
    </mesh>
  );
}

function Car({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 5;
    }
  });

  return (
    <group ref={ref} position={position} scale={0.3}>
      {/* Body */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.3]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      {/* Top */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.25]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      {/* Wheels */}
      {[[-0.2, 0.05, 0.15], [0.2, 0.05, 0.15], [-0.2, 0.05, -0.15], [0.2, 0.05, -0.15]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

function GameScene({ buildings, score, targetScore }: { buildings: Building[]; score: number; targetScore: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#FFD700" />
      
      <CityGround />
      
      {buildings.map((building) => {
        const props = { position: building.position, color: building.color, scale: building.scale };
        switch (building.type) {
          case 'house': return <House3D key={building.id} {...props} />;
          case 'skyscraper': return <Skyscraper3D key={building.id} {...props} />;
          case 'shop': return <Shop3D key={building.id} {...props} />;
          case 'park': return <Park3D key={building.id} position={building.position} scale={building.scale} />;
          case 'road': return <Road3D key={building.id} position={building.position} scale={building.scale} />;
          case 'factory': return <Factory3D key={building.id} {...props} />;
          default: return null;
        }
      })}
      
      <Car position={[0, 0.1, 2]} />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#FFD700" anchorX="center">
        {`🏙️ ${score} / ${targetScore}`}
      </Text>
      
      <OrbitControls enablePan={true} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="city" />
    </>
  );
}

const buildingTypes: Array<{ type: Building['type']; label: string; points: number; colors: string[] }> = [
  { type: 'house', label: '🏠 House', points: 10, colors: ['#FFE4C4', '#F5DEB3', '#FFDAB9'] },
  { type: 'skyscraper', label: '🏢 Tower', points: 25, colors: ['#4682B4', '#708090', '#5F9EA0'] },
  { type: 'shop', label: '🏪 Shop', points: 15, colors: ['#FFB6C1', '#DDA0DD', '#98FB98'] },
  { type: 'park', label: '🌳 Park', points: 20, colors: ['#32CD32'] },
  { type: 'road', label: '🛣️ Road', points: 8, colors: ['#333333'] },
  { type: 'factory', label: '🏭 Factory', points: 18, colors: ['#B0C4DE', '#778899'] },
];

export function CityCreator3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: CityCreator3DProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [score, setScore] = useState(0);
  const [selectedTool, setSelectedTool] = useState<Building['type'] | null>(null);
  const buildingIdRef = useRef(0);

  const targetScore = Math.floor(150 * level * difficultyMultiplier);

  const handleAddBuilding = (type: Building['type']) => {
    const config = buildingTypes.find(b => b.type === type);
    if (!config) return;

    const newBuilding: Building = {
      id: buildingIdRef.current++,
      type,
      position: [
        Math.random() * 8 - 4,
        0,
        Math.random() * 8 - 4,
      ],
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      scale: 0.8 + Math.random() * 0.4,
    };

    setBuildings(prev => [...prev, newBuilding]);
    
    const newScore = score + config.points;
    setScore(newScore);

    if (newScore >= targetScore) {
      const stars = newScore >= targetScore * 1.5 ? 3 : newScore >= targetScore * 1.2 ? 2 : 1;
      onLevelComplete?.(newScore, stars);
    }
  };

  const handleReset = () => {
    setBuildings([]);
    setScore(0);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-sky-400 to-sky-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80 backdrop-blur-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-blue-700">
          🏙️ {score}/{targetScore}
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/80 backdrop-blur-sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-full">
        {buildingTypes.map((building) => (
          <button
            key={building.type}
            onClick={() => handleAddBuilding(building.type)}
            className="px-3 py-2 rounded-full bg-gray-100 hover:bg-blue-100 text-sm transition-all hover:scale-110"
          >
            {building.label}
          </button>
        ))}
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }} shadows>
        <GameScene buildings={buildings} score={score} targetScore={targetScore} />
      </Canvas>
    </div>
  );
}
