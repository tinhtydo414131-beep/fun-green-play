import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface FlowerField3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface Flower {
  id: number;
  type: 'tulip' | 'daisy' | 'rose' | 'sunflower' | 'lavender';
  position: [number, number, number];
  color: string;
  collected: boolean;
  points: number;
}

function Tulip3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
        {/* Stem */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* Leaves */}
        <mesh position={[0.1, 0.2, 0]} rotation={[0, 0, 0.3]}>
          <sphereGeometry args={[0.08, 8, 4]} />
          <meshStandardMaterial color="#32CD32" />
        </mesh>
        {/* Tulip petals */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 3) * 0.08,
              0.85 + Math.abs(Math.cos((i * Math.PI) / 3)) * 0.05,
              Math.sin((i * Math.PI) / 3) * 0.08,
            ]}
            rotation={[0.3, (i * Math.PI) / 3, 0]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Daisy3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  if (collected) return null;

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.7, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* White petals */}
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 5) * 0.15,
              0.75,
              Math.sin((i * Math.PI) / 5) * 0.15,
            ]}
            rotation={[0.4, (i * Math.PI) / 5, 0]}
          >
            <capsuleGeometry args={[0.03, 0.1, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
        {/* Yellow center */}
        <mesh position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </group>
    </Float>
  );
}

function Rose3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      ref.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
    }
  });

  if (collected) return null;

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* Thorns */}
        {[0.2, 0.35, 0.5].map((y, i) => (
          <mesh key={i} position={[0.05, y, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.015, 0.04, 4]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        ))}
        {/* Rose petals (layered) */}
        {[0.12, 0.09, 0.06, 0.03].map((size, layer) => (
          Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={`${layer}-${i}`}
              position={[
                Math.cos((i * Math.PI * 2) / 5 + layer * 0.3) * size,
                0.85 + layer * 0.03,
                Math.sin((i * Math.PI * 2) / 5 + layer * 0.3) * size,
              ]}
              rotation={[0.3, (i * Math.PI * 2) / 5, layer * 0.2]}
            >
              <sphereGeometry args={[0.06 - layer * 0.01, 8, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))
        ))}
      </group>
    </Float>
  );
}

function Sunflower3DField({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.15}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.15 : 1}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* Large leaves */}
        <mesh position={[0.2, 0.4, 0]} rotation={[0, 0, 0.6]}>
          <sphereGeometry args={[0.12, 8, 4]} />
          <meshStandardMaterial color="#32CD32" />
        </mesh>
        <mesh position={[-0.15, 0.25, 0.1]} rotation={[0.3, 0, -0.5]}>
          <sphereGeometry args={[0.1, 8, 4]} />
          <meshStandardMaterial color="#32CD32" />
        </mesh>
        {/* Sunflower petals */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 7) * 0.25,
              1.25,
              Math.sin((i * Math.PI) / 7) * 0.25,
            ]}
            rotation={[0.4, (i * Math.PI) / 7, 0]}
          >
            <capsuleGeometry args={[0.05, 0.12, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
        {/* Brown center */}
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>
    </Float>
  );
}

function Lavender3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
    }
  });

  if (collected) return null;

  return (
    <Float speed={3} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
        {/* Multiple stems */}
        {[-0.05, 0, 0.05].map((x, si) => (
          <group key={si} position={[x, 0, 0]}>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.015, 0.02, 0.9, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* Lavender buds */}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[0, 0.7 + i * 0.06, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color={color} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </Float>
  );
}

function FieldGround() {
  return (
    <group>
      {/* Grass field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>
      {/* Rolling hills effect */}
      {[[-5, 0.3, -6], [6, 0.4, -4], [-4, 0.35, 5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#90EE90" />
        </mesh>
      ))}
    </group>
  );
}

function Bee({ startPos }: { startPos: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.position.x = startPos[0] + Math.sin(t * 0.8) * 3;
      ref.current.position.y = startPos[1] + Math.sin(t * 2) * 0.5;
      ref.current.position.z = startPos[2] + Math.cos(t * 0.6) * 3;
      ref.current.rotation.y = t * 2;
    }
  });

  return (
    <group ref={ref} position={startPos} scale={0.3}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.15, 0.3, 8, 16]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Stripes */}
      {[-0.1, 0, 0.1].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.16, 0.03, 8, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
      {/* Wings */}
      <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, 0.3]}>
        <circleGeometry args={[0.2, 8]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, -0.3]}>
        <circleGeometry args={[0.2, 8]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function GameScene({ flowers, onCollect, score, targetScore }: { flowers: Flower[]; onCollect: (id: number) => void; score: number; targetScore: number }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1} color="#FFF8DC" />
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#FFD700" />
      
      <FieldGround />
      
      {flowers.map((flower) => {
        const props = {
          key: flower.id,
          position: flower.position,
          color: flower.color,
          collected: flower.collected,
          onClick: () => onCollect(flower.id),
        };
        
        switch (flower.type) {
          case 'tulip': return <Tulip3D {...props} />;
          case 'daisy': return <Daisy3D {...props} />;
          case 'rose': return <Rose3D {...props} />;
          case 'sunflower': return <Sunflower3DField {...props} />;
          case 'lavender': return <Lavender3D {...props} />;
          default: return <Tulip3D {...props} />;
        }
      })}
      
      {/* Bees */}
      <Bee startPos={[2, 1.5, 1]} />
      <Bee startPos={[-2, 1.2, -1]} />
      
      {/* Sparkles */}
      <Sparkles count={30} scale={10} size={2} speed={0.3} color="#FFD700" />
      
      <Text position={[0, 4, 0]} fontSize={0.4} color="#FF69B4" anchorX="center">
        {`🌸 ${score} / ${targetScore}`}
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={15} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="park" />
    </>
  );
}

export function FlowerField3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: FlowerField3DProps) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const flowerTypes: Array<Flower['type']> = ['tulip', 'daisy', 'rose', 'sunflower', 'lavender'];
  const flowerColors: Record<Flower['type'], string[]> = {
    tulip: ['#FF6B6B', '#FF69B4', '#FFD700', '#FF4500', '#9370DB'],
    daisy: ['#FFFFFF', '#FFF8DC', '#FFFACD'],
    rose: ['#FF0000', '#FF1493', '#FFB6C1', '#DC143C'],
    sunflower: ['#FFD700', '#FFA500', '#FF8C00'],
    lavender: ['#E6E6FA', '#9370DB', '#8A2BE2'],
  };

  const flowerCount = Math.min(8 + level * 3, 20);
  const targetScore = Math.floor(flowerCount * 12 * difficultyMultiplier);

  const initGame = () => {
    const newFlowers: Flower[] = [];
    for (let i = 0; i < flowerCount; i++) {
      const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
      const colors = flowerColors[type];
      newFlowers.push({
        id: i,
        type,
        position: [
          Math.random() * 10 - 5,
          0,
          Math.random() * 10 - 5,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        collected: false,
        points: type === 'rose' ? 20 : type === 'sunflower' ? 15 : 10,
      });
    }
    setFlowers(newFlowers);
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
    
    setFlowers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, collected: true } : f))
    );
    
    const flower = flowers.find((f) => f.id === id);
    if (flower) {
      setScore((prev) => prev + flower.points);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80 backdrop-blur-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-pink-600">
          🌸 {score}/{targetScore}
        </div>
        <Button variant="outline" size="sm" onClick={initGame} className="bg-white/80 backdrop-blur-sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
        <GameScene flowers={flowers} onCollect={handleCollect} score={score} targetScore={targetScore} />
      </Canvas>

      {/* Game Complete */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🌻</div>
            <h2 className="text-2xl font-bold mb-2">Beautiful Bouquet!</h2>
            <p className="text-gray-600 mb-4">You collected {score} points!</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={initGame} className="bg-pink-500 hover:bg-pink-600">
                <RotateCcw className="w-4 h-4 mr-2" /> Play Again
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
