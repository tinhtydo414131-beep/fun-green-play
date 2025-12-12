import { useRef, useState, useCallback, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  Float,
  Sparkles,
  Stars,
  Text,
  Sky
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";
import { 
  ArrowLeft, ArrowUp, ArrowDown, ArrowRight as ArrowRightIcon, 
  Lightbulb, Map, Clock, HelpCircle, X, Trophy, Target, Footprints,
  Eye, Gamepad2
} from "lucide-react";

interface MazeRunner3DProps {
  level?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 p-6 bg-black/80 rounded-xl backdrop-blur-sm">
        <div className="text-6xl animate-bounce">🧭</div>
        <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-lg font-medium">Đang tạo mê cung... {progress.toFixed(0)}%</p>
        <p className="text-white/60 text-sm">Khám phá thế giới bí ẩn</p>
      </div>
    </Html>
  );
}

// Advanced maze generation using recursive backtracking - creates perfect maze with multiple solution paths
function generateAdvancedMaze(width: number, height: number): { maze: boolean[][], paths: number[][] } {
  // Initialize all cells as walls
  const maze: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(true));
  const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
  
  const directions = [
    [0, -2], [0, 2], [-2, 0], [2, 0] // Up, Down, Left, Right (step 2)
  ];
  
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  function carve(x: number, y: number) {
    visited[y][x] = true;
    maze[y][x] = false;
    
    const shuffledDirs = shuffle(directions);
    
    for (const [dx, dy] of shuffledDirs) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && !visited[ny][nx]) {
        // Carve the wall between current and next cell
        maze[y + dy / 2][x + dx / 2] = false;
        carve(nx, ny);
      }
    }
  }
  
  // Start from top-left corner
  carve(1, 1);
  
  // Ensure start and goal are clear
  maze[1][1] = false;
  maze[height - 2][width - 2] = false;
  
  // Create multiple paths by randomly removing some walls (makes maze more interesting)
  const extraPaths: number[][] = [];
  for (let i = 0; i < Math.floor(width * height / 40); i++) {
    const x = Math.floor(Math.random() * (width - 4)) + 2;
    const y = Math.floor(Math.random() * (height - 4)) + 2;
    if (maze[y][x]) {
      // Check if removing this wall creates a valid path
      const neighbors = [
        [y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]
      ].filter(([ny, nx]) => ny > 0 && ny < height - 1 && nx > 0 && nx < width - 1 && !maze[ny][nx]);
      
      if (neighbors.length >= 2) {
        maze[y][x] = false;
        extraPaths.push([x, y]);
      }
    }
  }
  
  return { maze, paths: extraPaths };
}

// BFS pathfinding to find escape route
function findPath(maze: boolean[][], start: [number, number], end: [number, number]): [number, number][] {
  const queue: { pos: [number, number]; path: [number, number][] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start[0]},${start[1]}`);
  
  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    
    if (pos[0] === end[0] && pos[1] === end[1]) {
      return path;
    }
    
    const directions: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of directions) {
      const nx = pos[0] + dx;
      const ny = pos[1] + dy;
      const key = `${nx},${ny}`;
      
      if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && 
          !maze[ny][nx] && !visited.has(key)) {
        visited.add(key);
        queue.push({ pos: [nx, ny], path: [...path, [nx, ny]] });
      }
    }
  }
  
  return [];
}

// Textured wall with ivy/moss details
function MazeWall({ position, height = 3.5 }: { position: [number, number, number]; height?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  
  return (
    <group position={position}>
      {/* Main wall */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial 
          color="#1a472a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {/* Wall top hedge effect */}
      <mesh position={[0, height / 2 + 0.15, 0]} castShadow>
        <boxGeometry args={[1.1, 0.3, 1.1]} />
        <meshStandardMaterial 
          color="#2d5a3d"
          roughness={1}
          metalness={0}
        />
      </mesh>
      {/* Random decorations */}
      {Math.random() > 0.7 && (
        <mesh position={[0.3, 0, 0.5]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#90EE90" emissive="#90EE90" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  );
}

// Detailed human character lost in maze
function HumanCharacter({ 
  position, 
  targetPosition,
  isLost = false,
  emotion = "worried"
}: { 
  position: [number, number, number];
  targetPosition: [number, number, number];
  isLost?: boolean;
  emotion?: "worried" | "happy" | "scared";
}) {
  const ref = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));
  const legAngle = useRef(0);
  const armAngle = useRef(0);

  useFrame((state) => {
    if (ref.current) {
      const target = new THREE.Vector3(...targetPosition);
      const isMoving = currentPos.current.distanceTo(target) > 0.05;
      
      currentPos.current.lerp(target, 0.12);
      ref.current.position.copy(currentPos.current);
      
      // Breathing/bobbing animation
      ref.current.position.y = 0 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      
      // Walking animation
      if (isMoving) {
        legAngle.current = Math.sin(state.clock.elapsedTime * 12) * 0.4;
        armAngle.current = Math.sin(state.clock.elapsedTime * 12) * 0.3;
      } else {
        legAngle.current *= 0.9;
        armAngle.current *= 0.9;
      }
      
      // Face direction of movement
      const dir = target.clone().sub(currentPos.current);
      if (dir.length() > 0.01) {
        ref.current.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }
  });

  const skinColor = "#FFD5B8";
  const hairColor = "#4A3728";
  const shirtColor = isLost ? "#FF6B6B" : "#4ECDC4";
  const pantsColor = "#3B5998";

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.15, 0.35, 8, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>
      
      {/* Head */}
      <mesh castShadow position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.14, 16, 8]} />
        <meshStandardMaterial color={hairColor} roughness={0.9} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.05, 1.17, 0.12]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0.05, 1.17, 0.12]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.05, 1.17, 0.14]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#2D2D2D" />
      </mesh>
      <mesh position={[0.05, 1.17, 0.14]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#2D2D2D" />
      </mesh>
      
      {/* Eyebrows - worried expression */}
      {emotion === "worried" && (
        <>
          <mesh position={[-0.05, 1.21, 0.13]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.04, 0.008, 0.01]} />
            <meshBasicMaterial color={hairColor} />
          </mesh>
          <mesh position={[0.05, 1.21, 0.13]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.04, 0.008, 0.01]} />
            <meshBasicMaterial color={hairColor} />
          </mesh>
        </>
      )}
      
      {/* Mouth */}
      <mesh position={[0, 1.08, 0.13]}>
        <torusGeometry args={[0.02, 0.005, 8, 8, Math.PI]} />
        <meshBasicMaterial color="#CC7777" />
      </mesh>
      
      {/* Left Arm */}
      <group position={[-0.2, 0.8, 0]} rotation={[armAngle.current, 0, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.04, 0.25, 4, 8]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* Right Arm */}
      <group position={[0.2, 0.8, 0]} rotation={[-armAngle.current, 0, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.04, 0.25, 4, 8]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* Left Leg */}
      <group position={[-0.08, 0.35, 0]} rotation={[legAngle.current, 0, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.2, 0.03]}>
          <boxGeometry args={[0.08, 0.05, 0.12]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
      
      {/* Right Leg */}
      <group position={[0.08, 0.35, 0]} rotation={[-legAngle.current, 0, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.2, 0.03]}>
          <boxGeometry args={[0.08, 0.05, 0.12]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
      
      {/* Glow effect for player */}
      <pointLight color={shirtColor} intensity={0.6} distance={4} />
      
      {/* Lost indicator */}
      {isLost && (
        <Float speed={3} rotationIntensity={0} floatIntensity={0.5}>
          <Text
            position={[0, 1.6, 0]}
            fontSize={0.25}
            color="#FFFF00"
            anchorX="center"
            anchorY="middle"
          >
            ❓
          </Text>
        </Float>
      )}
    </group>
  );
}

// Collectible gems with different values
function Gem({ 
  position, 
  type = "emerald",
  value = 100,
  onCollect 
}: { 
  position: [number, number, number]; 
  type?: "emerald" | "ruby" | "sapphire" | "diamond";
  value?: number;
  onCollect: () => void;
}) {
  const [collected, setCollected] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  const colors = {
    emerald: { main: "#50C878", glow: "#00FF7F" },
    ruby: { main: "#E0115F", glow: "#FF1744" },
    sapphire: { main: "#0F52BA", glow: "#2196F3" },
    diamond: { main: "#B9F2FF", glow: "#FFFFFF" }
  };

  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  if (collected) return null;

  return (
    <Float speed={3} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={[position[0], position[1] + 0.4, position[2]]}>
        <mesh
          ref={ref}
          onClick={() => {
            setCollected(true);
            onCollect();
          }}
          castShadow
        >
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial 
            color={colors[type].main}
            metalness={0.9}
            roughness={0.1}
            emissive={colors[type].glow}
            emissiveIntensity={0.4}
            transparent
            opacity={0.9}
          />
        </mesh>
        <pointLight color={colors[type].glow} intensity={0.8} distance={4} />
        <Sparkles count={8} scale={1} size={3} color={colors[type].glow} />
      </group>
    </Float>
  );
}

// Exit portal with multiple paths indicator
function ExitPortal({ position, pathNumber = 1 }: { position: [number, number, number]; pathNumber?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.7, 0.08, 16, 32]} />
        <meshStandardMaterial 
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.6}
          metalness={0.9}
        />
      </mesh>
      
      {/* Inner portal effect */}
      <mesh ref={ref}>
        <torusGeometry args={[0.5, 0.1, 16, 32]} />
        <meshStandardMaterial 
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.8}
          metalness={0.8}
        />
      </mesh>
      
      {/* Portal center glow */}
      <mesh>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial 
          color="#00FF88"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Path number indicator */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/bold.woff"
      >
        {`Lối thoát ${pathNumber}`}
      </Text>
      
      <pointLight color="#22c55e" intensity={2} distance={8} />
      <Sparkles count={30} scale={2.5} size={4} color="#22c55e" speed={0.5} />
    </group>
  );
}

// Torch lighting
function Torch({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#4A3728" roughness={1} />
      </mesh>
      <pointLight 
        ref={lightRef}
        position={[0, 0.6, 0]} 
        color="#FF6B35" 
        intensity={1.5} 
        distance={6}
        castShadow
      />
      <Sparkles position={[0, 0.7, 0]} count={5} scale={0.5} size={2} color="#FF6B35" />
    </group>
  );
}

// Camera follow with smooth transition
function CameraFollow({ target, mazeSize }: { target: [number, number, number]; mazeSize: number }) {
  const { camera } = useThree();
  const height = Math.min(12, 8 + mazeSize * 0.15);
  
  useFrame(() => {
    camera.position.lerp(
      new THREE.Vector3(target[0], target[1] + height, target[2] + height * 0.6),
      0.04
    );
    camera.lookAt(target[0], target[1], target[2]);
  });
  
  return null;
}

// Ground with grass texture effect
function Ground({ size }: { size: number }) {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[size + 4, size + 4]} />
        <meshStandardMaterial color="#3d5c3d" roughness={0.95} />
      </mesh>
      {/* Path texture overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#5a7a5a" roughness={0.85} />
      </mesh>
    </group>
  );
}

// Mini-map component
function MiniMap({ 
  maze, 
  playerPos, 
  goalPos,
  visitedCells,
  hintPath 
}: { 
  maze: boolean[][]; 
  playerPos: [number, number];
  goalPos: [number, number];
  visitedCells: Set<string>;
  hintPath: [number, number][];
}) {
  const cellSize = 6;
  const width = maze[0].length * cellSize;
  const height = maze.length * cellSize;

  return (
    <div 
      className="absolute top-16 right-4 bg-black/70 rounded-lg p-2 border border-emerald-500/30"
      style={{ width: width + 16, height: height + 16 }}
    >
      <div className="text-emerald-400 text-xs mb-1 flex items-center gap-1">
        <Map className="w-3 h-3" /> Bản đồ
      </div>
      <svg width={width} height={height} className="rounded">
        {maze.map((row, y) =>
          row.map((isWall, x) => (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={
                isWall ? "#1a472a" : 
                visitedCells.has(`${x},${y}`) ? "#4a7c59" : "#2d4a3e"
              }
            />
          ))
        )}
        {/* Hint path */}
        {hintPath.map(([x, y], i) => (
          <rect
            key={`hint-${i}`}
            x={x * cellSize + 1}
            y={y * cellSize + 1}
            width={cellSize - 2}
            height={cellSize - 2}
            fill="#FFD700"
            opacity={0.5}
          />
        ))}
        {/* Goal */}
        <circle
          cx={goalPos[0] * cellSize + cellSize / 2}
          cy={goalPos[1] * cellSize + cellSize / 2}
          r={cellSize / 2}
          fill="#22c55e"
          className="animate-pulse"
        />
        {/* Player */}
        <circle
          cx={playerPos[0] * cellSize + cellSize / 2}
          cy={playerPos[1] * cellSize + cellSize / 2}
          r={cellSize / 2 - 1}
          fill="#4ECDC4"
          stroke="#fff"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

// Game scene
function MazeScene({
  maze,
  playerPos,
  gems,
  exitPos,
  torches,
  onGemCollect,
  cellSize,
  visitedCells
}: {
  maze: boolean[][];
  playerPos: [number, number, number];
  gems: { pos: [number, number, number]; type: "emerald" | "ruby" | "sapphire" | "diamond"; value: number }[];
  exitPos: [number, number, number];
  torches: [number, number, number][];
  onGemCollect: (index: number, value: number) => void;
  cellSize: number;
  visitedCells: Set<string>;
}) {
  const walls = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x]) {
          positions.push([
            (x - maze[y].length / 2) * cellSize,
            1.75,
            (y - maze.length / 2) * cellSize
          ]);
        }
      }
    }
    return positions;
  }, [maze, cellSize]);

  const groundSize = Math.max(maze.length, maze[0].length) * cellSize;

  return (
    <>
      <CameraFollow target={playerPos} mazeSize={maze.length} />
      
      {/* Sky */}
      <Sky 
        distance={450000} 
        sunPosition={[100, 20, 100]} 
        inclination={0.5}
        azimuth={0.25}
      />
      
      <Environment preset="forest" background={false} />
      <ambientLight intensity={0.4} color="#87CEEB" />
      <directionalLight 
        position={[20, 30, 20]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        color="#FFF5E6"
      />
      <hemisphereLight intensity={0.3} color="#87CEEB" groundColor="#3d5c3d" />

      {/* Ground */}
      <Ground size={groundSize} />

      {/* Walls */}
      {walls.map((pos, i) => (
        <MazeWall key={i} position={pos} />
      ))}

      {/* Player */}
      <HumanCharacter 
        position={playerPos} 
        targetPosition={playerPos} 
        isLost={true}
        emotion="worried"
      />

      {/* Gems */}
      {gems.map((gem, i) => (
        <Gem 
          key={i} 
          position={gem.pos} 
          type={gem.type}
          value={gem.value}
          onCollect={() => onGemCollect(i, gem.value)} 
        />
      ))}

      {/* Torches for atmosphere */}
      {torches.map((pos, i) => (
        <Torch key={`torch-${i}`} position={pos} />
      ))}

      {/* Exit Portal */}
      <ExitPortal position={exitPos} pathNumber={1} />

      {/* Fog for mystery */}
      <fog attach="fog" args={["#87CEEB", 15, 60]} />

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={groundSize + 4}
        blur={2}
        far={6}
      />
    </>
  );
}

// Tutorial Modal
function TutorialModal({ isOpen, onClose, onStart }: { isOpen: boolean; onClose: () => void; onStart: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="bg-gradient-to-br from-emerald-900 via-slate-900 to-cyan-900 rounded-2xl p-6 max-w-lg w-full border border-emerald-500/30 shadow-2xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🧭</div>
              <div>
                <h2 className="text-2xl font-bold text-white">Mê Cung Kỳ Bí 3D</h2>
                <p className="text-emerald-400 text-sm">Hành trình tìm lối thoát</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 text-white/90">
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" /> Mục tiêu
              </h3>
              <p className="text-sm">
                Bạn là người lạc trong mê cung bí ẩn. Tìm đường đến cổng thoát màu xanh trước khi hết 5 phút!
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" /> Điều khiển
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>⬆️ W / Mũi tên lên - Đi lên</div>
                <div>⬇️ S / Mũi tên xuống - Đi xuống</div>
                <div>⬅️ A / Mũi tên trái - Sang trái</div>
                <div>➡️ D / Mũi tên phải - Sang phải</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Thu thập
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>💎 Kim cương - 500 điểm</div>
                <div>🔴 Ruby - 300 điểm</div>
                <div>🔵 Sapphire - 200 điểm</div>
                <div>💚 Ngọc lục bảo - 100 điểm</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" /> Mẹo chơi
              </h3>
              <ul className="text-sm space-y-1">
                <li>• Dùng bản đồ mini góc phải để xem đường đi</li>
                <li>• Nhấn 💡 để xem gợi ý đường thoát (mất điểm)</li>
                <li>• Mê cung có nhiều đường đi khác nhau</li>
                <li>• Thu thập đá quý để được điểm thưởng</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Đóng
            </Button>
            <Button 
              onClick={onStart}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              🎮 Bắt đầu chơi
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Game Over Modal
function GameOverModal({ 
  isOpen, 
  isWin, 
  score, 
  timeUsed,
  gemsCollected,
  hintsUsed,
  onRestart, 
  onHome 
}: { 
  isOpen: boolean; 
  isWin: boolean; 
  score: number; 
  timeUsed: number;
  gemsCollected: number;
  hintsUsed: number;
  onRestart: () => void; 
  onHome: () => void;
}) {
  if (!isOpen) return null;

  const stars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          className={`bg-gradient-to-br ${isWin ? 'from-emerald-900 via-cyan-900 to-blue-900' : 'from-red-900 via-slate-900 to-gray-900'} rounded-2xl p-6 max-w-md w-full border ${isWin ? 'border-emerald-500/30' : 'border-red-500/30'} shadow-2xl text-center`}
        >
          <div className="text-7xl mb-4">
            {isWin ? '🎉' : '😢'}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {isWin ? 'Thoát thành công!' : 'Hết thời gian!'}
          </h2>
          
          {isWin && (
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map(i => (
                <span key={i} className={`text-3xl ${i <= stars ? 'opacity-100' : 'opacity-30'}`}>
                  ⭐
                </span>
              ))}
            </div>
          )}

          <div className="bg-black/30 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-white/80">
              <span>Điểm số:</span>
              <span className="font-bold text-yellow-400">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Thời gian:</span>
              <span>{Math.floor(timeUsed / 60)}:{(timeUsed % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Đá quý thu:</span>
              <span className="text-emerald-400">{gemsCollected}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Gợi ý đã dùng:</span>
              <span className="text-purple-400">{hintsUsed}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={onHome}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              🏠 Về trang chủ
            </Button>
            <Button 
              onClick={onRestart}
              className={`flex-1 ${isWin ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
            >
              🔄 Chơi lại
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// HUD component
function GameHUD({ 
  score, 
  timeLeft, 
  level, 
  gemsCollected,
  totalGems,
  onHint,
  hintsUsed 
}: { 
  score: number; 
  timeLeft: number; 
  level: number; 
  gemsCollected: number;
  totalGems: number;
  onHint: () => void;
  hintsUsed: number;
}) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 60;

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
      <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-bold">{score.toLocaleString()}</span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className={`flex items-center gap-2 ${isLowTime ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          <Clock className="w-5 h-5" />
          <span className="font-mono font-bold">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="flex items-center gap-2 text-emerald-400">
          <span>💎 {gemsCollected}/{totalGems}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
          <span className="text-cyan-400 font-medium">Level {level}</span>
        </div>
        <button
          onClick={onHint}
          className="bg-purple-600/80 hover:bg-purple-500/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-400/30 flex items-center gap-2 text-white transition-colors"
        >
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="text-sm">Gợi ý ({3 - hintsUsed})</span>
        </button>
      </div>
    </div>
  );
}

export function MazeRunner3D({ level = 1, onLevelComplete, onBack }: MazeRunner3DProps) {
  // Larger maze for more intellectual challenge
  const mazeWidth = 15 + level * 4; // 19, 23, 27...
  const mazeHeight = 15 + level * 4;
  const cellSize = 1;
  const gemCount = 8 + level * 2;
  const TIME_LIMIT = 300; // 5 minutes

  const [mazeData, setMazeData] = useState(() => generateAdvancedMaze(mazeWidth, mazeHeight));
  const maze = mazeData.maze;
  
  const [playerGridPos, setPlayerGridPos] = useState<[number, number]>([1, 1]);
  const [goalGridPos] = useState<[number, number]>([mazeWidth - 2, mazeHeight - 2]);
  
  const gridToWorld = useCallback((gx: number, gy: number): [number, number, number] => {
    return [
      (gx - mazeWidth / 2) * cellSize,
      0,
      (gy - mazeHeight / 2) * cellSize
    ];
  }, [mazeWidth, mazeHeight, cellSize]);

  const playerPos = useMemo(() => gridToWorld(playerGridPos[0], playerGridPos[1]), [playerGridPos, gridToWorld]);
  const goalPos = useMemo(() => gridToWorld(goalGridPos[0], goalGridPos[1]), [goalGridPos, gridToWorld]);

  const generateGems = useCallback(() => {
    const gems: { pos: [number, number, number]; type: "emerald" | "ruby" | "sapphire" | "diamond"; value: number }[] = [];
    const types: ("emerald" | "ruby" | "sapphire" | "diamond")[] = ["emerald", "ruby", "sapphire", "diamond"];
    const values = { emerald: 100, ruby: 300, sapphire: 200, diamond: 500 };
    
    for (let i = 0; i < gemCount; i++) {
      let x, y, attempts = 0;
      do {
        x = Math.floor(Math.random() * (mazeWidth - 2)) + 1;
        y = Math.floor(Math.random() * (mazeHeight - 2)) + 1;
        attempts++;
      } while ((maze[y]?.[x] || (x === 1 && y === 1) || (x === mazeWidth - 2 && y === mazeHeight - 2)) && attempts < 100);
      
      if (attempts < 100) {
        const type = types[Math.floor(Math.random() * (i < 2 ? 4 : 3))]; // More diamonds early
        gems.push({
          pos: gridToWorld(x, y),
          type,
          value: values[type]
        });
      }
    }
    return gems;
  }, [maze, mazeWidth, mazeHeight, gemCount, gridToWorld]);

  const generateTorches = useCallback(() => {
    const torches: [number, number, number][] = [];
    for (let y = 3; y < mazeHeight - 3; y += 5) {
      for (let x = 3; x < mazeWidth - 3; x += 5) {
        if (maze[y]?.[x]) {
          torches.push([(x - mazeWidth / 2) * cellSize + 0.4, 0, (y - mazeHeight / 2) * cellSize]);
        }
      }
    }
    return torches;
  }, [maze, mazeWidth, mazeHeight, cellSize]);

  const [gems, setGems] = useState<{ pos: [number, number, number]; type: "emerald" | "ruby" | "sapphire" | "diamond"; value: number }[]>([]);
  const [torches, setTorches] = useState<[number, number, number][]>([]);
  const [collectedGems, setCollectedGems] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [hintPath, setHintPath] = useState<[number, number][]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    const shown = localStorage.getItem("mazerunner3d_v2_tutorial");
    if (shown) setShowTutorial(false);
  }, []);

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsWin(false);
          setShowGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Track visited cells
  useEffect(() => {
    if (isPlaying) {
      setVisitedCells(prev => new Set(prev).add(`${playerGridPos[0]},${playerGridPos[1]}`));
    }
  }, [playerGridPos, isPlaying]);

  // Check win condition
  useEffect(() => {
    if (!isPlaying) return;
    
    if (playerGridPos[0] === goalGridPos[0] && playerGridPos[1] === goalGridPos[1]) {
      const timeBonus = Math.floor(timeLeft * 10);
      setScore(s => s + timeBonus + 1000);
      toast.success(`🎉 Thoát thành công! +${timeBonus + 1000} điểm thưởng!`);
      haptics.success();
      setIsWin(true);
      setShowGameOver(true);
      setIsPlaying(false);
      onLevelComplete?.();
    }
  }, [playerGridPos, goalGridPos, isPlaying, timeLeft, onLevelComplete]);

  const handleMove = useCallback((dir: string) => {
    if (!isPlaying) return;
    
    setPlayerGridPos(prev => {
      let nx = prev[0];
      let ny = prev[1];
      
      switch (dir) {
        case "up": ny -= 1; break;
        case "down": ny += 1; break;
        case "left": nx -= 1; break;
        case "right": nx += 1; break;
      }
      
      if (nx >= 0 && nx < mazeWidth && ny >= 0 && ny < mazeHeight && !maze[ny]?.[nx]) {
        haptics.light();
        return [nx, ny];
      }
      
      return prev;
    });
    
    // Clear hint path on move
    if (hintPath.length > 0) {
      setHintPath([]);
    }
  }, [isPlaying, maze, mazeWidth, mazeHeight, hintPath]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case "ArrowUp": case "w": case "W": handleMove("up"); break;
        case "ArrowDown": case "s": case "S": handleMove("down"); break;
        case "ArrowLeft": case "a": case "A": handleMove("left"); break;
        case "ArrowRight": case "d": case "D": handleMove("right"); break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, handleMove]);

  const handleGemCollect = (index: number, value: number) => {
    setGems(g => g.filter((_, i) => i !== index));
    setCollectedGems(c => c + 1);
    setScore(s => s + value);
    haptics.success();
    toast.success(`+${value} 💎`);
  };

  const handleHint = () => {
    if (hintsUsed >= 3) {
      toast.error("Đã hết lượt gợi ý!");
      return;
    }
    
    const path = findPath(maze, playerGridPos, goalGridPos);
    if (path.length > 0) {
      setHintPath(path.slice(0, 10)); // Show next 10 steps
      setHintsUsed(h => h + 1);
      setScore(s => Math.max(0, s - 200));
      toast("💡 Đường đi được hiển thị trên bản đồ! (-200 điểm)");
      
      // Auto-clear hint after 5 seconds
      setTimeout(() => setHintPath([]), 5000);
    }
  };

  const startGame = () => {
    const newMazeData = generateAdvancedMaze(mazeWidth, mazeHeight);
    setMazeData(newMazeData);
    setPlayerGridPos([1, 1]);
    setGems(generateGems());
    setTorches(generateTorches());
    setCollectedGems(0);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setIsPlaying(true);
    setShowGameOver(false);
    setVisitedCells(new Set());
    setHintPath([]);
    setHintsUsed(0);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full">
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => {
          localStorage.setItem("mazerunner3d_v2_tutorial", "true");
          setShowTutorial(false);
        }}
        onStart={() => {
          localStorage.setItem("mazerunner3d_v2_tutorial", "true");
          setShowTutorial(false);
          startGame();
        }}
      />

      <GameOverModal
        isOpen={showGameOver}
        isWin={isWin}
        score={score}
        timeUsed={TIME_LIMIT - timeLeft}
        gemsCollected={collectedGems}
        hintsUsed={hintsUsed}
        onRestart={startGame}
        onHome={() => onBack?.()}
      />

      <div className="relative w-full aspect-video max-w-[900px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200">
        {isPlaying && (
          <>
            <GameHUD
              score={score}
              timeLeft={timeLeft}
              level={level}
              gemsCollected={collectedGems}
              totalGems={gemCount}
              onHint={handleHint}
              hintsUsed={hintsUsed}
            />
            <MiniMap
              maze={maze}
              playerPos={playerGridPos}
              goalPos={goalGridPos}
              visitedCells={visitedCells}
              hintPath={hintPath}
            />
          </>
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 15, 15], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <MazeScene
              maze={maze}
              playerPos={playerPos}
              gems={gems}
              exitPos={goalPos}
              torches={torches}
              onGemCollect={handleGemCollect}
              cellSize={cellSize}
              visitedCells={visitedCells}
            />
          </Suspense>
        </Canvas>
        
        {!isPlaying && !showTutorial && !showGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center bg-black/60 rounded-2xl p-8"
            >
              <div className="text-7xl mb-4">🧭</div>
              <h2 className="text-3xl font-bold text-white mb-2">Mê Cung Kỳ Bí 3D</h2>
              <p className="text-white/70 mb-2">Level {level} - Mê cung {mazeWidth}x{mazeHeight}</p>
              <p className="text-emerald-400 mb-6">⏱️ 5 phút để thoát</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => setShowTutorial(true)} 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Hướng dẫn
                </Button>
                <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                  🎮 Bắt đầu
                </Button>
              </div>
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
          className="h-16 w-16 touch-manipulation active:scale-95 bg-emerald-600/20 border-emerald-500/50"
          onTouchStart={(e) => { e.preventDefault(); handleMove("up"); }}
          disabled={!isPlaying}
        >
          <ArrowUp className="h-8 w-8" />
        </Button>
        <div />
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 touch-manipulation active:scale-95 bg-emerald-600/20 border-emerald-500/50"
          onTouchStart={(e) => { e.preventDefault(); handleMove("left"); }}
          disabled={!isPlaying}
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 touch-manipulation active:scale-95 bg-emerald-600/20 border-emerald-500/50"
          onTouchStart={(e) => { e.preventDefault(); handleMove("down"); }}
          disabled={!isPlaying}
        >
          <ArrowDown className="h-8 w-8" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 touch-manipulation active:scale-95 bg-emerald-600/20 border-emerald-500/50"
          onTouchStart={(e) => { e.preventDefault(); handleMove("right"); }}
          disabled={!isPlaying}
        >
          <ArrowRightIcon className="h-8 w-8" />
        </Button>
      </div>

      <div className="flex gap-3">
        {onBack && (
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button 
          onClick={() => setShowTutorial(true)} 
          variant="outline"
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Hướng dẫn
        </Button>
        {!showTutorial && (
          <Button onClick={startGame} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
            {isPlaying ? "🔄 Chơi lại" : "🎮 Bắt đầu"} 
          </Button>
        )}
      </div>
    </div>
  );
}

export default MazeRunner3D;
