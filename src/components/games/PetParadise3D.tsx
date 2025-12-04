import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  Float,
  Text,
  Sparkles
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Utensils, Droplets, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface PetParadise3DProps {
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
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading 3D... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface Pet {
  type: "dog" | "cat" | "bunny";
  hunger: number;
  thirst: number;
  happiness: number;
  mood: "happy" | "neutral" | "sad";
}

function Pet3D({ pet, isPlaying }: { pet: Pet; isPlaying: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.y = 1 + breathe;
      
      // Mood-based animation
      if (pet.mood === "happy") {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      } else if (pet.mood === "sad") {
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;
      }
    }
    
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.5;
    }
  });

  const colors = {
    dog: "#d4a574",
    cat: "#ff9f7f",
    bunny: "#f5f5f5"
  };

  const getMoodColor = () => {
    switch (pet.mood) {
      case "happy": return "#22c55e";
      case "sad": return "#ef4444";
      default: return "#fbbf24";
    }
  };

  return (
    <Float speed={1} rotationIntensity={0} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Body */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.5, 0.6, 4, 16]} />
          <meshStandardMaterial color={colors[pet.type]} metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.4, 0.2]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={colors[pet.type]} />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.12, 1.5, 0.5]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[0.12, 1.5, 0.5]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        
        {/* Nose */}
        <mesh position={[0, 1.35, 0.58]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Ears based on type */}
        {pet.type === "dog" && (
          <>
            <mesh position={[-0.25, 1.7, 0.1]} rotation={[0, 0, -0.3]}>
              <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
              <meshStandardMaterial color={colors[pet.type]} />
            </mesh>
            <mesh position={[0.25, 1.7, 0.1]} rotation={[0, 0, 0.3]}>
              <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
              <meshStandardMaterial color={colors[pet.type]} />
            </mesh>
          </>
        )}
        {pet.type === "cat" && (
          <>
            <mesh position={[-0.2, 1.75, 0.1]} rotation={[0.3, 0, -0.3]}>
              <coneGeometry args={[0.1, 0.25, 4]} />
              <meshStandardMaterial color={colors[pet.type]} />
            </mesh>
            <mesh position={[0.2, 1.75, 0.1]} rotation={[0.3, 0, 0.3]}>
              <coneGeometry args={[0.1, 0.25, 4]} />
              <meshStandardMaterial color={colors[pet.type]} />
            </mesh>
          </>
        )}
        {pet.type === "bunny" && (
          <>
            <mesh position={[-0.1, 1.9, 0]} rotation={[0.2, 0, 0]}>
              <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
              <meshStandardMaterial color="#ffcccc" />
            </mesh>
            <mesh position={[0.1, 1.9, 0]} rotation={[0.2, 0, 0]}>
              <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
              <meshStandardMaterial color="#ffcccc" />
            </mesh>
          </>
        )}
        
        {/* Tail */}
        <mesh ref={tailRef} position={[0, 0.4, -0.5]} rotation={[0.5, 0, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={colors[pet.type]} />
        </mesh>
        
        {/* Legs */}
        {[[-0.2, 0, 0.15], [0.2, 0, 0.15], [-0.2, 0, -0.15], [0.2, 0, -0.15]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.1, 0.2, 4, 8]} />
            <meshStandardMaterial color={colors[pet.type]} />
          </mesh>
        ))}
        
        {/* Mood indicator */}
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color={getMoodColor()}
            emissive={getMoodColor()}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {pet.mood === "happy" && (
          <Sparkles position={[0, 1.5, 0]} count={10} scale={2} size={3} color="#ffd700" />
        )}
      </group>
    </Float>
  );
}

function ActionButton3D({ 
  position, 
  icon, 
  color, 
  onClick,
  disabled
}: { 
  position: [number, number, number]; 
  icon: string;
  color: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered && !disabled ? 1.1 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15)
      );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
      <group position={position}>
        <mesh 
          ref={meshRef}
          onClick={() => !disabled && onClick()}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
        >
          <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
          <meshStandardMaterial 
            color={disabled ? "#666666" : color}
            metalness={0.3}
            roughness={0.6}
            emissive={disabled ? "#000000" : color}
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </mesh>
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.3}
          anchorX="center"
          anchorY="middle"
        >
          {icon}
        </Text>
      </group>
    </Float>
  );
}

function GameScene({
  pet,
  isPlaying,
  onFeed,
  onWater,
  onPlay,
  cooldowns
}: {
  pet: Pet;
  isPlaying: boolean;
  onFeed: () => void;
  onWater: () => void;
  onPlay: () => void;
  cooldowns: { feed: boolean; water: boolean; play: boolean };
}) {
  return (
    <>
      <Environment preset="park" background={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 3, 3]} intensity={0.3} color="#ff9ff3" />
      
      {/* Ground - grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>
      
      <Pet3D pet={pet} isPlaying={isPlaying} />
      
      {/* Action buttons */}
      <ActionButton3D 
        position={[-2, -0.3, 2]} 
        icon="🍖" 
        color="#f97316"
        onClick={onFeed}
        disabled={cooldowns.feed}
      />
      <ActionButton3D 
        position={[0, -0.3, 2.5]} 
        icon="💧" 
        color="#3b82f6"
        onClick={onWater}
        disabled={cooldowns.water}
      />
      <ActionButton3D 
        position={[2, -0.3, 2]} 
        icon="🎾" 
        color="#22c55e"
        onClick={onPlay}
        disabled={cooldowns.play}
      />
      
      <ContactShadows position={[0, -0.49, 0]} opacity={0.4} scale={10} blur={2} />
      <fog attach="fog" args={["#87ceeb", 8, 25]} />
    </>
  );
}

export function PetParadise3D({ level = 1, onLevelComplete, onBack }: PetParadise3DProps) {
  const petTypes: ("dog" | "cat" | "bunny")[] = ["dog", "cat", "bunny"];
  const targetHappiness = 80 + level * 5;
  
  const [pet, setPet] = useState<Pet>({
    type: petTypes[Math.floor(Math.random() * petTypes.length)],
    hunger: 50,
    thirst: 50,
    happiness: 50,
    mood: "neutral"
  });
  const [cooldowns, setCooldowns] = useState({ feed: false, water: false, play: false });
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);

  const updateMood = (hunger: number, thirst: number, happiness: number) => {
    const avg = (hunger + thirst + happiness) / 3;
    if (avg >= 70) return "happy";
    if (avg <= 30) return "sad";
    return "neutral";
  };

  const startGame = () => {
    setPet({
      type: petTypes[Math.floor(Math.random() * petTypes.length)],
      hunger: 50,
      thirst: 50,
      happiness: 50,
      mood: "neutral"
    });
    setCooldowns({ feed: false, water: false, play: false });
    setScore(0);
    setCoins(0);
    setTimeLeft(90);
    setIsPlaying(true);
    setShowGameOver(false);
  };

  // Stats decay
  useEffect(() => {
    if (!isPlaying) return;
    
    const decay = setInterval(() => {
      setPet(p => {
        const newHunger = Math.max(0, p.hunger - 2);
        const newThirst = Math.max(0, p.thirst - 3);
        const newHappiness = Math.max(0, p.happiness - 1);
        return {
          ...p,
          hunger: newHunger,
          thirst: newThirst,
          happiness: newHappiness,
          mood: updateMood(newHunger, newThirst, newHappiness)
        };
      });
    }, 2000);
    
    return () => clearInterval(decay);
  }, [isPlaying]);

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsWin(pet.happiness >= targetHappiness);
          setShowGameOver(true);
          setIsPlaying(false);
          if (pet.happiness >= targetHappiness) {
            onLevelComplete?.();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, pet.happiness, targetHappiness, onLevelComplete]);

  // Check for sad pet (game over)
  useEffect(() => {
    if (!isPlaying) return;
    if (pet.hunger <= 0 || pet.thirst <= 0 || pet.happiness <= 0) {
      toast.error("😢 Thú cưng không vui rồi!");
      setIsWin(false);
      setShowGameOver(true);
      setIsPlaying(false);
    }
  }, [pet, isPlaying]);

  const handleFeed = () => {
    if (cooldowns.feed) return;
    haptics.success();
    setPet(p => {
      const newHunger = Math.min(100, p.hunger + 30);
      const newHappiness = Math.min(100, p.happiness + 10);
      return {
        ...p,
        hunger: newHunger,
        happiness: newHappiness,
        mood: updateMood(newHunger, p.thirst, newHappiness)
      };
    });
    setScore(s => s + 50);
    setCoins(c => c + 25);
    toast.success("🍖 Cho ăn!");
    setCooldowns(c => ({ ...c, feed: true }));
    setTimeout(() => setCooldowns(c => ({ ...c, feed: false })), 3000);
  };

  const handleWater = () => {
    if (cooldowns.water) return;
    haptics.success();
    setPet(p => {
      const newThirst = Math.min(100, p.thirst + 30);
      const newHappiness = Math.min(100, p.happiness + 10);
      return {
        ...p,
        thirst: newThirst,
        happiness: newHappiness,
        mood: updateMood(p.hunger, newThirst, newHappiness)
      };
    });
    setScore(s => s + 50);
    setCoins(c => c + 25);
    toast.success("💧 Cho uống!");
    setCooldowns(c => ({ ...c, water: true }));
    setTimeout(() => setCooldowns(c => ({ ...c, water: false })), 3000);
  };

  const handlePlay = () => {
    if (cooldowns.play) return;
    haptics.success();
    setPet(p => {
      const newHappiness = Math.min(100, p.happiness + 25);
      const newHunger = Math.max(0, p.hunger - 5);
      const newThirst = Math.max(0, p.thirst - 5);
      return {
        ...p,
        hunger: newHunger,
        thirst: newThirst,
        happiness: newHappiness,
        mood: updateMood(newHunger, newThirst, newHappiness)
      };
    });
    setScore(s => s + 100);
    setCoins(c => c + 50);
    toast.success("🎾 Chơi vui quá!");
    setCooldowns(c => ({ ...c, play: true }));
    setTimeout(() => setCooldowns(c => ({ ...c, play: false })), 5000);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full">
      {showGameOver && (
        <Game3DGameOver
          isOpen={showGameOver}
          onClose={() => setShowGameOver(false)}
          onRestart={startGame}
          onHome={() => onBack?.()}
          isWin={isWin}
          score={score}
          coinsEarned={coins}
          level={level}
          stats={[
            { label: "Happiness", value: `${Math.round(pet.happiness)}%` },
            { label: "Target", value: `${targetHappiness}%` },
          ]}
        />
      )}

      <div className="relative w-full aspect-[4/3] max-w-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-300 to-green-200">
        {isPlaying && (
          <Game3DHUD
            score={score}
            level={level}
            coins={coins}
            timeLeft={timeLeft}
            targetScore={targetHappiness}
            isPaused={false}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3, 6], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene
              pet={pet}
              isPlaying={isPlaying}
              onFeed={handleFeed}
              onWater={handleWater}
              onPlay={handlePlay}
              cooldowns={cooldowns}
            />
          </Suspense>
        </Canvas>
        
        {/* Stats bars */}
        {isPlaying && (
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-white mb-1">
                <Utensils className="h-3 w-3" /> Hunger
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${pet.hunger}%` }}
                />
              </div>
            </div>
            <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-white mb-1">
                <Droplets className="h-3 w-3" /> Thirst
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${pet.thirst}%` }}
                />
              </div>
            </div>
            <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-white mb-1">
                <Heart className="h-3 w-3" /> Happy
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-500 transition-all"
                  style={{ width: `${pet.happiness}%` }}
                />
              </div>
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
              <div className="text-6xl mb-4">🐾</div>
              <h2 className="text-2xl font-bold text-white mb-2">Pet Paradise 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - Giữ happiness ≥ {targetHappiness}%</p>
              <Button onClick={startGame} size="lg" className="bg-pink-500 hover:bg-pink-600">
                Bắt đầu
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile action buttons */}
      {isPlaying && (
        <div className="flex gap-3 md:hidden">
          <Button 
            onClick={handleFeed} 
            disabled={cooldowns.feed}
            className="bg-orange-500 hover:bg-orange-600"
          >
            🍖 Cho ăn
          </Button>
          <Button 
            onClick={handleWater} 
            disabled={cooldowns.water}
            className="bg-blue-500 hover:bg-blue-600"
          >
            💧 Cho uống
          </Button>
          <Button 
            onClick={handlePlay} 
            disabled={cooldowns.play}
            className="bg-green-500 hover:bg-green-600"
          >
            🎾 Chơi
          </Button>
        </div>
      )}

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

export default PetParadise3D;
