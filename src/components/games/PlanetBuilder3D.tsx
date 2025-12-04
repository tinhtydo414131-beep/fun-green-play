import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface PlanetBuilder3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface PlanetFeature {
  id: number;
  type: 'mountain' | 'ocean' | 'forest' | 'city' | 'cloud' | 'ring';
  position: [number, number, number];
  color: string;
  scale: number;
}

function Planet({ features, rotation }: { features: PlanetFeature[]; rotation: number }) {
  const planetRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={planetRef}>
      {/* Planet core */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#4A90D9" />
      </mesh>
      
      {/* Features on planet surface */}
      {features.map((feature) => {
        switch (feature.type) {
          case 'mountain':
            return (
              <mesh key={feature.id} position={feature.position} scale={feature.scale}>
                <coneGeometry args={[0.3, 0.5, 6]} />
                <meshStandardMaterial color={feature.color} />
              </mesh>
            );
          case 'ocean':
            return (
              <mesh key={feature.id} position={feature.position} scale={feature.scale}>
                <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={feature.color} transparent opacity={0.7} />
              </mesh>
            );
          case 'forest':
            return (
              <group key={feature.id} position={feature.position} scale={feature.scale}>
                {[0, 0.2, -0.2].map((x, i) => (
                  <mesh key={i} position={[x, 0, i * 0.1]}>
                    <coneGeometry args={[0.15, 0.4, 8]} />
                    <meshStandardMaterial color={feature.color} />
                  </mesh>
                ))}
              </group>
            );
          case 'city':
            return (
              <group key={feature.id} position={feature.position} scale={feature.scale}>
                {[[-0.1, 0.15], [0.1, 0.2], [0, 0.25]].map(([x, h], i) => (
                  <mesh key={i} position={[x, h / 2, 0]}>
                    <boxGeometry args={[0.1, h, 0.1]} />
                    <meshStandardMaterial color={feature.color} emissive={feature.color} emissiveIntensity={0.3} />
                  </mesh>
                ))}
              </group>
            );
          case 'cloud':
            return (
              <Float key={feature.id} speed={2} floatIntensity={0.3}>
                <group position={feature.position} scale={feature.scale}>
                  <mesh>
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshStandardMaterial color="white" transparent opacity={0.8} />
                  </mesh>
                  <mesh position={[0.15, 0, 0]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshStandardMaterial color="white" transparent opacity={0.8} />
                  </mesh>
                </group>
              </Float>
            );
          case 'ring':
            return (
              <mesh key={feature.id} rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[3, 0.2, 8, 64]} />
                <meshStandardMaterial color={feature.color} transparent opacity={0.6} />
              </mesh>
            );
          default:
            return null;
        }
      })}
    </group>
  );
}

function Moon({ orbitRadius, speed, size, color }: { orbitRadius: number; speed: number; size: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.position.x = Math.cos(t) * orbitRadius;
      ref.current.position.z = Math.sin(t) * orbitRadius;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function GameScene({ features, onAddFeature, score, targetScore, moons }: { 
  features: PlanetFeature[]; 
  onAddFeature: (type: PlanetFeature['type']) => void;
  score: number;
  targetScore: number;
  moons: Array<{ orbitRadius: number; speed: number; size: number; color: string }>;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#FFD700" />
      
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      
      <Planet features={features} rotation={0} />
      
      {moons.map((moon, i) => (
        <Moon key={i} {...moon} />
      ))}
      
      <Text position={[0, 4, 0]} fontSize={0.4} color="#FFD700" anchorX="center">
        {`🪐 ${score} / ${targetScore}`}
      </Text>
      
      <OrbitControls enablePan={false} minDistance={5} maxDistance={15} />
      <Environment preset="night" />
    </>
  );
}

const featureTypes: Array<{ type: PlanetFeature['type']; label: string; points: number; colors: string[] }> = [
  { type: 'mountain', label: '🏔️ Mountain', points: 15, colors: ['#8B4513', '#A0522D', '#6B4423'] },
  { type: 'ocean', label: '🌊 Ocean', points: 20, colors: ['#006994', '#4169E1', '#00CED1'] },
  { type: 'forest', label: '🌲 Forest', points: 15, colors: ['#228B22', '#006400', '#32CD32'] },
  { type: 'city', label: '🏙️ City', points: 25, colors: ['#FFD700', '#FFA500', '#FF6347'] },
  { type: 'cloud', label: '☁️ Cloud', points: 10, colors: ['#FFFFFF', '#F0F8FF'] },
  { type: 'ring', label: '💫 Ring', points: 30, colors: ['#DDA0DD', '#9370DB', '#FFD700'] },
];

export function PlanetBuilder3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: PlanetBuilder3DProps) {
  const [features, setFeatures] = useState<PlanetFeature[]>([]);
  const [score, setScore] = useState(0);
  const [moons, setMoons] = useState<Array<{ orbitRadius: number; speed: number; size: number; color: string }>>([]);
  const featureIdRef = useRef(0);

  const targetScore = Math.floor(150 * level * difficultyMultiplier);

  useEffect(() => {
    // Add initial moons based on level
    const initialMoons = [];
    for (let i = 0; i < Math.min(level, 3); i++) {
      initialMoons.push({
        orbitRadius: 4 + i * 1.5,
        speed: 0.5 - i * 0.1,
        size: 0.3 - i * 0.05,
        color: ['#C0C0C0', '#FFD700', '#FF6347'][i],
      });
    }
    setMoons(initialMoons);
  }, [level]);

  const handleAddFeature = (type: PlanetFeature['type']) => {
    const featureConfig = featureTypes.find(f => f.type === type);
    if (!featureConfig) return;

    // Random position on planet surface
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = type === 'cloud' ? 2.5 : type === 'ring' ? 0 : 2;
    
    const position: [number, number, number] = type === 'ring' 
      ? [0, 0, 0]
      : [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta),
        ];

    const newFeature: PlanetFeature = {
      id: featureIdRef.current++,
      type,
      position,
      color: featureConfig.colors[Math.floor(Math.random() * featureConfig.colors.length)],
      scale: 0.8 + Math.random() * 0.4,
    };

    setFeatures(prev => [...prev, newFeature]);
    
    const newScore = score + featureConfig.points;
    setScore(newScore);

    if (newScore >= targetScore) {
      const stars = newScore >= targetScore * 1.5 ? 3 : newScore >= targetScore * 1.2 ? 2 : 1;
      onLevelComplete?.(newScore, stars);
    }
  };

  const handleReset = () => {
    setFeatures([]);
    setScore(0);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-yellow-300">
          🪐 {score}/{targetScore}
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full">
        {featureTypes.map((feature) => (
          <button
            key={feature.type}
            onClick={() => handleAddFeature(feature.type)}
            className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all hover:scale-110"
          >
            {feature.label}
          </button>
        ))}
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <GameScene features={features} onAddFeature={handleAddFeature} score={score} targetScore={targetScore} moons={moons} />
      </Canvas>
    </div>
  );
}
