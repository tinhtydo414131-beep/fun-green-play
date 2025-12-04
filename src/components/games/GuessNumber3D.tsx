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
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface GuessNumber3DProps {
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
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading 3D... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

function MysteryBox({ hint, shake }: { hint: "higher" | "lower" | "correct" | null; shake: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const shakeOffset = useRef(0);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      if (shake) {
        shakeOffset.current = Math.sin(state.clock.elapsedTime * 50) * 0.1;
        meshRef.current.position.x = shakeOffset.current;
      } else {
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, 0.1);
      }
      
      // Pulse based on hint
      const scale = hint === "correct" ? 1.2 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const boxColor = hint === "higher" ? "#ef4444" : hint === "lower" ? "#3b82f6" : hint === "correct" ? "#22c55e" : "#a855f7";

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color={boxColor}
            metalness={0.3}
            roughness={0.6}
            emissive={boxColor}
            emissiveIntensity={hint === "correct" ? 0.5 : 0.1}
          />
        </mesh>
        
        {/* Question mark */}
        <Text
          position={[0, 0, 1.01]}
          fontSize={1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {hint === "correct" ? "✓" : "?"}
        </Text>
        
        {hint === "correct" && (
          <Sparkles count={50} scale={4} size={3} color="#ffd700" />
        )}
      </group>
    </Float>
  );
}

function HintArrow({ direction }: { direction: "up" | "down" | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && direction) {
      const bounce = Math.sin(state.clock.elapsedTime * 5) * 0.3;
      meshRef.current.position.y = (direction === "up" ? 2 : -2) + bounce;
    }
  });

  if (!direction) return null;

  return (
    <mesh ref={meshRef} rotation={[0, 0, direction === "up" ? 0 : Math.PI]}>
      <coneGeometry args={[0.5, 1, 8]} />
      <meshStandardMaterial 
        color={direction === "up" ? "#ef4444" : "#3b82f6"}
        emissive={direction === "up" ? "#ef4444" : "#3b82f6"}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function GameScene({ hint, shake }: { hint: "higher" | "lower" | "correct" | null; shake: boolean }) {
  return (
    <>
      <Environment preset="night" background={false} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#a855f7" />
      
      <MysteryBox hint={hint} shake={shake} />
      <HintArrow direction={hint === "higher" ? "up" : hint === "lower" ? "down" : null} />
      
      <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} />
      <fog attach="fog" args={["#0c0a1d", 5, 20]} />
      <Sparkles count={100} scale={15} size={1} color="#a855f7" opacity={0.3} />
    </>
  );
}

export function GuessNumber3D({ level = 1, onLevelComplete, onBack }: GuessNumber3DProps) {
  const maxNumber = 50 + level * 50;
  const maxAttempts = Math.max(5, 10 - level);
  
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState<"higher" | "lower" | "correct" | null>(null);
  const [shake, setShake] = useState(false);
  const [history, setHistory] = useState<{ guess: number; hint: string }[]>([]);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const startGame = () => {
    const newTarget = Math.floor(Math.random() * maxNumber) + 1;
    setTargetNumber(newTarget);
    setAttempts(0);
    setGuess("");
    setHint(null);
    setHistory([]);
    setScore(0);
    setCoins(0);
    setIsPlaying(true);
    setShowGameOver(false);
  };

  const handleGuess = () => {
    const guessNum = parseInt(guess);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > maxNumber) {
      toast.error(`Nhập số từ 1 đến ${maxNumber}!`);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    setShake(true);
    setTimeout(() => setShake(false), 500);

    if (guessNum === targetNumber) {
      haptics.success();
      setHint("correct");
      const earnedScore = (maxAttempts - newAttempts + 1) * 100;
      const earnedCoins = earnedScore * 5;
      setScore(earnedScore);
      setCoins(earnedCoins);
      setIsWin(true);
      setHistory(prev => [...prev, { guess: guessNum, hint: "✓ Đúng!" }]);
      toast.success("🎉 Chính xác!");
      setTimeout(() => {
        setShowGameOver(true);
        setIsPlaying(false);
        onLevelComplete?.();
      }, 1500);
    } else if (guessNum < targetNumber) {
      haptics.light();
      setHint("higher");
      setHistory(prev => [...prev, { guess: guessNum, hint: "↑ Cao hơn" }]);
    } else {
      haptics.light();
      setHint("lower");
      setHistory(prev => [...prev, { guess: guessNum, hint: "↓ Thấp hơn" }]);
    }

    setGuess("");

    if (newAttempts >= maxAttempts && guessNum !== targetNumber) {
      haptics.error();
      toast.error(`Hết lượt! Số đúng là ${targetNumber}`);
      setIsWin(false);
      setTimeout(() => {
        setShowGameOver(true);
        setIsPlaying(false);
      }, 1000);
    }
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
            { label: "Lượt đoán", value: attempts },
            { label: "Số đúng", value: targetNumber },
          ]}
        />
      )}

      <div className="relative w-full aspect-square max-w-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-indigo-900 to-purple-950">
        {isPlaying && (
          <Game3DHUD
            score={score}
            level={level}
            lives={maxAttempts - attempts}
            maxLives={maxAttempts}
            coins={coins}
            isPaused={false}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene hint={hint} shake={shake} />
          </Suspense>
        </Canvas>
        
        {/* Guess history */}
        {isPlaying && history.length > 0 && (
          <div className="absolute top-16 left-2 max-h-32 overflow-y-auto">
            {history.slice(-5).map((h, i) => (
              <div key={i} className={`text-xs px-2 py-1 rounded mb-1 ${
                h.hint.includes("Đúng") ? "bg-green-500/80" :
                h.hint.includes("Cao") ? "bg-red-500/50" : "bg-blue-500/50"
              } text-white`}>
                {h.guess} {h.hint}
              </div>
            ))}
          </div>
        )}
        
        {/* Input area */}
        {isPlaying && hint !== "correct" && (
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <Input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              placeholder={`1 - ${maxNumber}`}
              className="bg-white/90 text-black"
              min={1}
              max={maxNumber}
            />
            <Button onClick={handleGuess} className="bg-purple-500 hover:bg-purple-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {!isPlaying && !showGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🔢</div>
              <h2 className="text-2xl font-bold text-white mb-2">Guess Number 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - Đoán số 1-{maxNumber}</p>
              <Button onClick={startGame} size="lg" className="bg-purple-500 hover:bg-purple-600">
                Bắt đầu
              </Button>
            </motion.div>
          </div>
        )}
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

export default GuessNumber3D;
