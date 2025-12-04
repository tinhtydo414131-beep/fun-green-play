import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Cloud } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Leaf } from 'lucide-react';
import * as THREE from 'three';

interface EcoVillage3DProps {
  level?: number;
  onLevelComplete?: (score: number, coins: number) => void;
  onBack?: () => void;
}

interface EcoBuilding {
  id: string;
  type: 'solar-house' | 'wind-turbine' | 'garden' | 'recycling-center' | 'water-tank' | 'tree';
  position: [number, number, number];
  color: string;
}

// Solar House
const SolarHouse3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <group position={position}>
      {/* House body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.3, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[1.1, 0.6, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Solar panels */}
      <mesh position={[0, 1.4, 0.3]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.35, 0.61]}>
        <boxGeometry args={[0.3, 0.7, 0.05]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
};

// Wind Turbine
const WindTurbine3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  const bladesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z = state.clock.elapsedTime * 3;
    }
  });

  return (
    <group position={position}>
      {/* Tower */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 4, 8]} />
        <meshStandardMaterial color="#DDD" />
      </mesh>
      {/* Nacelle */}
      <mesh position={[0, 4, 0.2]}>
        <boxGeometry args={[0.4, 0.4, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Blades */}
      <group ref={bladesRef} position={[0, 4, 0.6]}>
        {[0, 120, 240].map((angle) => (
          <mesh key={angle} rotation={[0, 0, (angle * Math.PI) / 180]} position={[0, 0, 0]}>
            <boxGeometry args={[0.15, 1.8, 0.05]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Garden
const Garden3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <group position={position}>
      {/* Garden bed */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Plants */}
      {[-0.4, 0, 0.4].map((x) => (
        [-0.4, 0, 0.4].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0.3, z]}>
            <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.2, 4]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        ))
      )).flat()}
    </group>
  );
};

// Recycling Center
const RecyclingCenter3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <group position={position}>
      {/* Building */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2, 1.2, 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Recycling symbol */}
      <mesh position={[0, 0.6, 0.76]}>
        <torusGeometry args={[0.3, 0.08, 8, 3]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>
      {/* Bins */}
      {[-0.6, 0, 0.6].map((x, i) => (
        <mesh key={x} position={[x, 0.3, 1]}>
          <cylinderGeometry args={[0.2, 0.15, 0.4, 8]} />
          <meshStandardMaterial color={['#4169E1', '#FFD700', '#32CD32'][i]} />
        </mesh>
      ))}
    </group>
  );
};

// Water Tank
const WaterTank3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 1.5, 16]} />
        <meshStandardMaterial color={color} metalness={0.3} />
      </mesh>
      {/* Pipe */}
      <mesh position={[0.6, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  );
};

// Tree
const EcoTree3D = ({ position, color }: { position: [number, number, number], color: string }) => {
  const treeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={treeRef} position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 2.6, 0]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// Ground
const VillageGround = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#90EE90" />
    </mesh>
  );
};

// Game Scene
const GameScene = ({ buildings, ecoScore }: { buildings: EcoBuilding[], ecoScore: number }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      
      <Cloud position={[-8, 10, -5]} speed={0.2} opacity={0.5} />
      <Cloud position={[8, 12, 5]} speed={0.3} opacity={0.4} />
      
      <VillageGround />
      
      {buildings.map((building) => {
        switch (building.type) {
          case 'solar-house':
            return <SolarHouse3D key={building.id} position={building.position} color={building.color} />;
          case 'wind-turbine':
            return <WindTurbine3D key={building.id} position={building.position} color={building.color} />;
          case 'garden':
            return <Garden3D key={building.id} position={building.position} color={building.color} />;
          case 'recycling-center':
            return <RecyclingCenter3D key={building.id} position={building.position} color={building.color} />;
          case 'water-tank':
            return <WaterTank3D key={building.id} position={building.position} color={building.color} />;
          case 'tree':
            return <EcoTree3D key={building.id} position={building.position} color={building.color} />;
          default:
            return null;
        }
      })}
      
      <Text position={[0, 8, 0]} fontSize={1} color="#228B22" anchorX="center">
        🌱 Eco Village
      </Text>
      <Text position={[0, 7, 0]} fontSize={0.5} color="#333" anchorX="center">
        Eco Score: {ecoScore}
      </Text>
      
      <OrbitControls enablePan minDistance={10} maxDistance={35} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="dawn" />
    </>
  );
};

const BUILDING_TYPES: { type: EcoBuilding['type']; label: string; points: number; colors: string[] }[] = [
  { type: 'solar-house', label: '🏠 Solar House', points: 50, colors: ['#E8D5B7', '#F5DEB3', '#DEB887'] },
  { type: 'wind-turbine', label: '💨 Wind Turbine', points: 80, colors: ['#4169E1', '#32CD32', '#FF6347'] },
  { type: 'garden', label: '🌻 Garden', points: 30, colors: ['#FF6B6B', '#FFD700', '#FF69B4'] },
  { type: 'recycling-center', label: '♻️ Recycling', points: 70, colors: ['#87CEEB', '#98FB98', '#DDA0DD'] },
  { type: 'water-tank', label: '💧 Water Tank', points: 60, colors: ['#4169E1', '#1E90FF', '#00CED1'] },
  { type: 'tree', label: '🌳 Tree', points: 25, colors: ['#228B22', '#32CD32', '#006400'] },
];

const EcoVillage3D: React.FC<EcoVillage3DProps> = ({
  level = 1,
  onLevelComplete,
  onBack
}) => {
  const [buildings, setBuildings] = useState<EcoBuilding[]>([]);
  const [ecoScore, setEcoScore] = useState(0);
  const buildingIdRef = useRef(0);
  const targetScore = level * 250;

  const handleAddBuilding = (type: EcoBuilding['type']) => {
    const buildingType = BUILDING_TYPES.find(t => t.type === type)!;
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 10;
    
    const newBuilding: EcoBuilding = {
      id: `building-${buildingIdRef.current++}`,
      type,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      color: buildingType.colors[Math.floor(Math.random() * buildingType.colors.length)]
    };
    
    setBuildings(prev => [...prev, newBuilding]);
    const newScore = ecoScore + buildingType.points;
    setEcoScore(newScore);
    
    if (newScore >= targetScore) {
      setTimeout(() => {
        onLevelComplete?.(newScore, Math.floor(newScore / 40));
      }, 500);
    }
  };

  const handleReset = () => {
    setBuildings([]);
    setEcoScore(0);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 via-emerald-300 to-green-500">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-green-900">
            <Leaf className="w-5 h-5 inline mr-2" />
            Level {level} | Target: {targetScore}
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-green-900">
            Eco Score: {ecoScore}
          </div>
        </div>
        
        <Button variant="ghost" onClick={handleReset} className="text-white hover:bg-white/20">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/30 backdrop-blur-sm rounded-2xl p-3">
        {BUILDING_TYPES.map((building) => (
          <button
            key={building.type}
            onClick={() => handleAddBuilding(building.type)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/40 transition-colors text-green-900"
          >
            <span className="text-xl">{building.label.split(' ')[0]}</span>
            <span className="text-xs font-medium">+{building.points}</span>
          </button>
        ))}
      </div>

      <Canvas camera={{ position: [18, 15, 18], fov: 50 }} shadows>
        <GameScene buildings={buildings} ecoScore={ecoScore} />
      </Canvas>
    </div>
  );
};

export default EcoVillage3D;
