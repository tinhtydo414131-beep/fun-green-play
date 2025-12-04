import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface SpaceExplorer3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface SpaceObject {
  id: number;
  type: 'star' | 'planet' | 'asteroid' | 'comet' | 'nebula' | 'satellite';
  position: [number, number, number];
  color: string;
  collected: boolean;
  points: number;
}

function Spaceship({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0.35, 0.1, 0]}>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>
      {/* Wings */}
      <mesh position={[-0.1, 0, 0.3]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#4682B4" />
      </mesh>
      <mesh position={[-0.1, 0, -0.3]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#4682B4" />
      </mesh>
      {/* Engine glow */}
      <mesh position={[-0.5, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function Star3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
    }
  });

  if (collected) return null;

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.3 : 1}>
        {/* Star points */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 5) * 0.2, Math.sin(i * Math.PI * 2 / 5) * 0.2, 0]} rotation={[0, 0, i * Math.PI * 2 / 5]}>
            <coneGeometry args={[0.1, 0.25, 4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
        </mesh>
      </group>
    </Float>
  );
}

function Planet3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  if (collected) return null;

  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.6, 0.05, 8, 32]} />
        <meshStandardMaterial color="#DDA0DD" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Asteroid3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.x = state.clock.elapsedTime;
      ref.current.rotation.y = state.clock.elapsedTime * 0.7;
    }
  });

  if (collected) return null;

  return (
    <mesh ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.3 : 1}>
      <dodecahedronGeometry args={[0.25, 0]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Comet3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime) * 2;
      ref.current.position.z = position[2] + Math.cos(state.clock.elapsedTime) * 2;
    }
  });

  if (collected) return null;

  return (
    <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* Tail */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.2 - i * 0.15, 0, 0]}>
          <sphereGeometry args={[0.1 - i * 0.01, 8, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.8 - i * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

function Nebula3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.2;
      ref.current.children.forEach((child, i) => {
        child.scale.setScalar(1 + Math.sin(state.clock.elapsedTime + i) * 0.1);
      });
    }
  });

  if (collected) return null;

  return (
    <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25]}>
          <sphereGeometry args={[0.2 + Math.random() * 0.2, 16, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.4} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Satellite3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  if (collected) return null;

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.3 : 1}>
        {/* Body */}
        <mesh>
          <boxGeometry args={[0.2, 0.15, 0.15]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Solar panels */}
        <mesh position={[0, 0, 0.25]}>
          <boxGeometry args={[0.4, 0.02, 0.3]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
        <mesh position={[0, 0, -0.25]}>
          <boxGeometry args={[0.4, 0.02, 0.3]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
        {/* Antenna */}
        <mesh position={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>
    </Float>
  );
}

function GameScene({ objects, onCollect, score, targetScore }: { objects: SpaceObject[]; onCollect: (id: number) => void; score: number; targetScore: number }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#FFD700" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      
      <Spaceship position={[0, 0, 5]} />
      
      {objects.map((obj) => {
        const props = {
          key: obj.id,
          position: obj.position,
          color: obj.color,
          collected: obj.collected,
          onClick: () => onCollect(obj.id),
        };
        
        switch (obj.type) {
          case 'star': return <Star3D {...props} />;
          case 'planet': return <Planet3D {...props} />;
          case 'asteroid': return <Asteroid3D {...props} />;
          case 'comet': return <Comet3D {...props} />;
          case 'nebula': return <Nebula3D {...props} />;
          case 'satellite': return <Satellite3D {...props} />;
          default: return <Star3D {...props} />;
        }
      })}
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#FFD700" anchorX="center">
        {`🚀 ${score} / ${targetScore}`}
      </Text>
      
      <OrbitControls enablePan={false} minDistance={8} maxDistance={20} />
      <Environment preset="night" />
    </>
  );
}

export function SpaceExplorer3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: SpaceExplorer3DProps) {
  const [objects, setObjects] = useState<SpaceObject[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const objectTypes: Array<{ type: SpaceObject['type']; points: number; colors: string[] }> = [
    { type: 'star', points: 10, colors: ['#FFD700', '#FFA500', '#FFFF00'] },
    { type: 'planet', points: 25, colors: ['#4169E1', '#DC143C', '#32CD32', '#FF8C00'] },
    { type: 'asteroid', points: 15, colors: ['#808080', '#A0522D', '#696969'] },
    { type: 'comet', points: 20, colors: ['#00CED1', '#87CEEB', '#E0FFFF'] },
    { type: 'nebula', points: 30, colors: ['#9370DB', '#FF69B4', '#00CED1'] },
    { type: 'satellite', points: 18, colors: ['#C0C0C0', '#FFD700'] },
  ];

  const objectCount = Math.min(8 + level * 2, 18);
  const targetScore = Math.floor(objectCount * 15 * difficultyMultiplier);

  const initGame = () => {
    const newObjects: SpaceObject[] = [];
    for (let i = 0; i < objectCount; i++) {
      const typeConfig = objectTypes[Math.floor(Math.random() * objectTypes.length)];
      newObjects.push({
        id: i,
        type: typeConfig.type,
        position: [
          Math.random() * 12 - 6,
          Math.random() * 8 - 4,
          Math.random() * 8 - 4,
        ],
        color: typeConfig.colors[Math.floor(Math.random() * typeConfig.colors.length)],
        collected: false,
        points: typeConfig.points,
      });
    }
    setObjects(newObjects);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  useEffect(() => {
    if (score >= targetScore && !gameOver) {
      setGameOver(true);
      const stars = score >= targetScore * 1.5 ? 3 : score >= targetScore * 1.2 ? 2 : 1;
      onLevelComplete?.(score, stars);
    }
  }, [score, targetScore, gameOver, onLevelComplete]);

  const handleCollect = (id: number) => {
    if (gameOver) return;
    
    setObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, collected: true } : obj))
    );
    
    const obj = objects.find((o) => o.id === id);
    if (obj) {
      setScore((prev) => prev + obj.points);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-black via-indigo-950 to-purple-950 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-yellow-300">
          🚀 {score}/{targetScore}
        </div>
        <Button variant="outline" size="sm" onClick={initGame} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
        🌟 Click space objects to collect them!
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
        <GameScene objects={objects} onCollect={handleCollect} score={score} targetScore={targetScore} />
      </Canvas>

      {/* Game Complete */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="bg-gradient-to-b from-indigo-900 to-purple-900 rounded-2xl p-8 text-center max-w-sm mx-4 border border-white/20">
            <div className="text-6xl mb-4">🌌</div>
            <h2 className="text-2xl font-bold mb-2 text-white">Mission Complete!</h2>
            <p className="text-gray-300 mb-4">You collected {score} space points!</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={initGame} className="bg-indigo-500 hover:bg-indigo-600">
                <RotateCcw className="w-4 h-4 mr-2" /> Explore Again
              </Button>
              <Button variant="outline" onClick={onBack} className="text-white border-white/30">
                Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
