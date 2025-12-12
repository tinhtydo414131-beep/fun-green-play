import { useRef, useState, useCallback, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows, 
  Html, 
  useProgress, 
  Sparkles, 
  Sky,
  Float,
  Text
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";
import { 
  ArrowLeft, ArrowRight as ArrowRightIcon, X, Trophy, Clock, 
  Gauge, Target, Gamepad2, Zap, HelpCircle, Car as CarIcon
} from "lucide-react";

interface Racing3DProps {
  level?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 p-6 bg-black/80 rounded-xl backdrop-blur-sm">
        <div className="text-6xl animate-bounce">🏎️</div>
        <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-lg font-medium">Đang tải đường đua... {progress.toFixed(0)}%</p>
        <p className="text-white/60 text-sm">Chuẩn bị động cơ!</p>
      </div>
    </Html>
  );
}

// Detailed sports car with visible driver
function DetailedCar({ 
  position, 
  rotation, 
  color = "#ef4444", 
  isPlayer = false,
  speed = 0,
  driverColor = "#FFD5B8"
}: { 
  position: [number, number, number]; 
  rotation: number; 
  color?: string; 
  isPlayer?: boolean;
  speed?: number;
  driverColor?: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  const steerAngle = useRef(0);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.set(...position);
      ref.current.rotation.y = rotation;
    }
    
    // Wheel rotation based on speed
    wheelRefs.current.forEach((wheel, i) => {
      if (wheel) {
        wheel.rotation.x += speed * 0.5;
        // Front wheels steering (indices 0, 1)
        if (i < 2) {
          wheel.rotation.y = steerAngle.current * 0.3;
        }
      }
    });
  });

  return (
    <group ref={ref}>
      {/* Car body - main chassis */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.9, 0.2, 2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Hood (front part) */}
      <mesh position={[0, 0.32, 0.6]} castShadow>
        <boxGeometry args={[0.85, 0.12, 0.7]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Rear spoiler */}
      <mesh position={[0, 0.45, -0.9]} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.15]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-0.35, 0.35, -0.85]} castShadow>
        <boxGeometry args={[0.05, 0.2, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.35, 0.35, -0.85]} castShadow>
        <boxGeometry args={[0.05, 0.2, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Cockpit / Cabin */}
      <mesh position={[0, 0.45, -0.1]} castShadow>
        <boxGeometry args={[0.7, 0.3, 0.9]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.4} roughness={0.4} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 0.5, 0.35]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.68, 0.02, 0.4]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Rear window */}
      <mesh position={[0, 0.5, -0.5]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.65, 0.02, 0.3]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Side windows */}
      <mesh position={[-0.36, 0.48, -0.1]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.02, 0.2, 0.6]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.36, 0.48, -0.1]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.02, 0.2, 0.6]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} />
      </mesh>
      
      {/* DRIVER - visible through windshield */}
      <group position={[0, 0.45, -0.15]}>
        {/* Driver body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.1, 0.15, 4, 8]} />
          <meshStandardMaterial color={isPlayer ? "#ff4444" : "#4444ff"} roughness={0.8} />
        </mesh>
        {/* Driver head */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={driverColor} roughness={0.6} />
        </mesh>
        {/* Helmet */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.11, 16, 8]} />
          <meshStandardMaterial color={isPlayer ? "#ff0000" : "#0066ff"} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Helmet visor */}
        <mesh position={[0, 0.2, 0.08]}>
          <boxGeometry args={[0.15, 0.06, 0.03]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Arms holding steering wheel */}
        <mesh position={[-0.12, 0.05, 0.15]} rotation={[0.5, 0, 0.3]}>
          <capsuleGeometry args={[0.03, 0.1, 4, 8]} />
          <meshStandardMaterial color={driverColor} />
        </mesh>
        <mesh position={[0.12, 0.05, 0.15]} rotation={[0.5, 0, -0.3]}>
          <capsuleGeometry args={[0.03, 0.1, 4, 8]} />
          <meshStandardMaterial color={driverColor} />
        </mesh>
      </group>
      
      {/* Steering wheel */}
      <mesh position={[0, 0.4, 0.15]} rotation={[-0.3, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      
      {/* Wheels with more detail */}
      {[
        [-0.45, 0.12, 0.65],  // Front left
        [0.45, 0.12, 0.65],   // Front right
        [-0.45, 0.12, -0.65], // Rear left
        [0.45, 0.12, -0.65]   // Rear right
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Tire */}
          <mesh 
            ref={el => { if (el) wheelRefs.current[i] = el; }} 
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.14, 0.14, 0.12, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
          </mesh>
          {/* Wheel rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.13, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Wheel hub */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.14, 8]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
      
      {/* Headlights */}
      <mesh position={[-0.3, 0.28, 0.98]}>
        <boxGeometry args={[0.15, 0.08, 0.04]} />
        <meshBasicMaterial color="#FFFACD" />
      </mesh>
      <mesh position={[0.3, 0.28, 0.98]}>
        <boxGeometry args={[0.15, 0.08, 0.04]} />
        <meshBasicMaterial color="#FFFACD" />
      </mesh>
      
      {/* Tail lights */}
      <mesh position={[-0.35, 0.28, -0.99]}>
        <boxGeometry args={[0.12, 0.06, 0.03]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>
      <mesh position={[0.35, 0.28, -0.99]}>
        <boxGeometry args={[0.12, 0.06, 0.03]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>
      
      {/* Side mirrors */}
      <mesh position={[-0.45, 0.45, 0.2]}>
        <boxGeometry args={[0.08, 0.05, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      <mesh position={[0.45, 0.45, 0.2]}>
        <boxGeometry args={[0.08, 0.05, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      
      {/* Racing stripes for player */}
      {isPlayer && (
        <>
          <mesh position={[0, 0.36, 0.3]}>
            <boxGeometry args={[0.1, 0.01, 1.2]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          <mesh position={[-0.2, 0.36, 0.3]}>
            <boxGeometry args={[0.05, 0.01, 1.2]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0.2, 0.36, 0.3]}>
            <boxGeometry args={[0.05, 0.01, 1.2]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </>
      )}
      
      {/* Effects for player car */}
      {isPlayer && (
        <>
          <pointLight position={[0, 0.3, 1.1]} color="#FFFACD" intensity={1} distance={8} />
          <Sparkles position={[0, 0.2, -1.2]} count={10} scale={0.8} size={4} color="#FF6600" speed={2} />
        </>
      )}
      
      {/* Speed number for AI cars */}
      {!isPlayer && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {"🏎️"}
        </Text>
      )}
    </group>
  );
}

// Enhanced road segment with more details
function Road({ position, roadWidth = 10 }: { position: [number, number, number]; roadWidth?: number }) {
  return (
    <group position={position}>
      {/* Main road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, 25]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
      </mesh>
      
      {/* Road edges (curbs) */}
      <mesh position={[-roadWidth / 2 + 0.15, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 25]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <mesh position={[roadWidth / 2 - 0.15, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 25]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      
      {/* Lane dividers */}
      {[-2.5, 2.5].map((x, i) => (
        <mesh key={`lane-${i}`} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 25]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}
      
      {/* Center dashed line */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`dash-${i}`} position={[0, 0.01, -10 + i * 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, 1.5]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      ))}
      
      {/* Road markings - arrows */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <group key={`arrow-${i}`} position={[x, 0.02, 5]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.3, 0.8]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.5} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Trees and scenery
function Scenery({ side, zOffset }: { side: "left" | "right"; zOffset: number }) {
  const x = side === "left" ? -8 : 8;
  
  return (
    <group position={[x + (Math.random() - 0.5) * 2, 0, zOffset]}>
      {/* Tree trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      {/* Tree foliage */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[0.45, 0.9, 8]} />
        <meshStandardMaterial color="#2E8B2E" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Power-up boost item
function BoostItem({ position, onCollect }: { position: [number, number, number]; onCollect: () => void }) {
  const [collected, setCollected] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y = state.clock.elapsedTime * 3;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <Float speed={4} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={ref} castShadow>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial 
            color="#00FFFF" 
            metalness={0.9} 
            roughness={0.1} 
            emissive="#00FFFF" 
            emissiveIntensity={0.5} 
          />
        </mesh>
        <Sparkles count={8} scale={1} size={3} color="#00FFFF" />
        <pointLight color="#00FFFF" intensity={1} distance={5} />
      </group>
    </Float>
  );
}

// Coin on road
function RoadCoin({ position, value = 50 }: { position: [number, number, number]; value?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 4;
    }
  });

  return (
    <Float speed={3} floatIntensity={0.3}>
      <group position={position}>
        <mesh ref={ref} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.08, 20]} />
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={0.95} 
            roughness={0.1} 
            emissive="#FFD700" 
            emissiveIntensity={0.3} 
          />
        </mesh>
        <Sparkles count={5} scale={0.6} size={2} color="#FFD700" />
      </group>
    </Float>
  );
}

// Camera follow with dynamic movement
function CameraFollow({ target, speed }: { target: THREE.Vector3; speed: number }) {
  const { camera } = useThree();
  const cameraHeight = 4 + speed * 2;
  const cameraDistance = 10 - speed * 1.5;
  
  useFrame(() => {
    camera.position.lerp(
      new THREE.Vector3(target.x * 0.4, cameraHeight, target.z + cameraDistance),
      0.08
    );
    camera.lookAt(target.x * 0.25, 0.5, target.z - 8);
  });
  
  return null;
}

// Finish line
function FinishLine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Checkered banner */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[12, 1.5, 0.2]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Checkered pattern */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-5.5 + i, 3, 0.11]}>
          <boxGeometry args={[0.5, 0.75, 0.01]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#000" : "#FFF"} />
        </mesh>
      ))}
      {/* Support poles */}
      <mesh position={[-5.5, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3, 8]} />
        <meshStandardMaterial color="#333" metalness={0.6} />
      </mesh>
      <mesh position={[5.5, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3, 8]} />
        <meshStandardMaterial color="#333" metalness={0.6} />
      </mesh>
      {/* FINISH text */}
      <Text
        position={[0, 4.5, 0]}
        fontSize={0.8}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        font="/fonts/bold.woff"
      >
        FINISH
      </Text>
      <Sparkles position={[0, 3, 0]} count={30} scale={15} size={5} color="#FFD700" />
    </group>
  );
}

// Tutorial Modal
function TutorialModal({ isOpen, onClose, onStart, level }: { isOpen: boolean; onClose: () => void; onStart: () => void; level: number }) {
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
          className="bg-gradient-to-br from-red-900 via-slate-900 to-orange-900 rounded-2xl p-6 max-w-lg w-full border border-red-500/30 shadow-2xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🏎️</div>
              <div>
                <h2 className="text-2xl font-bold text-white">Đua Xe Siêu Tốc 3D</h2>
                <p className="text-orange-400 text-sm">Level {level} - Đường đua tốc độ</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 text-white/90">
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" /> Mục tiêu
              </h3>
              <p className="text-sm">
                Hoàn thành đường đua trong thời gian 10 phút! Thu thập coins và boost để tăng điểm. Tránh va chạm với các xe khác.
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" /> Điều khiển
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>⬅️ A / Mũi tên trái - Chuyển làn trái</div>
                <div>➡️ D / Mũi tên phải - Chuyển làn phải</div>
                <div>📱 Vuốt trái/phải trên mobile</div>
                <div>🏎️ Xe tự động tăng tốc</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Thu thập
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>🪙 Coins vàng - 50 điểm</div>
                <div>💎 Boost xanh - Tăng tốc 2x</div>
                <div>🏁 Về đích - Thưởng thời gian</div>
                <div>⭐ Combo liên tục - x2 điểm</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Tốc độ & Level
              </h3>
              <ul className="text-sm space-y-1">
                <li>• Level cao = tốc độ nhanh hơn</li>
                <li>• Tránh va chạm để giữ mạng</li>
                <li>• 3 mạng mỗi lượt chơi</li>
                <li>• Thời gian: 10 phút mỗi level</li>
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
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              🏁 Bắt đầu đua
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
  distance,
  coinsCollected,
  topSpeed,
  onRestart, 
  onHome 
}: { 
  isOpen: boolean; 
  isWin: boolean; 
  score: number; 
  timeUsed: number;
  distance: number;
  coinsCollected: number;
  topSpeed: number;
  onRestart: () => void; 
  onHome: () => void;
}) {
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
          className={`bg-gradient-to-br ${isWin ? 'from-green-900 via-cyan-900 to-blue-900' : 'from-red-900 via-slate-900 to-gray-900'} rounded-2xl p-6 max-w-md w-full border ${isWin ? 'border-green-500/30' : 'border-red-500/30'} shadow-2xl text-center`}
        >
          <div className="text-7xl mb-4">
            {isWin ? '🏆' : '💥'}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {isWin ? 'Về đích thành công!' : 'Cuộc đua kết thúc!'}
          </h2>
          
          {isWin && (
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map(i => (
                <span key={i} className="text-3xl">⭐</span>
              ))}
            </div>
          )}

          <div className="bg-black/30 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-white/80">
              <span>Điểm số:</span>
              <span className="font-bold text-yellow-400">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Khoảng cách:</span>
              <span>{distance.toLocaleString()}m</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Thời gian:</span>
              <span>{Math.floor(timeUsed / 60)}:{(timeUsed % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Tốc độ tối đa:</span>
              <span className="text-cyan-400">{topSpeed} km/h</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Coins thu:</span>
              <span className="text-yellow-400">🪙 {coinsCollected}</span>
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
              className={`flex-1 ${isWin ? 'bg-gradient-to-r from-green-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
            >
              🔄 Đua lại
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Enhanced HUD
function GameHUD({ 
  score, 
  timeLeft, 
  level, 
  lives,
  speed,
  distance,
  targetDistance,
  coinsCollected,
  isBoosted
}: { 
  score: number; 
  timeLeft: number; 
  level: number; 
  lives: number;
  speed: number;
  distance: number;
  targetDistance: number;
  coinsCollected: number;
  isBoosted: boolean;
}) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 60;
  const progress = Math.min((distance / targetDistance) * 100, 100);

  return (
    <>
      {/* Top HUD */}
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
          <div className="flex items-center gap-1 text-red-400">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-lg ${i < lives ? 'opacity-100' : 'opacity-30'}`}>❤️</span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
            <span className="text-cyan-400 font-medium">Level {level}</span>
          </div>
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 flex items-center gap-2">
            <span className="text-yellow-400">🪙 {coinsCollected}</span>
          </div>
        </div>
      </div>

      {/* Speed gauge */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 border ${isBoosted ? 'border-cyan-400 animate-pulse' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <Gauge className={`w-6 h-6 ${isBoosted ? 'text-cyan-400' : 'text-orange-400'}`} />
            <span className={`text-2xl font-bold font-mono ${isBoosted ? 'text-cyan-400' : 'text-white'}`}>
              {speed}
            </span>
            <span className="text-white/60 text-sm">km/h</span>
          </div>
          {isBoosted && (
            <div className="text-cyan-400 text-xs text-center mt-1 animate-pulse">⚡ BOOST ⚡</div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] max-w-md z-10">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>🏁 {Math.floor(distance)}m</span>
            <span>{targetDistance}m 🏆</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function Racing3D({ level = 1, onLevelComplete, onBack }: Racing3DProps) {
  const lanes = [-2.5, 0, 2.5];
  const baseSpeed = 80 + level * 15; // km/h display
  const targetDistance = 2000 + level * 500;
  const TIME_LIMIT = 600; // 10 minutes

  const [playerLane, setPlayerLane] = useState(1);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 0.15, 0));
  const [distance, setDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; z: number; color: string }[]>([]);
  const [coins, setCoins] = useState<{ id: number; lane: number; z: number }[]>([]);
  const [boosts, setBoosts] = useState<{ id: number; lane: number; z: number }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(baseSpeed);
  const [isBoosted, setIsBoosted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [topSpeed, setTopSpeed] = useState(baseSpeed);

  const obstacleIdRef = useRef(0);
  const coinIdRef = useRef(0);
  const boostIdRef = useRef(0);
  const gameSpeedRef = useRef(0.35);

  const carColors = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

  useEffect(() => {
    const shown = localStorage.getItem("racing3d_v2_tutorial");
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

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      const effectiveSpeed = isBoosted ? gameSpeedRef.current * 2 : gameSpeedRef.current;
      
      // Move forward
      setDistance(d => {
        const newD = d + effectiveSpeed * 15;
        if (newD >= targetDistance) {
          const timeBonus = Math.floor(timeLeft * 5);
          setScore(s => s + timeBonus + 5000);
          toast.success(`🏆 Về đích! +${timeBonus + 5000} điểm thưởng!`);
          haptics.success();
          setIsWin(true);
          setShowGameOver(true);
          setIsPlaying(false);
          onLevelComplete?.();
        }
        return newD;
      });

      setScore(s => s + Math.floor(effectiveSpeed * 3));

      // Update display speed
      const displaySpeed = Math.floor(baseSpeed + (isBoosted ? 50 : 0) + Math.random() * 5);
      setCurrentSpeed(displaySpeed);
      setTopSpeed(ts => Math.max(ts, displaySpeed));

      // Spawn obstacles
      if (Math.random() < 0.025 + level * 0.008) {
        const lane = Math.floor(Math.random() * 3);
        const color = carColors[Math.floor(Math.random() * carColors.length)];
        setObstacles(o => [...o, { id: obstacleIdRef.current++, lane, z: -60, color }]);
      }

      // Spawn coins
      if (Math.random() < 0.04) {
        const lane = Math.floor(Math.random() * 3);
        setCoins(c => [...c, { id: coinIdRef.current++, lane, z: -50 }]);
      }

      // Spawn boosts (rare)
      if (Math.random() < 0.008) {
        const lane = Math.floor(Math.random() * 3);
        setBoosts(b => [...b, { id: boostIdRef.current++, lane, z: -45 }]);
      }

      // Move obstacles
      setObstacles(o => o.map(obs => ({ ...obs, z: obs.z + effectiveSpeed * 1.8 })).filter(obs => obs.z < 15));

      // Move coins
      setCoins(c => c.map(coin => ({ ...coin, z: coin.z + effectiveSpeed * 1.8 })).filter(coin => coin.z < 15));

      // Move boosts
      setBoosts(b => b.map(boost => ({ ...boost, z: boost.z + effectiveSpeed * 1.8 })).filter(boost => boost.z < 15));

      // Check collisions with obstacles
      setObstacles(currentObstacles => {
        currentObstacles.forEach(obs => {
          if (obs.lane === playerLane && obs.z > -2.5 && obs.z < 2.5) {
            setLives(l => {
              if (l <= 1) {
                setIsWin(false);
                setShowGameOver(true);
                setIsPlaying(false);
                return 0;
              }
              toast.error("💥 Va chạm! Mất 1 mạng");
              haptics.error();
              return l - 1;
            });
            setObstacles(o => o.filter(o => o.id !== obs.id));
          }
        });
        return currentObstacles;
      });

      // Check coin collection
      setCoins(currentCoins => {
        const remaining = currentCoins.filter(coin => {
          if (coin.lane === playerLane && coin.z > -1.5 && coin.z < 1.5) {
            setScore(s => s + 50);
            setEarnedCoins(c => c + 1);
            haptics.light();
            toast.success("+50 🪙");
            return false;
          }
          return true;
        });
        return remaining;
      });

      // Check boost collection
      setBoosts(currentBoosts => {
        const remaining = currentBoosts.filter(boost => {
          if (boost.lane === playerLane && boost.z > -1.5 && boost.z < 1.5) {
            setIsBoosted(true);
            setScore(s => s + 200);
            haptics.success();
            toast.success("⚡ BOOST ACTIVATED! +200");
            setTimeout(() => setIsBoosted(false), 5000);
            return false;
          }
          return true;
        });
        return remaining;
      });

      // Gradually increase speed
      gameSpeedRef.current = Math.min(gameSpeedRef.current + 0.0003, 0.6 + level * 0.05);

      // Update player position
      setPlayerPos(new THREE.Vector3(lanes[playerLane], 0.15, 0));
    }, 16);

    return () => clearInterval(gameLoop);
  }, [isPlaying, playerLane, isBoosted, baseSpeed, level, targetDistance, timeLeft, onLevelComplete]);

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setPlayerLane(l => Math.max(0, l - 1));
        haptics.light();
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setPlayerLane(l => Math.min(2, l + 1));
        haptics.light();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying]);

  const startGame = () => {
    setPlayerLane(1);
    setPlayerPos(new THREE.Vector3(0, 0.15, 0));
    setDistance(0);
    setScore(0);
    setEarnedCoins(0);
    setLives(3);
    setObstacles([]);
    setCoins([]);
    setBoosts([]);
    setCurrentSpeed(baseSpeed);
    setTopSpeed(baseSpeed);
    gameSpeedRef.current = 0.35;
    setIsBoosted(false);
    setTimeLeft(TIME_LIMIT);
    setIsPlaying(true);
    setShowGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full">
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => { localStorage.setItem("racing3d_v2_tutorial", "true"); setShowTutorial(false); }}
        onStart={() => { localStorage.setItem("racing3d_v2_tutorial", "true"); setShowTutorial(false); startGame(); }}
        level={level}
      />

      <GameOverModal
        isOpen={showGameOver}
        isWin={isWin}
        score={score}
        timeUsed={TIME_LIMIT - timeLeft}
        distance={Math.floor(distance)}
        coinsCollected={earnedCoins}
        topSpeed={topSpeed}
        onRestart={startGame}
        onHome={() => onBack?.()}
      />

      <div className="relative w-full aspect-video max-w-[900px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-green-400">
        {isPlaying && (
          <GameHUD
            score={score}
            timeLeft={timeLeft}
            level={level}
            lives={lives}
            speed={currentSpeed}
            distance={Math.floor(distance)}
            targetDistance={targetDistance}
            coinsCollected={earnedCoins}
            isBoosted={isBoosted}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5, 12], fov: 60 }}>
          <Suspense fallback={<Loader />}>
            <CameraFollow target={playerPos} speed={gameSpeedRef.current} />
            <Sky sunPosition={[100, 50, 100]} />
            <Environment preset="sunset" background={false} />
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[15, 25, 10]} 
              intensity={1.2} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={80}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              color="#FFF5E6"
            />
            <hemisphereLight intensity={0.4} color="#87CEEB" groundColor="#228B22" />

            {/* Roads */}
            {Array.from({ length: 6 }).map((_, i) => (
              <Road key={i} position={[0, 0, -i * 25 - ((distance * 0.5) % 25)]} />
            ))}

            {/* Scenery */}
            {Array.from({ length: 10 }).map((_, i) => (
              <Scenery key={`left-${i}`} side="left" zOffset={-i * 12 - ((distance * 0.5) % 12)} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <Scenery key={`right-${i}`} side="right" zOffset={-i * 12 - 6 - ((distance * 0.5) % 12)} />
            ))}

            {/* Player car */}
            <DetailedCar 
              position={[lanes[playerLane], 0.15, 0]} 
              rotation={0} 
              color="#FF0000" 
              isPlayer 
              speed={gameSpeedRef.current}
            />

            {/* Obstacle cars */}
            {obstacles.map(obs => (
              <DetailedCar 
                key={obs.id} 
                position={[lanes[obs.lane], 0.15, obs.z]} 
                rotation={Math.PI} 
                color={obs.color}
                speed={gameSpeedRef.current * 0.5}
              />
            ))}

            {/* Coins */}
            {coins.map(coin => (
              <RoadCoin key={coin.id} position={[lanes[coin.lane], 0.5, coin.z]} />
            ))}

            {/* Boosts */}
            {boosts.map(boost => (
              <BoostItem key={boost.id} position={[lanes[boost.lane], 0.5, boost.z]} onCollect={() => {}} />
            ))}

            {/* Finish line (when close) */}
            {distance > targetDistance - 100 && (
              <FinishLine position={[0, 0, -(targetDistance - distance) * 0.5]} />
            )}

            {/* Grass sides */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, -0.01, 0]}>
              <planeGeometry args={[15, 300]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.01, 0]}>
              <planeGeometry args={[15, 300]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>

            <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={50} blur={2} far={15} />
            <fog attach="fog" args={["#87CEEB", 30, 80]} />
          </Suspense>
        </Canvas>
        
        {!isPlaying && !showTutorial && !showGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="text-center bg-black/60 rounded-2xl p-8"
            >
              <div className="text-7xl mb-4">🏎️</div>
              <h2 className="text-3xl font-bold text-white mb-2">Đua Xe Siêu Tốc 3D</h2>
              <p className="text-white/70 mb-2">Level {level}</p>
              <p className="text-orange-400 mb-6">⏱️ 10 phút để hoàn thành {targetDistance}m</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => setShowTutorial(true)} 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Hướng dẫn
                </Button>
                <Button 
                  onClick={startGame} 
                  size="lg" 
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  🏁 Bắt đầu đua
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex gap-6 md:hidden">
        <Button 
          size="lg" 
          variant="outline" 
          className="h-20 w-28 touch-manipulation active:scale-95 bg-red-600/20 border-red-500/50"
          onTouchStart={() => { setPlayerLane(l => Math.max(0, l - 1)); haptics.light(); }} 
          disabled={!isPlaying}
        >
          <ArrowLeft className="h-10 w-10" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="h-20 w-28 touch-manipulation active:scale-95 bg-red-600/20 border-red-500/50"
          onTouchStart={() => { setPlayerLane(l => Math.min(2, l + 1)); haptics.light(); }} 
          disabled={!isPlaying}
        >
          <ArrowRightIcon className="h-10 w-10" />
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
          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Hướng dẫn
        </Button>
        <Button 
          onClick={startGame} 
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          {isPlaying ? "🔄 Đua lại" : "🏁 Bắt đầu"}
        </Button>
      </div>
    </div>
  );
}

export default Racing3D;
