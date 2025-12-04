import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment, Float, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Fish, Anchor, Shell } from "lucide-react";

interface OceanExplorer3DProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: (score: number, stars: number) => void;
  onBack?: () => void;
}

interface SeaCreature {
  id: number;
  type: 'fish' | 'jellyfish' | 'turtle' | 'seahorse' | 'crab';
  position: [number, number, number];
  collected: boolean;
  points: number;
  color: string;
}

function Fish3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 2 + position[1]) * 0.3;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  if (collected) return null;

  return (
    <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Fish body */}
      <mesh scale={hovered ? 1.2 : 1}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <MeshWobbleMaterial color={color} factor={0.3} speed={2} />
      </mesh>
      {/* Fish tail */}
      <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.2, 0.3, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Fish eye */}
      <mesh position={[0.15, 0.1, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
}

function Jellyfish3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.4;
      ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
        {/* Jellyfish dome */}
        <mesh>
          <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} />
        </mesh>
        {/* Tentacles */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.2, -0.3 - i * 0.1, Math.sin(i * Math.PI / 2) * 0.2]}>
            <cylinderGeometry args={[0.02, 0.01, 0.5, 8]} />
            <meshStandardMaterial color={color} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Turtle3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  if (collected) return null;

  return (
    <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
      {/* Shell */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Body underneath */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.5]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Head */}
      <mesh position={[0.4, 0, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Flippers */}
      {[[-0.2, -0.1, 0.3], [-0.2, -0.1, -0.3], [0.2, -0.1, 0.3], [0.2, -0.1, -0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.15, 0.05, 0.1]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      ))}
    </group>
  );
}

function Seahorse3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <Float speed={3} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
        {/* Body */}
        <mesh>
          <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Head */}
        <mesh position={[0.15, 0.35, 0]} rotation={[0, 0, -0.5]}>
          <capsuleGeometry args={[0.08, 0.15, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Snout */}
        <mesh position={[0.3, 0.4, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.03, 0.02, 0.15, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Tail curl */}
        <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0.5]}>
          <torusGeometry args={[0.1, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </Float>
  );
}

function Crab3D({ position, color, collected, onClick }: { position: [number, number, number]; color: string; collected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  if (collected) return null;

  return (
    <group ref={ref} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.2 : 1}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.5, 0.2, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Claws */}
      <mesh position={[0.35, 0.1, 0.25]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.35, 0.1, -0.25]} rotation={[0, -0.5, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.15, 0.2, 0.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.15, 0.2, -0.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

function Bubbles() {
  const bubblesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, i) => {
        bubble.position.y += 0.02;
        if (bubble.position.y > 5) bubble.position.y = -3;
        bubble.position.x += Math.sin(state.clock.elapsedTime + i) * 0.005;
      });
    }
  });

  return (
    <group ref={bubblesRef}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[Math.random() * 10 - 5, Math.random() * 8 - 4, Math.random() * 4 - 2]}>
          <sphereGeometry args={[0.05 + Math.random() * 0.05, 8, 8]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function OceanFloor() {
  return (
    <group position={[0, -3, 0]}>
      {/* Sandy bottom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#C2B280" />
      </mesh>
      {/* Coral decorations */}
      {[[-3, 0, -2], [2, 0, 1], [-1, 0, 2], [4, 0, -1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <coneGeometry args={[0.3, 0.8, 6]} />
          <meshStandardMaterial color={['#FF6B6B', '#FF8E53', '#FFA07A', '#FF7F50'][i]} />
        </mesh>
      ))}
      {/* Seaweed */}
      {[[-4, 0.5, 0], [3, 0.5, -2], [0, 0.5, 3]].map((pos, i) => (
        <mesh key={`seaweed-${i}`} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.05, 0.08, 1.5, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
    </group>
  );
}

function GameScene({ creatures, onCollect, score, targetScore }: { creatures: SeaCreature[]; onCollect: (id: number) => void; score: number; targetScore: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} color="#87CEEB" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00CED1" />
      
      {/* Ocean background */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#006994" />
      </mesh>
      
      <OceanFloor />
      <Bubbles />
      
      {creatures.map((creature) => {
        const props = {
          key: creature.id,
          position: creature.position,
          color: creature.color,
          collected: creature.collected,
          onClick: () => onCollect(creature.id),
        };
        
        switch (creature.type) {
          case 'fish': return <Fish3D {...props} />;
          case 'jellyfish': return <Jellyfish3D {...props} />;
          case 'turtle': return <Turtle3D {...props} />;
          case 'seahorse': return <Seahorse3D {...props} />;
          case 'crab': return <Crab3D {...props} />;
          default: return <Fish3D {...props} />;
        }
      })}
      
      {/* Score display */}
      <Text position={[0, 3.5, 0]} fontSize={0.4} color="#FFD700" anchorX="center">
        {`🐚 ${score} / ${targetScore}`}
      </Text>
      
      <OrbitControls enablePan={false} minDistance={5} maxDistance={12} maxPolarAngle={Math.PI / 2} />
      <Environment preset="sunset" />
    </>
  );
}

export function OceanExplorer3D({ level = 1, difficultyMultiplier = 1, onLevelComplete, onBack }: OceanExplorer3DProps) {
  const [creatures, setCreatures] = useState<SeaCreature[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const creatureTypes: Array<SeaCreature['type']> = ['fish', 'jellyfish', 'turtle', 'seahorse', 'crab'];
  const creatureColors: Record<SeaCreature['type'], string[]> = {
    fish: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
    jellyfish: ['#DDA0DD', '#FF69B4', '#BA55D3', '#9370DB'],
    turtle: ['#2E8B57', '#3CB371', '#228B22'],
    seahorse: ['#FF8C00', '#FFD700', '#FFA500'],
    crab: ['#DC143C', '#FF4500', '#FF6347'],
  };

  const creatureCount = Math.min(6 + level * 2, 15);
  const targetScore = Math.floor(creatureCount * 8 * difficultyMultiplier);

  const initGame = () => {
    const newCreatures: SeaCreature[] = [];
    for (let i = 0; i < creatureCount; i++) {
      const type = creatureTypes[Math.floor(Math.random() * creatureTypes.length)];
      const colors = creatureColors[type];
      newCreatures.push({
        id: i,
        type,
        position: [
          Math.random() * 8 - 4,
          Math.random() * 4 - 1,
          Math.random() * 2 - 1,
        ],
        collected: false,
        points: type === 'turtle' ? 20 : type === 'seahorse' ? 15 : 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setCreatures(newCreatures);
    setScore(0);
    setGameOver(false);
    setTimeLeft(60);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, timeLeft]);

  useEffect(() => {
    if (score >= targetScore && !gameOver) {
      setGameOver(true);
      const stars = score >= targetScore * 1.5 ? 3 : score >= targetScore * 1.2 ? 2 : 1;
      onLevelComplete?.(score, stars);
    }
  }, [score, targetScore, gameOver, onLevelComplete]);

  const handleCollect = (id: number) => {
    if (gameOver) return;
    
    setCreatures((prev) =>
      prev.map((c) => (c.id === id ? { ...c, collected: true } : c))
    );
    
    const creature = creatures.find((c) => c.id === id);
    if (creature) {
      setScore((prev) => prev + creature.points);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-cyan-400 to-blue-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white/20 backdrop-blur-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex gap-4">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold">
            ⏱️ {timeLeft}s
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold">
            🐚 {score}/{targetScore}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={initGame} className="bg-white/20 backdrop-blur-sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <GameScene creatures={creatures} onCollect={handleCollect} score={score} targetScore={targetScore} />
      </Canvas>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">{score >= targetScore ? '🎉' : '🌊'}</div>
            <h2 className="text-2xl font-bold mb-2">
              {score >= targetScore ? 'Ocean Mastered!' : 'Time\'s Up!'}
            </h2>
            <p className="text-gray-600 mb-4">You collected {score} points!</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={initGame} className="bg-cyan-500 hover:bg-cyan-600">
                <RotateCcw className="w-4 h-4 mr-2" /> Play Again
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back to Menu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
