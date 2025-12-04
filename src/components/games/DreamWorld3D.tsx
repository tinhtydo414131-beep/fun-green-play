import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  Float,
  Cloud,
  Stars,
  Sparkles
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface DreamWorld3DProps {
  level?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading 3D... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

function DreamPlayer({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (wingsRef.current) {
      wingsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 0.5, 4, 16]} />
        <meshStandardMaterial 
          color="#e879f9" 
          metalness={0.5} 
          roughness={0.3}
          emissive="#e879f9"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#fce7f3" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.08, 0.75, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#6366f1" />
      </mesh>
      <mesh position={[0.08, 0.75, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#6366f1" />
      </mesh>
      
      {/* Wings */}
      <group ref={wingsRef}>
        <mesh position={[-0.4, 0.2, -0.1]} rotation={[0, -0.3, 0.5]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial 
            color="#c4b5fd" 
            transparent 
            opacity={0.7}
            side={THREE.DoubleSide}
            emissive="#c4b5fd"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0.4, 0.2, -0.1]} rotation={[0, 0.3, -0.5]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial 
            color="#c4b5fd" 
            transparent 
            opacity={0.7}
            side={THREE.DoubleSide}
            emissive="#c4b5fd"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      <Sparkles count={10} scale={1.5} size={2} color="#fcd34d" />
      <pointLight color="#e879f9" intensity={0.5} distance={3} />
    </group>
  );
}

function DreamOrb({ 
  position, 
  collected,
  type = "dream"
}: { 
  position: [number, number, number]; 
  collected: boolean;
  type?: "dream" | "star" | "rainbow";
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  if (collected) return null;

  const configs = {
    dream: { color: "#a78bfa", size: 0.25 },
    star: { color: "#fcd34d", size: 0.3 },
    rainbow: { color: "#f472b6", size: 0.35 }
  };

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.8}>
      <group position={position}>
        <mesh ref={meshRef} castShadow>
          <icosahedronGeometry args={[configs[type].size, 0]} />
          <meshStandardMaterial 
            color={configs[type].color}
            metalness={0.8}
            roughness={0.1}
            emissive={configs[type].color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
        <pointLight color={configs[type].color} intensity={0.3} distance={2} />
        <Sparkles count={5} scale={0.8} size={2} color={configs[type].color} />
      </group>
    </Float>
  );
}

function Nightmare({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <mesh castShadow>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial 
          color="#1f1f1f"
          metalness={0.9}
          roughness={0.1}
          emissive="#7c3aed"
          emissiveIntensity={0.3}
        />
      </mesh>
      <pointLight color="#7c3aed" intensity={0.3} distance={2} />
    </group>
  );
}

function FloatingIsland({ position, size = 2 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position}>
      {/* Top grass */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[size, size * 0.8, 0.2, 16]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>
      {/* Bottom rock */}
      <mesh position={[0, -0.3, 0]}>
        <coneGeometry args={[size * 0.8, 0.8, 16]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </mesh>
    </group>
  );
}

function CameraRig({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.position.lerp(
      new THREE.Vector3(target[0], target[1] + 5, target[2] + 8),
      0.03
    );
    camera.lookAt(target[0], target[1], target[2]);
  });
  
  return null;
}

function GameScene({
  playerPos,
  orbs,
  nightmares,
  collectedOrbs,
}: {
  playerPos: [number, number, number];
  orbs: { pos: [number, number, number]; type: "dream" | "star" | "rainbow" }[];
  nightmares: [number, number, number][];
  collectedOrbs: number[];
}) {
  return (
    <>
      <CameraRig target={playerPos} />
      <Environment preset="night" background={false} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#c4b5fd" />
      
      <Stars radius={100} depth={50} count={3000} factor={4} fade />
      
      {/* Clouds */}
      <Cloud position={[-10, 5, -10]} speed={0.2} opacity={0.3} />
      <Cloud position={[10, 3, -15]} speed={0.3} opacity={0.2} />
      <Cloud position={[0, 8, -20]} speed={0.1} opacity={0.4} />
      
      {/* Floating islands */}
      <FloatingIsland position={[0, -2, 0]} size={3} />
      <FloatingIsland position={[-5, -1, -5]} size={1.5} />
      <FloatingIsland position={[5, -1.5, -3]} size={2} />
      <FloatingIsland position={[0, -1, -8]} size={1.8} />
      
      <DreamPlayer position={playerPos} />
      
      {orbs.map((orb, i) => (
        <DreamOrb 
          key={i} 
          position={orb.pos} 
          collected={collectedOrbs.includes(i)}
          type={orb.type}
        />
      ))}
      
      {nightmares.map((pos, i) => (
        <Nightmare key={i} position={pos} />
      ))}
      
      {/* Ambient sparkles */}
      <Sparkles count={100} scale={30} size={2} color="#c4b5fd" opacity={0.3} />
      
      <fog attach="fog" args={["#1e1b4b", 5, 30]} />
    </>
  );
}

export function DreamWorld3D({ level = 1, onLevelComplete, onBack }: DreamWorld3DProps) {
  const orbCount = 12 + level * 3;
  const nightmareCount = level * 2;
  const targetOrbs = Math.ceil(orbCount * 0.75);
  
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [orbs, setOrbs] = useState<{ pos: [number, number, number]; type: "dream" | "star" | "rainbow" }[]>([]);
  const [nightmares, setNightmares] = useState<[number, number, number][]>([]);
  const [collectedOrbs, setCollectedOrbs] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);

  const lastCollectTime = useRef(Date.now());

  const initializeGame = useCallback(() => {
    // Generate orbs
    const newOrbs: { pos: [number, number, number]; type: "dream" | "star" | "rainbow" }[] = [];
    for (let i = 0; i < orbCount; i++) {
      const type = Math.random() < 0.1 ? "rainbow" : Math.random() < 0.2 ? "star" : "dream";
      newOrbs.push({
        pos: [
          (Math.random() - 0.5) * 15,
          Math.random() * 3,
          (Math.random() - 0.5) * 15
        ],
        type
      });
    }
    setOrbs(newOrbs);
    
    // Generate nightmares
    const newNightmares: [number, number, number][] = [];
    for (let i = 0; i < nightmareCount; i++) {
      newNightmares.push([
        (Math.random() - 0.5) * 12,
        Math.random() * 2,
        (Math.random() - 0.5) * 12
      ]);
    }
    setNightmares(newNightmares);
    
    setPlayerPos([0, 0, 0]);
    setCollectedOrbs([]);
    setScore(0);
    setCoins(0);
    setCombo(0);
    setLives(3);
    setTimeLeft(90);
    setIsPlaying(true);
    setShowGameOver(false);
  }, [orbCount, nightmareCount]);

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsWin(collectedOrbs.length >= targetOrbs);
          setShowGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, collectedOrbs.length, targetOrbs]);

  // Check collisions
  useEffect(() => {
    if (!isPlaying) return;
    
    // Check orb collection
    orbs.forEach((orb, index) => {
      if (collectedOrbs.includes(index)) return;
      
      const dist = Math.sqrt(
        Math.pow(playerPos[0] - orb.pos[0], 2) +
        Math.pow(playerPos[1] - orb.pos[1], 2) +
        Math.pow(playerPos[2] - orb.pos[2], 2)
      );
      
      if (dist < 0.8) {
        haptics.success();
        setCollectedOrbs(prev => [...prev, index]);
        
        const now = Date.now();
        const timeSince = now - lastCollectTime.current;
        const newCombo = timeSince < 2000 ? combo + 1 : 1;
        setCombo(newCombo);
        lastCollectTime.current = now;
        
        const points = orb.type === "rainbow" ? 500 : orb.type === "star" ? 200 : 100;
        const earnedScore = points * newCombo;
        setScore(s => s + earnedScore);
        setCoins(c => c + earnedScore);
        
        if (collectedOrbs.length + 1 >= targetOrbs) {
          toast.success("🌟 Hoàn thành giấc mơ!");
          setIsWin(true);
          setShowGameOver(true);
          setIsPlaying(false);
          onLevelComplete?.();
        }
      }
    });
    
    // Check nightmare collision
    nightmares.forEach(nightmare => {
      const dist = Math.sqrt(
        Math.pow(playerPos[0] - nightmare[0], 2) +
        Math.pow(playerPos[1] - nightmare[1], 2) +
        Math.pow(playerPos[2] - nightmare[2], 2)
      );
      
      if (dist < 0.8) {
        haptics.error();
        if (lives > 1) {
          setLives(l => l - 1);
          setPlayerPos([0, 0, 0]);
          setCombo(0);
          toast.error(`👻 Ác mộng! Còn ${lives - 1} mạng`);
        } else {
          setIsWin(false);
          setShowGameOver(true);
          setIsPlaying(false);
        }
      }
    });
  }, [playerPos, orbs, nightmares, collectedOrbs, isPlaying, combo, lives, targetOrbs, onLevelComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      const speed = 0.4;
      
      switch (e.key) {
        case "ArrowUp": case "w": case "W":
          setPlayerPos(p => [p[0], p[1], p[2] - speed]);
          break;
        case "ArrowDown": case "s": case "S":
          setPlayerPos(p => [p[0], p[1], p[2] + speed]);
          break;
        case "ArrowLeft": case "a": case "A":
          setPlayerPos(p => [p[0] - speed, p[1], p[2]]);
          break;
        case "ArrowRight": case "d": case "D":
          setPlayerPos(p => [p[0] + speed, p[1], p[2]]);
          break;
        case " ":
          setPlayerPos(p => [p[0], Math.min(3, p[1] + 0.5), p[2]]);
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying]);

  const handleMove = (dir: "up" | "down" | "left" | "right" | "fly") => {
    if (!isPlaying) return;
    
    haptics.light();
    const speed = 0.4;
    
    switch (dir) {
      case "up":
        setPlayerPos(p => [p[0], p[1], p[2] - speed]);
        break;
      case "down":
        setPlayerPos(p => [p[0], p[1], p[2] + speed]);
        break;
      case "left":
        setPlayerPos(p => [p[0] - speed, p[1], p[2]]);
        break;
      case "right":
        setPlayerPos(p => [p[0] + speed, p[1], p[2]]);
        break;
      case "fly":
        setPlayerPos(p => [p[0], Math.min(3, p[1] + 0.5), p[2]]);
        break;
    }
  };

  // Gravity
  useEffect(() => {
    if (!isPlaying) return;
    
    const gravity = setInterval(() => {
      setPlayerPos(p => [p[0], Math.max(-1, p[1] - 0.05), p[2]]);
    }, 50);
    
    return () => clearInterval(gravity);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full">
      {showGameOver && (
        <Game3DGameOver
          isOpen={showGameOver}
          onClose={() => setShowGameOver(false)}
          onRestart={initializeGame}
          onHome={() => onBack?.()}
          isWin={isWin}
          score={score}
          coinsEarned={coins}
          level={level}
          stats={[
            { label: "Dreams", value: `${collectedOrbs.length}/${orbCount}` },
            { label: "Combo", value: combo },
          ]}
        />
      )}

      <div className="relative w-full aspect-square max-w-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900">
        {isPlaying && (
          <Game3DHUD
            score={score}
            level={level}
            lives={lives}
            maxLives={3}
            coins={coins}
            combo={combo}
            timeLeft={timeLeft}
            targetScore={targetOrbs}
            isPaused={false}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5, 10], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene
              playerPos={playerPos}
              orbs={orbs}
              nightmares={nightmares}
              collectedOrbs={collectedOrbs}
            />
          </Suspense>
        </Canvas>
        
        {isPlaying && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              💭 {collectedOrbs.length}/{targetOrbs}
            </div>
          </div>
        )}
        
        {!isPlaying && !showGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🌙</div>
              <h2 className="text-2xl font-bold text-white mb-2">Dream World 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - Thu thập {targetOrbs} giấc mơ</p>
              <Button onClick={initializeGame} size="lg" className="bg-purple-500 hover:bg-purple-600">
                Bắt đầu
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 touch-manipulation"
          onTouchStart={() => handleMove("up")}
          disabled={!isPlaying}
        >
          <ArrowUp className="h-7 w-7" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 touch-manipulation bg-purple-500/20"
          onTouchStart={() => handleMove("fly")}
          disabled={!isPlaying}
        >
          🦋
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 touch-manipulation"
          onTouchStart={() => handleMove("left")}
          disabled={!isPlaying}
        >
          <ArrowLeft className="h-7 w-7" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 touch-manipulation"
          onTouchStart={() => handleMove("down")}
          disabled={!isPlaying}
        >
          <ArrowDown className="h-7 w-7" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 touch-manipulation"
          onTouchStart={() => handleMove("right")}
          disabled={!isPlaying}
        >
          <ArrowRight className="h-7 w-7" />
        </Button>
      </div>

      <div className="flex gap-3">
        {onBack && (
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
      </div>
    </div>
  );
}

export default DreamWorld3D;
