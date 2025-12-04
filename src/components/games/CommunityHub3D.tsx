import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, OrbitControls, useProgress, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface CommunityHub3DProps {
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

interface Facility {
  id: string;
  type: 'meeting' | 'sports' | 'garden' | 'market' | 'art' | 'cafe';
  position: [number, number, number];
  happiness: number;
}

const FACILITY_COLORS: Record<string, string> = {
  meeting: '#6366f1', sports: '#ef4444', garden: '#22c55e', market: '#f59e0b', art: '#ec4899', cafe: '#8b5cf6'
};

function MeetingHall({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[2.5, 2, 2]} radius={0.1} position={[0, 1, 0]}>
        <meshStandardMaterial color="#6366f1" />
      </RoundedBox>
      <mesh position={[0, 2.3, 0]}>
        <coneGeometry args={[1.5, 1, 4]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      <Text position={[0, 3.5, 0]} fontSize={0.25} color="#312e81">🏛️ Meeting Hall</Text>
    </group>
  );
}

function SportsCourt({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.4, 0.05, 8, 16]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <mesh position={[0, 1.5, 0.5]}>
        <boxGeometry args={[0.8, 0.05, 0.05]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <Text position={[0, 2.5, 0]} fontSize={0.25} color="#991b1b">🏀 Sports Court</Text>
    </group>
  );
}

function CommunityGarden({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <boxGeometry args={[2.5, 2, 0.1]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>
      {[[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6], [0, 0]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 4]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color={['#ef4444', '#f59e0b', '#ec4899', '#a855f7', '#fbbf24'][i]} />
          </mesh>
        </group>
      ))}
      <Text position={[0, 1.5, 0]} fontSize={0.25} color="#166534">🌻 Garden</Text>
    </group>
  );
}

function FarmersMarket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[1.5, 1, 4]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      {[[-0.5, 0], [0.5, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.6, z]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      ))}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.5, 0.8, 0.8]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.25} color="#92400e">🛒 Market</Text>
    </group>
  );
}

function ArtStudio({ position }: { position: [number, number, number] }) {
  const paletteRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (paletteRef.current) {
      paletteRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  return (
    <group position={position}>
      <RoundedBox args={[2, 1.8, 1.5]} radius={0.1} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#ec4899" />
      </RoundedBox>
      <mesh ref={paletteRef} position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#9d174d">🎨 Art Studio</Text>
    </group>
  );
}

function CommunityCafe({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[2, 1.5, 1.5]} radius={0.1} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#8b5cf6" />
      </RoundedBox>
      <mesh position={[0, 1.8, 0.5]}>
        <boxGeometry args={[0.8, 0.6, 0.1]} />
        <meshStandardMaterial color="#c4b5fd" />
      </mesh>
      <Text position={[0, 2.3, 0]} fontSize={0.25} color="#5b21b6">☕ Cafe</Text>
    </group>
  );
}

function FacilityModel({ type, position }: { type: string; position: [number, number, number] }) {
  switch (type) {
    case 'meeting': return <MeetingHall position={position} />;
    case 'sports': return <SportsCourt position={position} />;
    case 'garden': return <CommunityGarden position={position} />;
    case 'market': return <FarmersMarket position={position} />;
    case 'art': return <ArtStudio position={position} />;
    case 'cafe': return <CommunityCafe position={position} />;
    default: return null;
  }
}

function Person({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime + position[2]) * 2;
      ref.current.position.z = position[2] + Math.cos(state.clock.elapsedTime + position[0]) * 2;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
    </group>
  );
}

function GameScene({ facilities, communityHappiness }: { facilities: Facility[]; communityHappiness: number }) {
  const peopleCount = Math.min(facilities.length * 2, 10);
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#d1fae5" />
      </mesh>
      {/* Central plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      {facilities.map(f => <FacilityModel key={f.id} type={f.type} position={f.position} />)}
      {/* Community members */}
      {[...Array(peopleCount)].map((_, i) => (
        <Person key={i} position={[Math.cos(i) * 5, 0, Math.sin(i) * 5]} />
      ))}
      <Text position={[0, 6, 0]} fontSize={0.5} color="#6366f1">🏘️ Community: {communityHappiness}%</Text>
      <OrbitControls enablePan={false} minDistance={10} maxDistance={25} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="park" />
    </>
  );
}

const FACILITY_TYPES: Facility['type'][] = ['meeting', 'sports', 'garden', 'market', 'art', 'cafe'];
const FACILITY_POINTS: Record<string, number> = { meeting: 15, sports: 12, garden: 10, market: 14, art: 11, cafe: 13 };
const FACILITY_EMOJIS: Record<string, string> = { meeting: '🏛️', sports: '🏀', garden: '🌻', market: '🛒', art: '🎨', cafe: '☕' };

export default function CommunityHub3D({ level = 1, onLevelComplete, onBack }: CommunityHub3DProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedType, setSelectedType] = useState<Facility['type']>('meeting');
  const [communityHappiness, setCommunityHappiness] = useState(0);
  const targetHappiness = 75 + level * 5;
  const nextId = useRef(0);

  const getPosition = (): [number, number, number] => {
    const index = facilities.length;
    const angle = (index / 6) * Math.PI * 2;
    const radius = 6 + Math.floor(index / 6) * 4;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  };

  const handleBuild = () => {
    const newFacility: Facility = {
      id: `facility-${nextId.current++}`,
      type: selectedType,
      position: getPosition(),
      happiness: FACILITY_POINTS[selectedType]
    };
    setFacilities(prev => [...prev, newFacility]);
    setCommunityHappiness(prev => Math.min(100, prev + FACILITY_POINTS[selectedType]));
  };

  React.useEffect(() => {
    if (communityHappiness >= targetHappiness && onLevelComplete) {
      onLevelComplete(communityHappiness * 10, Math.floor(communityHappiness / 5));
    }
  }, [communityHappiness, targetHappiness, onLevelComplete]);

  const resetGame = () => {
    setFacilities([]);
    setCommunityHappiness(0);
    nextId.current = 0;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-300 to-pink-300">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <span className="bg-purple-600/80 text-white rounded-full px-4 py-2 font-bold">Level {level}</span>
          <span className="bg-pink-500/80 text-white rounded-full px-4 py-2 font-bold">🏘️ {communityHappiness}%/{targetHappiness}%</span>
        </div>
        <Button variant="outline" size="sm" onClick={resetGame} className="bg-white/80"><RotateCcw className="w-4 h-4" /></Button>
      </div>
      <Canvas camera={{ position: [0, 12, 18], fov: 50 }} shadows>
        <React.Suspense fallback={<Loader />}>
          <GameScene facilities={facilities} communityHappiness={communityHappiness} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {FACILITY_TYPES.map(type => (
            <Button key={type} size="sm" onClick={() => setSelectedType(type)}
              className={`${selectedType === type ? 'ring-2 ring-yellow-400 scale-110' : ''}`}
              style={{ backgroundColor: FACILITY_COLORS[type], color: 'white' }}>
              {FACILITY_EMOJIS[type]}
            </Button>
          ))}
        </div>
        <Button size="lg" onClick={handleBuild} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
          Build {selectedType} (+{FACILITY_POINTS[selectedType]}%)
        </Button>
      </div>
      {communityHappiness >= targetHappiness && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-purple-600 mb-4">🏘️ Community Thriving!</h2>
            <p className="text-yellow-500 font-bold mb-4">+{Math.floor(communityHappiness / 5)} coins</p>
            <Button onClick={onBack} className="bg-purple-600">Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
