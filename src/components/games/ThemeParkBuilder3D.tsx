import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Stars } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

interface ThemeParkBuilder3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

interface Attraction {
  id: string;
  type: 'roller-coaster' | 'ferris-wheel' | 'carousel' | 'bumper-cars' | 'drop-tower' | 'food-stand';
  position: [number, number, number];
  color: string;
}

// Roller Coaster
const RollerCoaster3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  const trackRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (trackRef.current) {
      trackRef.current.children.forEach((child, i) => {
        if (child.name === 'car') {
          const time = state.clock.elapsedTime + i;
          child.position.x = Math.sin(time * 2) * 1.5;
          child.position.y = Math.abs(Math.sin(time * 2)) * 1 + 0.5;
        }
      });
    }
  });

  return (
    <group position={position} ref={trackRef}>
      {/* Track structure */}
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[1.5, 0.1, 8, 32]} />
        <meshStandardMaterial color="#666" metalness={0.8} />
      </mesh>
      {/* Support pillars */}
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x, 0.75, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}
      {/* Car */}
      <mesh name="car" position={[0, 1.5, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// Ferris Wheel
const FerrisWheel3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  const wheelRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1, 0.5, 0.5]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Support */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      {/* Wheel */}
      <mesh ref={wheelRef} position={[0, 2.5, 0.3]}>
        <torusGeometry args={[1.2, 0.1, 8, 32]} />
        <meshStandardMaterial color={color} />
        {/* Cabins */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1.2, Math.sin(i * Math.PI / 3) * 1.2, 0]}>
            <boxGeometry args={[0.3, 0.4, 0.3]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        ))}
      </mesh>
    </group>
  );
};

// Carousel
const Carousel3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  const carouselRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (carouselRef.current) {
      carouselRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Rotating platform */}
      <group ref={carouselRef}>
        {/* Center pole */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[1.5, 0.8, 8]} />
          <meshStandardMaterial color="#FF6B6B" />
        </mesh>
        {/* Horses */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1, 0.6, Math.sin(i * Math.PI / 3) * 1]}>
            <boxGeometry args={[0.3, 0.5, 0.5]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Drop Tower
const DropTower3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  const carRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (carRef.current) {
      const cycle = (state.clock.elapsedTime % 4);
      if (cycle < 2) {
        carRef.current.position.y = cycle * 2;
      } else if (cycle < 2.5) {
        carRef.current.position.y = 4;
      } else {
        carRef.current.position.y = 4 - (cycle - 2.5) * 8;
        if (carRef.current.position.y < 0.5) carRef.current.position.y = 0.5;
      }
    }
  });

  return (
    <group position={position}>
      {/* Tower */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.5, 5, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Car */}
      <mesh ref={carRef} position={[0, 0.5, 0.4]}>
        <boxGeometry args={[0.8, 0.6, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Top */}
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[1, 0.4, 1]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
    </group>
  );
};

// Food Stand
const FoodStand3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 1, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.4, 0.1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1.8, -0.3]}>
        <boxGeometry args={[0.8, 0.4, 0.1]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
    </group>
  );
};

// Ground
const ParkGround = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#228B22" />
    </mesh>
  );
};

// Game Scene
const GameScene = ({ attractions, score }: { attractions: Attraction[], score: number }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.3} color="#FFD700" />
      
      <Stars radius={100} depth={50} count={2000} factor={4} />
      <ParkGround />
      
      {attractions.map((attr) => {
        switch (attr.type) {
          case 'roller-coaster':
            return <RollerCoaster3D key={attr.id} position={attr.position} color={attr.color} />;
          case 'ferris-wheel':
            return <FerrisWheel3D key={attr.id} position={attr.position} color={attr.color} />;
          case 'carousel':
            return <Carousel3D key={attr.id} position={attr.position} color={attr.color} />;
          case 'drop-tower':
            return <DropTower3D key={attr.id} position={attr.position} color={attr.color} />;
          case 'food-stand':
            return <FoodStand3D key={attr.id} position={attr.position} color={attr.color} />;
          default:
            return null;
        }
      })}
      
      <Text position={[0, 8, 0]} fontSize={1} color="#FFD700" anchorX="center">
        🎢 Theme Park
      </Text>
      <Text position={[0, 7, 0]} fontSize={0.5} color="#FFF" anchorX="center">
        Score: {score}
      </Text>
      
      <OrbitControls enablePan minDistance={8} maxDistance={30} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="sunset" />
    </>
  );
};

const ATTRACTION_TYPES: { type: Attraction['type']; label: string; points: number; colors: string[] }[] = [
  { type: 'roller-coaster', label: '🎢 Roller Coaster', points: 100, colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] },
  { type: 'ferris-wheel', label: '🎡 Ferris Wheel', points: 80, colors: ['#9B59B6', '#E74C3C', '#3498DB'] },
  { type: 'carousel', label: '🎠 Carousel', points: 60, colors: ['#FF69B4', '#FFD700', '#32CD32'] },
  { type: 'drop-tower', label: '🗼 Drop Tower', points: 90, colors: ['#E67E22', '#1ABC9C', '#9B59B6'] },
  { type: 'food-stand', label: '🍔 Food Stand', points: 40, colors: ['#F39C12', '#E74C3C', '#2ECC71'] },
];

const ThemeParkBuilder3D: React.FC<ThemeParkBuilder3DProps> = ({
  level = 1,
  onLevelComplete,
  onBack
}) => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [score, setScore] = useState(0);
  const attractionIdRef = useRef(0);
  const targetScore = level * 300;

  const handleAddAttraction = (type: Attraction['type']) => {
    const attrType = ATTRACTION_TYPES.find(t => t.type === type)!;
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 8;
    
    const newAttraction: Attraction = {
      id: `attraction-${attractionIdRef.current++}`,
      type,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      color: attrType.colors[Math.floor(Math.random() * attrType.colors.length)]
    };
    
    setAttractions(prev => [...prev, newAttraction]);
    const newScore = score + attrType.points;
    setScore(newScore);
    
    if (newScore >= targetScore) {
      setTimeout(() => {
        onLevelComplete?.(newScore, Math.floor(newScore / 50));
      }, 500);
    }
  };

  const handleReset = () => {
    setAttractions([]);
    setScore(0);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-700">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            Level {level} | Target: {targetScore}
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            Score: {score}
          </div>
        </div>
        
        <Button variant="ghost" onClick={handleReset} className="text-white hover:bg-white/20">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/30 backdrop-blur-sm rounded-2xl p-3">
        {ATTRACTION_TYPES.map((attr) => (
          <button
            key={attr.type}
            onClick={() => handleAddAttraction(attr.type)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <span className="text-2xl">{attr.label.split(' ')[0]}</span>
            <span className="text-xs">+{attr.points}</span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm">
        Click attractions to add them to your park!
      </div>

      <Canvas camera={{ position: [15, 15, 15], fov: 50 }} shadows>
        <GameScene attractions={attractions} score={score} />
      </Canvas>
    </div>
  );
};

export default ThemeParkBuilder3D;
