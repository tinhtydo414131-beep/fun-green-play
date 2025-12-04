import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Heart, Sparkles as SparklesIcon } from "lucide-react";

interface HappinessGarden3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface HappyPlant {
  id: number;
  type: 'sunflower' | 'rainbow_rose' | 'heart_flower' | 'star_bloom' | 'joy_tree';
  position: [number, number, number];
  growth: number;
  happiness: number;
  lastWatered: number;
}

function Sunflower3D({ position, growth, happiness }: { position: [number, number, number]; growth: number; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      ref.current.children.forEach((child, i) => {
        if (i > 0) child.rotation.z = Math.sin(state.clock.elapsedTime + i) * 0.05;
      });
    }
  });

  const scale = 0.3 + growth * 0.7;
  const glowIntensity = happiness / 100;

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={ref} position={position} scale={scale}>
        {/* Stem */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* Leaves */}
        <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, 0.5]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#32CD32" />
        </mesh>
        {/* Petals */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 6) * 0.25,
              1.1,
              Math.sin((i * Math.PI) / 6) * 0.25,
            ]}
            rotation={[0.3, (i * Math.PI) / 6, 0]}
          >
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={glowIntensity * 0.3} />
          </mesh>
        ))}
        {/* Center */}
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Happy face */}
        {happiness > 50 && (
          <group position={[0, 1.1, 0.16]}>
            <mesh position={[-0.04, 0.02, 0]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#000" />
            </mesh>
            <mesh position={[0.04, 0.02, 0]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#000" />
            </mesh>
          </group>
        )}
      </group>
    </Float>
  );
}

function RainbowRose3D({ position, growth, happiness }: { position: [number, number, number]; growth: number; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'];
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const scale = 0.3 + growth * 0.7;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref} position={position} scale={scale}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {rainbowColors.map((color, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 3) * (0.1 + i * 0.02),
              0.85 + i * 0.03,
              Math.sin((i * Math.PI) / 3) * (0.1 + i * 0.02),
            ]}
            rotation={[0.4, (i * Math.PI) / 3, 0]}
          >
            <sphereGeometry args={[0.08 - i * 0.005, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={happiness / 300} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function HeartFlower3D({ position, growth, happiness }: { position: [number, number, number]; growth: number; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const scale = 0.3 + growth * 0.7;

  return (
    <Float speed={3} rotationIntensity={0.1} floatIntensity={0.4}>
      <group ref={ref} position={position} scale={scale}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.7, 8]} />
          <meshStandardMaterial color="#FF69B4" />
        </mesh>
        {/* Heart shape using spheres */}
        <mesh position={[-0.08, 0.85, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={happiness / 200} />
        </mesh>
        <mesh position={[0.08, 0.85, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={happiness / 200} />
        </mesh>
        <mesh position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.15, 0.15, 0.1]} />
          <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={happiness / 200} />
        </mesh>
      </group>
    </Float>
  );
}

function StarBloom3D({ position, growth, happiness }: { position: [number, number, number]; growth: number; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const scale = 0.3 + growth * 0.7;

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={ref} position={position} scale={scale}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
        {/* Star points */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI * 2) / 5) * 0.2,
              0.9,
              Math.sin((i * Math.PI * 2) / 5) * 0.2,
            ]}
            rotation={[0, (i * Math.PI * 2) / 5, 0.5]}
          >
            <coneGeometry args={[0.08, 0.2, 4]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={happiness / 150} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#FFF8DC" emissive="#FFD700" emissiveIntensity={happiness / 100} />
        </mesh>
      </group>
    </Float>
  );
}

function JoyTree3D({ position, growth, happiness }: { position: [number, number, number]; growth: number; happiness: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.children.slice(1).forEach((child, i) => {
        child.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1;
      });
    }
  });

  const scale = 0.4 + growth * 0.8;
  const fruitColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Foliage layers */}
      {[0, 0.4, 0.8].map((y, i) => (
        <mesh key={i} position={[0, 1.3 + y, 0]}>
          <sphereGeometry args={[0.5 - i * 0.1, 16, 16]} />
          <meshStandardMaterial color="#32CD32" emissive="#32CD32" emissiveIntensity={happiness / 400} />
        </mesh>
      ))}
      {/* Happy fruits */}
      {happiness > 30 && fruitColors.slice(0, Math.floor(happiness / 25)).map((color, i) => (
        <Float key={i} speed={3} floatIntensity={0.2}>
          <mesh position={[Math.cos(i * 1.5) * 0.35, 1.2 + (i % 3) * 0.3, Math.sin(i * 1.5) * 0.35]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function GardenGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[6, 32]} />
      <meshStandardMaterial color="#90EE90" />
    </mesh>
  );
}

function WateringCan({ position, isWatering }: { position: [number, number, number]; isWatering: boolean }) {
  const dropsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (dropsRef.current && isWatering) {
      dropsRef.current.children.forEach((drop, i) => {
        drop.position.y -= 0.05;
        if (drop.position.y < 0) drop.position.y = 0.5;
      });
    }
  });

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 8]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      <mesh position={[0.25, 0.1, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.03, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      {isWatering && (
        <group ref={dropsRef} position={[0.35, 0, 0]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[Math.random() * 0.1, Math.random() * 0.5, Math.random() * 0.1]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function GameScene({ plants, onWaterPlant, totalHappiness }: { plants: HappyPlant[]; onWaterPlant: (id: number) => void; totalHappiness: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1} color="#FFF8DC" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFD700" />
      
      <GardenGround />
      
      {plants.map((plant) => {
        const props = { position: plant.position, growth: plant.growth, happiness: plant.happiness };
        const PlantComponent = {
          sunflower: Sunflower3D,
          rainbow_rose: RainbowRose3D,
          heart_flower: HeartFlower3D,
          star_bloom: StarBloom3D,
          joy_tree: JoyTree3D,
        }[plant.type];
        
        return (
          <group key={plant.id} onClick={() => onWaterPlant(plant.id)}>
            <PlantComponent {...props} />
          </group>
        );
      })}
      
      {/* Magical sparkles based on happiness */}
      {totalHappiness > 200 && (
        <Sparkles count={50} scale={8} size={3} speed={0.5} color="#FFD700" />
      )}
      
      <Text position={[0, 4, 0]} fontSize={0.5} color="#FF69B4" anchorX="center">
        {`💖 Happiness: ${totalHappiness}`}
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={15} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="sunset" />
    </>
  );
}

const plantTypes: Array<HappyPlant['type']> = ['sunflower', 'rainbow_rose', 'heart_flower', 'star_bloom', 'joy_tree'];

export function HappinessGarden3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: HappinessGarden3DProps) {
  const [plants, setPlants] = useState<HappyPlant[]>([]);
  const [totalHappiness, setTotalHappiness] = useState(0);

  const targetHappiness = Math.floor(300 * level * difficultyMultiplier);
  const plantCount = Math.min(3 + level, 8);

  const initGame = () => {
    const newPlants: HappyPlant[] = [];
    const radius = 3;
    
    for (let i = 0; i < plantCount; i++) {
      const angle = (i / plantCount) * Math.PI * 2;
      newPlants.push({
        id: i,
        type: plantTypes[i % plantTypes.length],
        position: [Math.cos(angle) * radius * 0.7, 0, Math.sin(angle) * radius * 0.7],
        growth: 0.3 + Math.random() * 0.3,
        happiness: 20 + Math.random() * 30,
        lastWatered: Date.now(),
      });
    }
    setPlants(newPlants);
    updateTotalHappiness(newPlants);
  };

  const updateTotalHappiness = (plantList: HappyPlant[]) => {
    const total = plantList.reduce((sum, p) => sum + p.happiness, 0);
    setTotalHappiness(Math.floor(total));
  };

  useEffect(() => {
    initGame();
  }, [level]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlants((prev) => {
        const updated = prev.map((plant) => ({
          ...plant,
          growth: Math.min(1, plant.growth + 0.01),
          happiness: Math.max(0, plant.happiness - 0.5),
        }));
        updateTotalHappiness(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (totalHappiness >= targetHappiness) {
      const stars = totalHappiness >= targetHappiness * 1.5 ? 3 : totalHappiness >= targetHappiness * 1.2 ? 2 : 1;
      onLevelComplete?.(totalHappiness, stars);
    }
  }, [totalHappiness, targetHappiness, onLevelComplete]);

  const handleWaterPlant = (id: number) => {
    setPlants((prev) => {
      const updated = prev.map((plant) =>
        plant.id === id
          ? {
              ...plant,
              happiness: Math.min(100, plant.happiness + 15),
              growth: Math.min(1, plant.growth + 0.05),
              lastWatered: Date.now(),
            }
          : plant
      );
      updateTotalHappiness(updated);
      return updated;
    });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-pink-200 via-purple-100 to-blue-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80 backdrop-blur-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex gap-3">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-pink-600">
            💖 {totalHappiness}/{targetHappiness}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={initGame} className="bg-white/80 backdrop-blur-sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
        💧 Click plants to water them and spread happiness!
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
        <GameScene plants={plants} onWaterPlant={handleWaterPlant} totalHappiness={totalHappiness} />
      </Canvas>
    </div>
  );
}
