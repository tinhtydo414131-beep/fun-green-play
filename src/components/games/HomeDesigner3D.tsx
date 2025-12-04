import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Home } from 'lucide-react';
import * as THREE from 'three';

interface HomeDesigner3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

interface Furniture {
  id: string;
  type: 'sofa' | 'table' | 'lamp' | 'plant' | 'bed' | 'bookshelf' | 'tv' | 'rug';
  position: [number, number, number];
  color: string;
  rotation: number;
}

// Sofa
const Sofa3D = ({ position, color, rotation }: { position: [number, number, number], color: string, rotation: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.8, 0.5, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.6, -0.3]}>
        <boxGeometry args={[1.8, 0.5, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.85, 0.45, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.85, 0.45, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cushions */}
      <mesh position={[-0.4, 0.55, 0.1]}>
        <boxGeometry args={[0.7, 0.15, 0.5]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      <mesh position={[0.4, 0.55, 0.1]}>
        <boxGeometry args={[0.7, 0.15, 0.5]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
    </group>
  );
};

// Table
const Table3D = ({ position, color, rotation }: { position: [number, number, number], color: string, rotation: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Top */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Legs */}
      {[[-0.5, -0.2], [0.5, -0.2], [-0.5, 0.2], [0.5, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  );
};

// Lamp
const Lamp3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      {/* Shade */}
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.25, 0.3, 16, 1, true]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      {/* Light */}
      <pointLight position={[0, 1, 0]} intensity={0.5} color="#FFD700" distance={3} />
    </group>
  );
};

// Plant
const Plant3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Leaves */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <mesh key={angle} position={[0, 0.4, 0]} rotation={[0.3, (angle * Math.PI) / 180, 0]}>
          <sphereGeometry args={[0.15, 8, 8, 0, Math.PI]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
};

// Bed
const Bed3D = ({ position, color, rotation }: { position: [number, number, number], color: string, rotation: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.6, 0.4, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.45, 0.1]}>
        <boxGeometry args={[1.4, 0.15, 1.7]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.7, -0.9]}>
        <boxGeometry args={[1.6, 0.8, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.6, -0.6]}>
        <boxGeometry args={[1, 0.15, 0.4]} />
        <meshStandardMaterial color="#FFF8DC" />
      </mesh>
    </group>
  );
};

// Bookshelf
const Bookshelf3D = ({ position, color, rotation }: { position: [number, number, number], color: string, rotation: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.2, 1.8, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Shelves */}
      {[0.3, 0.9, 1.5].map((y) => (
        <mesh key={y} position={[0, y, 0.02]}>
          <boxGeometry args={[1.1, 0.05, 0.25]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
      {/* Books */}
      {[0.5, 1.1].map((y) => (
        <group key={y} position={[0, y, 0.05]}>
          {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
            <mesh key={x} position={[x, 0.15, 0]}>
              <boxGeometry args={[0.15, 0.25, 0.15]} />
              <meshStandardMaterial color={['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'][i]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// TV
const TV3D = ({ position, rotation }: { position: [number, number, number], rotation: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Stand */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.6, 0.9, 0.05]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Screen content */}
      <mesh position={[0, 1, 0.03]}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshStandardMaterial color="#4169E1" emissive="#4169E1" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

// Rug
const Rug3D = ({ position, color, rotation }: { position: [number, number, number], color: string, rotation: number }) => {
  return (
    <mesh position={[position[0], 0.01, position[2]]} rotation={[-Math.PI / 2, 0, rotation]}>
      <planeGeometry args={[2, 1.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Room
const Room3D = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      {/* Walls */}
      <mesh position={[0, 2, -6]}>
        <boxGeometry args={[12, 4, 0.2]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      <mesh position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 4, 0.2]} />
        <meshStandardMaterial color="#FAF0E6" />
      </mesh>
    </group>
  );
};

// Game Scene
const GameScene = ({ furniture, score }: { furniture: Furniture[], score: number }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      
      <Room3D />
      
      {furniture.map((item) => {
        switch (item.type) {
          case 'sofa':
            return <Sofa3D key={item.id} position={item.position} color={item.color} rotation={item.rotation} />;
          case 'table':
            return <Table3D key={item.id} position={item.position} color={item.color} rotation={item.rotation} />;
          case 'lamp':
            return <Lamp3D key={item.id} position={item.position} color={item.color} />;
          case 'plant':
            return <Plant3D key={item.id} position={item.position} color={item.color} />;
          case 'bed':
            return <Bed3D key={item.id} position={item.position} color={item.color} rotation={item.rotation} />;
          case 'bookshelf':
            return <Bookshelf3D key={item.id} position={item.position} color={item.color} rotation={item.rotation} />;
          case 'tv':
            return <TV3D key={item.id} position={item.position} rotation={item.rotation} />;
          case 'rug':
            return <Rug3D key={item.id} position={item.position} color={item.color} rotation={item.rotation} />;
          default:
            return null;
        }
      })}
      
      <Text position={[0, 5, -5]} fontSize={0.8} color="#8B4513" anchorX="center">
        🏠 Home Designer
      </Text>
      <Text position={[0, 4.2, -5]} fontSize={0.4} color="#666" anchorX="center">
        Score: {score}
      </Text>
      
      <OrbitControls 
        enablePan 
        minDistance={5} 
        maxDistance={20} 
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 0]}
      />
      <Environment preset="apartment" />
    </>
  );
};

const FURNITURE_TYPES: { type: Furniture['type']; label: string; points: number; colors: string[] }[] = [
  { type: 'sofa', label: '🛋️ Sofa', points: 50, colors: ['#4169E1', '#E74C3C', '#2ECC71', '#9B59B6'] },
  { type: 'table', label: '🪑 Table', points: 30, colors: ['#8B4513', '#D2691E', '#A0522D'] },
  { type: 'lamp', label: '💡 Lamp', points: 25, colors: ['#FFD700', '#FF6B6B', '#87CEEB'] },
  { type: 'plant', label: '🌿 Plant', points: 20, colors: ['#228B22', '#32CD32', '#006400'] },
  { type: 'bed', label: '🛏️ Bed', points: 60, colors: ['#4169E1', '#E74C3C', '#9B59B6'] },
  { type: 'bookshelf', label: '📚 Shelf', points: 45, colors: ['#8B4513', '#D2691E', '#F5DEB3'] },
  { type: 'tv', label: '📺 TV', points: 55, colors: ['#333'] },
  { type: 'rug', label: '🧶 Rug', points: 35, colors: ['#E74C3C', '#9B59B6', '#3498DB', '#E67E22'] },
];

const HomeDesigner3D: React.FC<HomeDesigner3DProps> = ({
  level = 1,
  onLevelComplete,
  onBack
}) => {
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [score, setScore] = useState(0);
  const furnitureIdRef = useRef(0);
  const targetScore = level * 200;

  const handleAddFurniture = (type: Furniture['type']) => {
    const furnitureType = FURNITURE_TYPES.find(t => t.type === type)!;
    
    const newFurniture: Furniture = {
      id: `furniture-${furnitureIdRef.current++}`,
      type,
      position: [
        -4 + Math.random() * 8,
        type === 'rug' ? 0.01 : 0,
        -4 + Math.random() * 8
      ],
      color: furnitureType.colors[Math.floor(Math.random() * furnitureType.colors.length)],
      rotation: Math.random() * Math.PI * 2
    };
    
    setFurniture(prev => [...prev, newFurniture]);
    const newScore = score + furnitureType.points;
    setScore(newScore);
    
    if (newScore >= targetScore) {
      setTimeout(() => {
        onLevelComplete?.(newScore, Math.floor(newScore / 30));
      }, 500);
    }
  };

  const handleReset = () => {
    setFurniture([]);
    setScore(0);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-amber-100 via-orange-100 to-amber-200">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="text-amber-900 hover:bg-amber-200">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 text-amber-900">
            <Home className="w-5 h-5 inline mr-2" />
            Level {level} | Target: {targetScore}
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 text-amber-900">
            Score: {score}
          </div>
        </div>
        
        <Button variant="ghost" onClick={handleReset} className="text-amber-900 hover:bg-amber-200">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/50 backdrop-blur-sm rounded-2xl p-3">
        {FURNITURE_TYPES.map((item) => (
          <button
            key={item.type}
            onClick={() => handleAddFurniture(item.type)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/30 hover:bg-white/60 transition-colors text-amber-900"
          >
            <span className="text-xl">{item.label.split(' ')[0]}</span>
            <span className="text-xs font-medium">+{item.points}</span>
          </button>
        ))}
      </div>

      <Canvas camera={{ position: [8, 8, 8], fov: 50 }} shadows>
        <GameScene furniture={furniture} score={score} />
      </Canvas>
    </div>
  );
};

export default HomeDesigner3D;
