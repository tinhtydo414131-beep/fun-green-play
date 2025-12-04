import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  Float,
  Sparkles,
  Stars
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface StarCollector3DProps {
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
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading 3D... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

function Player({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 0.4, 4, 8]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Glow */}
      <pointLight color="#4f46e5" intensity={1} distance={3} />
      <Sparkles count={10} scale={1.5} size={2} color="#a5b4fc" />
    </group>
  );
}

function Star3D({ 
  position, 
  collected,
  type = "normal"
}: { 
  position: [number, number, number]; 
  collected: boolean;
  type?: "normal" | "golden" | "rainbow";
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 3;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  if (collected) return null;

  const colors = {
    normal: "#fbbf24",
    golden: "#ffd700",
    rainbow: "#ff6b6b"
  };

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef} castShadow>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial 
            color={colors[type]}
            metalness={0.8}
            roughness={0.2}
            emissive={colors[type]}
            emissiveIntensity={0.5}
          />
        </mesh>
        <pointLight color={colors[type]} intensity={0.5} distance={2} />
        <Sparkles count={5} scale={1} size={2} color={colors[type]} />
      </group>
    </Float>
  );
}

function Obstacle3D({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <icosahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial 
        color="#ef4444"
        metalness={0.3}
        roughness={0.7}
        emissive="#ef4444"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
    </mesh>
  );
}

function CameraRig({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.position.lerp(
      new THREE.Vector3(target[0], target[1] + 8, target[2] + 6),
      0.05
    );
    camera.lookAt(target[0], target[1], target[2]);
  });
  
  return null;
}

function GameScene({
  playerPos,
  stars,
  obstacles,
  collectedStars,
}: {
  playerPos: [number, number, number];
  stars: { pos: [number, number, number]; type: "normal" | "golden" | "rainbow" }[];
  obstacles: [number, number, number][];
  collectedStars: number[];
}) {
  return (
    <>
      <CameraRig target={playerPos} />
      <Environment preset="night" background={false} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      
      <Stars radius={100} depth={50} count={2000} factor={4} fade />
      
      <Ground />
      <Player position={playerPos} />
      
      {stars.map((star, i) => (
        <Star3D 
          key={i} 
          position={star.pos} 
          collected={collectedStars.includes(i)}
          type={star.type}
        />
      ))}
      
      {obstacles.map((pos, i) => (
        <Obstacle3D key={i} position={pos} />
      ))}
      
      <ContactShadows position={[0, -0.49, 0]} opacity={0.4} scale={20} blur={2} />
      <fog attach="fog" args={["#0a0a1a", 5, 25]} />
    </>
  );
}

export function StarCollector3D({ level = 1, onLevelComplete, onBack }: StarCollector3DProps) {
  const gridSize = 8;
  const starCount = 10 + level * 3;
  const obstacleCount = level * 2;
  const targetStars = Math.ceil(starCount * 0.8);
  
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [stars, setStars] = useState<{ pos: [number, number, number]; type: "normal" | "golden" | "rainbow" }[]>([]);
  const [obstacles, setObstacles] = useState<[number, number, number][]>([]);
  const [collectedStars, setCollectedStars] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 + level * 10);

  const lastMoveTime = useRef(Date.now());

  const initializeGame = useCallback(() => {
    // Generate stars
    const newStars: { pos: [number, number, number]; type: "normal" | "golden" | "rainbow" }[] = [];
    for (let i = 0; i < starCount; i++) {
      const type = Math.random() < 0.1 ? "golden" : Math.random() < 0.05 ? "rainbow" : "normal";
      newStars.push({
        pos: [
          (Math.random() - 0.5) * gridSize * 2,
          0,
          (Math.random() - 0.5) * gridSize * 2
        ],
        type
      });
    }
    setStars(newStars);
    
    // Generate obstacles
    const newObstacles: [number, number, number][] = [];
    for (let i = 0; i < obstacleCount; i++) {
      newObstacles.push([
        (Math.random() - 0.5) * gridSize * 2,
        0,
        (Math.random() - 0.5) * gridSize * 2
      ]);
    }
    setObstacles(newObstacles);
    
    setPlayerPos([0, 0, 0]);
    setCollectedStars([]);
    setScore(0);
    setCoins(0);
    setCombo(0);
    setLives(3);
    setTimeLeft(60 + level * 10);
    setIsPlaying(true);
    setShowGameOver(false);
  }, [starCount, obstacleCount, gridSize, level]);

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsWin(collectedStars.length >= targetStars);
          setShowGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, collectedStars.length, targetStars]);

  // Check collisions
  useEffect(() => {
    if (!isPlaying) return;
    
    // Check star collection
    stars.forEach((star, index) => {
      if (collectedStars.includes(index)) return;
      
      const dist = Math.sqrt(
        Math.pow(playerPos[0] - star.pos[0], 2) +
        Math.pow(playerPos[2] - star.pos[2], 2)
      );
      
      if (dist < 0.6) {
        haptics.success();
        setCollectedStars(prev => [...prev, index]);
        
        const now = Date.now();
        const timeSince = now - lastMoveTime.current;
        const newCombo = timeSince < 2000 ? combo + 1 : 1;
        setCombo(newCombo);
        
        const points = star.type === "golden" ? 500 : star.type === "rainbow" ? 1000 : 100;
        const earnedScore = points * newCombo;
        setScore(s => s + earnedScore);
        setCoins(c => c + earnedScore);
        
        // Check win
        if (collectedStars.length + 1 >= targetStars) {
          toast.success("🎉 Hoàn thành!");
          setIsWin(true);
          setShowGameOver(true);
          setIsPlaying(false);
          onLevelComplete?.();
        }
      }
    });
    
    // Check obstacle collision
    obstacles.forEach(obs => {
      const dist = Math.sqrt(
        Math.pow(playerPos[0] - obs[0], 2) +
        Math.pow(playerPos[2] - obs[2], 2)
      );
      
      if (dist < 0.7) {
        haptics.error();
        if (lives > 1) {
          setLives(l => l - 1);
          setPlayerPos([0, 0, 0]);
          setCombo(0);
          toast.error(`💥 Va chạm! Còn ${lives - 1} mạng`);
        } else {
          setIsWin(false);
          setShowGameOver(true);
          setIsPlaying(false);
        }
      }
    });
  }, [playerPos, stars, obstacles, collectedStars, isPlaying, combo, lives, targetStars, onLevelComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      const speed = 0.5;
      lastMoveTime.current = Date.now();
      
      switch (e.key) {
        case "ArrowUp": case "w": case "W":
          setPlayerPos(p => [p[0], p[1], Math.max(-gridSize, p[2] - speed)]);
          break;
        case "ArrowDown": case "s": case "S":
          setPlayerPos(p => [p[0], p[1], Math.min(gridSize, p[2] + speed)]);
          break;
        case "ArrowLeft": case "a": case "A":
          setPlayerPos(p => [Math.max(-gridSize, p[0] - speed), p[1], p[2]]);
          break;
        case "ArrowRight": case "d": case "D":
          setPlayerPos(p => [Math.min(gridSize, p[0] + speed), p[1], p[2]]);
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, gridSize]);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (!isPlaying) return;
    
    haptics.light();
    const speed = 0.5;
    lastMoveTime.current = Date.now();
    
    switch (dir) {
      case "up":
        setPlayerPos(p => [p[0], p[1], Math.max(-gridSize, p[2] - speed)]);
        break;
      case "down":
        setPlayerPos(p => [p[0], p[1], Math.min(gridSize, p[2] + speed)]);
        break;
      case "left":
        setPlayerPos(p => [Math.max(-gridSize, p[0] - speed), p[1], p[2]]);
        break;
      case "right":
        setPlayerPos(p => [Math.min(gridSize, p[0] + speed), p[1], p[2]]);
        break;
    }
  };

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
            { label: "Stars", value: `${collectedStars.length}/${starCount}` },
            { label: "Combo", value: combo },
          ]}
        />
      )}

      <div className="relative w-full aspect-square max-w-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-indigo-900 to-purple-950">
        {isPlaying && (
          <Game3DHUD
            score={score}
            level={level}
            lives={lives}
            maxLives={3}
            coins={coins}
            combo={combo}
            timeLeft={timeLeft}
            targetScore={targetStars}
            isPaused={false}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 10, 8], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene
              playerPos={playerPos}
              stars={stars}
              obstacles={obstacles}
              collectedStars={collectedStars}
            />
          </Suspense>
        </Canvas>
        
        {isPlaying && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              ⭐ {collectedStars.length}/{targetStars}
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
              <div className="text-6xl mb-4">⭐</div>
              <h2 className="text-2xl font-bold text-white mb-2">Star Collector 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - Thu thập {targetStars} sao</p>
              <Button onClick={initializeGame} size="lg" className="bg-yellow-500 hover:bg-yellow-600">
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
        <div />
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

export default StarCollector3D;
