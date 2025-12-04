import { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface SpaceStation3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface StationModule {
  id: number;
  type: 'habitat' | 'solar' | 'lab' | 'dock' | 'communication' | 'storage';
  position: [number, number, number];
  color: string;
  rotation: number;
}

function HabitatModule({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);
  
  return (
    <group ref={ref} position={position}>
      {/* Main cylinder */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 1.2, 16]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* End caps */}
      {[-0.65, 0.65].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Windows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.3, Math.sin(i * Math.PI / 2) * 0.3, 0.41]} rotation={[0, 0, i * Math.PI / 2]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function SolarPanel({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Support arm */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
      </mesh>
      {/* Panel */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.8]} />
        <meshStandardMaterial color="#1a237e" metalness={0.3} />
      </mesh>
      {/* Grid lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-0.6 + i * 0.3, 0.42, 0]}>
          <boxGeometry args={[0.02, 0.01, 0.78]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      ))}
    </group>
  );
}

function LabModule({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Main body */}
      <mesh>
        <boxGeometry args={[1, 0.6, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Observation dome */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>
      {/* Equipment */}
      <mesh position={[0.3, -0.35, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.2]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

function DockingPort({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Blinking lights
      ref.current.children[2].visible = Math.sin(state.clock.elapsedTime * 4) > 0;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Port ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 8, 32]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
      </mesh>
      {/* Connector tube */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      {/* Docking light */}
      <mesh position={[0, 0.2, 0.35]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function CommunicationDish({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
      </mesh>
      {/* Dish */}
      <mesh position={[0, 0.3, 0]} rotation={[0.5, 0, 0]}>
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#E8E8E8" metalness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.3, 0.15]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

function StorageModule({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Container */}
      <mesh>
        <boxGeometry args={[0.8, 0.5, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cargo doors */}
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.26]}>
          <boxGeometry args={[0.25, 0.35, 0.02]} />
          <meshStandardMaterial color="#4A4A4A" />
        </mesh>
      ))}
      {/* Handle */}
      <mesh position={[0, 0, 0.27]}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

function ConnectorTube({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const midPoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];
  
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
    Math.pow(end[1] - start[1], 2) +
    Math.pow(end[2] - start[2], 2)
  );

  const direction = new THREE.Vector3(
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2]
  ).normalize();

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

  return (
    <mesh position={midPoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.08, 0.08, length, 8]} />
      <meshStandardMaterial color="#808080" metalness={0.6} />
    </mesh>
  );
}

function Earth() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={[0, -15, -10]}>
      <sphereGeometry args={[12, 32, 32]} />
      <meshStandardMaterial color="#4169E1" />
    </mesh>
  );
}

function GameScene({ modules, score, targetScore }: { modules: StationModule[]; score: number; targetScore: number }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#FFFFFF" />
      
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      <Earth />
      
      {/* Central hub */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
      </mesh>
      
      {modules.map((module) => {
        switch (module.type) {
          case 'habitat': return <HabitatModule key={module.id} position={module.position} color={module.color} />;
          case 'solar': return <SolarPanel key={module.id} position={module.position} />;
          case 'lab': return <LabModule key={module.id} position={module.position} color={module.color} />;
          case 'dock': return <DockingPort key={module.id} position={module.position} />;
          case 'communication': return <CommunicationDish key={module.id} position={module.position} />;
          case 'storage': return <StorageModule key={module.id} position={module.position} color={module.color} />;
          default: return null;
        }
      })}
      
      {/* Connectors between modules */}
      {modules.length > 1 && modules.slice(1).map((module, i) => (
        <ConnectorTube key={`conn-${i}`} start={[0, 0, 0]} end={module.position} />
      ))}
      
      <Text position={[0, 4, 0]} fontSize={0.4} color="#FFD700" anchorX="center">
        {`🛸 ${score} / ${targetScore}`}
      </Text>
      
      <OrbitControls enablePan={false} minDistance={5} maxDistance={20} />
      <Environment preset="night" />
    </>
  );
}

const moduleTypes: Array<{ type: StationModule['type']; label: string; points: number; colors: string[] }> = [
  { type: 'habitat', label: '🏠 Habitat', points: 25, colors: ['#E8E8E8', '#F5F5F5'] },
  { type: 'solar', label: '☀️ Solar', points: 20, colors: ['#1a237e'] },
  { type: 'lab', label: '🔬 Lab', points: 30, colors: ['#E8E8E8', '#B0C4DE'] },
  { type: 'dock', label: '🚀 Dock', points: 20, colors: ['#C0C0C0'] },
  { type: 'communication', label: '📡 Comm', points: 18, colors: ['#C0C0C0'] },
  { type: 'storage', label: '📦 Storage', points: 15, colors: ['#FFA500', '#FFD700'] },
];

export function SpaceStation3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: SpaceStation3DProps) {
  const [modules, setModules] = useState<StationModule[]>([]);
  const [score, setScore] = useState(0);
  const moduleIdRef = useRef(0);

  const targetScore = Math.floor(150 * level * difficultyMultiplier);

  const handleAddModule = (type: StationModule['type']) => {
    const config = moduleTypes.find(m => m.type === type);
    if (!config) return;

    // Position modules in a pattern around center
    const angle = (modules.length * Math.PI / 3);
    const radius = 2 + Math.floor(modules.length / 6) * 1.5;
    
    const newModule: StationModule = {
      id: moduleIdRef.current++,
      type,
      position: [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius,
      ],
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      rotation: angle,
    };

    setModules(prev => [...prev, newModule]);
    
    const newScore = score + config.points;
    setScore(newScore);

    if (newScore >= targetScore) {
      const stars = newScore >= targetScore * 1.5 ? 3 : newScore >= targetScore * 1.2 ? 2 : 1;
      onLevelComplete?.(newScore, stars);
    }
  };

  const handleReset = () => {
    setModules([]);
    setScore(0);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-black via-gray-900 to-indigo-950 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-cyan-300">
          🛸 {score}/{targetScore}
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full">
        {moduleTypes.map((module) => (
          <button
            key={module.type}
            onClick={() => handleAddModule(module.type)}
            className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all hover:scale-110"
          >
            {module.label}
          </button>
        ))}
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [8, 5, 8], fov: 50 }}>
        <GameScene modules={modules} score={score} targetScore={targetScore} />
      </Canvas>
    </div>
  );
}
