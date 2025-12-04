import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  RoundedBox
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface SimonSays3DProps {
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
            className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading 3D... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

const COLORS = [
  { name: "red", color: "#ef4444", activeColor: "#fca5a5", position: [-1.2, 1.2, 0] as [number, number, number] },
  { name: "blue", color: "#3b82f6", activeColor: "#93c5fd", position: [1.2, 1.2, 0] as [number, number, number] },
  { name: "yellow", color: "#eab308", activeColor: "#fde047", position: [-1.2, -1.2, 0] as [number, number, number] },
  { name: "green", color: "#22c55e", activeColor: "#86efac", position: [1.2, -1.2, 0] as [number, number, number] },
];

interface SimonButton3DProps {
  colorData: typeof COLORS[0];
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function SimonButton3D({ colorData, isActive, isDisabled, onClick }: SimonButton3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isActive ? 1.15 : hovered && !isDisabled ? 1.05 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.2)
      );
      const targetZ = isActive ? 0.3 : 0;
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.2);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={colorData.position}
      onClick={() => !isDisabled && onClick()}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[2, 2, 0.4]} radius={0.2} smoothness={4}>
        <meshStandardMaterial 
          color={isActive ? colorData.activeColor : colorData.color}
          metalness={0.2}
          roughness={0.6}
          emissive={isActive ? colorData.activeColor : "#000000"}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </RoundedBox>
    </mesh>
  );
}

function CenterOrb({ isPlaying, isShowingSequence }: { isPlaying: boolean; isShowingSequence: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulseScale = isShowingSequence ? 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.1 : 1;
      meshRef.current.scale.setScalar(pulseScale);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.3]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color={isShowingSequence ? "#a855f7" : isPlaying ? "#8b5cf6" : "#6b7280"}
        metalness={0.8}
        roughness={0.2}
        emissive={isShowingSequence ? "#a855f7" : "#000000"}
        emissiveIntensity={isShowingSequence ? 0.5 : 0}
      />
    </mesh>
  );
}

function GameScene({
  activeButton,
  isDisabled,
  isPlaying,
  isShowingSequence,
  onButtonClick,
}: {
  activeButton: number | null;
  isDisabled: boolean;
  isPlaying: boolean;
  isShowingSequence: boolean;
  onButtonClick: (index: number) => void;
}) {
  return (
    <>
      <Environment preset="city" background={false} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#a855f7" />
      
      {COLORS.map((colorData, index) => (
        <SimonButton3D
          key={colorData.name}
          colorData={colorData}
          isActive={activeButton === index}
          isDisabled={isDisabled}
          onClick={() => onButtonClick(index)}
        />
      ))}
      
      <CenterOrb isPlaying={isPlaying} isShowingSequence={isShowingSequence} />
      
      <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={10} blur={2} />
      <fog attach="fog" args={["#0f172a", 5, 20]} />
    </>
  );
}

export function SimonSays3D({ level = 1, onLevelComplete, onBack }: SimonSays3DProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const targetRounds = 5 + level * 2;

  const playSound = (index: number) => {
    // Sound frequencies for each button
    const frequencies = [261.63, 329.63, 392.0, 523.25];
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequencies[index];
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Audio not available");
    }
  };

  const showSequence = useCallback(async (seq: number[]) => {
    setIsShowingSequence(true);
    setIsPlayerTurn(false);
    
    await new Promise(r => setTimeout(r, 500));
    
    for (let i = 0; i < seq.length; i++) {
      setActiveButton(seq[i]);
      playSound(seq[i]);
      await new Promise(r => setTimeout(r, 400));
      setActiveButton(null);
      await new Promise(r => setTimeout(r, 200));
    }
    
    setIsShowingSequence(false);
    setIsPlayerTurn(true);
  }, []);

  const addToSequence = useCallback(() => {
    const newButton = Math.floor(Math.random() * 4);
    const newSequence = [...sequence, newButton];
    setSequence(newSequence);
    setPlayerSequence([]);
    setRound(r => r + 1);
    showSequence(newSequence);
  }, [sequence, showSequence]);

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setCoins(0);
    setRound(0);
    setIsPlaying(true);
    setShowGameOver(false);
    
    // Start with first button
    const firstButton = Math.floor(Math.random() * 4);
    setSequence([firstButton]);
    setRound(1);
    setTimeout(() => showSequence([firstButton]), 500);
  };

  const handleButtonClick = (index: number) => {
    if (!isPlayerTurn || isShowingSequence) return;
    
    haptics.light();
    setActiveButton(index);
    playSound(index);
    setTimeout(() => setActiveButton(null), 200);
    
    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);
    
    // Check if correct
    const currentIndex = newPlayerSequence.length - 1;
    if (sequence[currentIndex] !== index) {
      // Wrong!
      haptics.error();
      toast.error("❌ Sai rồi!");
      setIsWin(false);
      setShowGameOver(true);
      setIsPlaying(false);
      return;
    }
    
    // Check if completed sequence
    if (newPlayerSequence.length === sequence.length) {
      haptics.success();
      setScore(s => s + round * 100);
      setCoins(c => c + round * 50);
      
      if (round >= targetRounds) {
        toast.success("🎉 Tuyệt vời! Hoàn thành!");
        setIsWin(true);
        setShowGameOver(true);
        setIsPlaying(false);
        onLevelComplete?.();
      } else {
        toast.success(`✅ Đúng rồi! Round ${round + 1}`);
        setTimeout(addToSequence, 1000);
      }
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
            { label: "Rounds", value: round },
            { label: "Target", value: targetRounds },
          ]}
        />
      )}

      <div className="relative w-full aspect-square max-w-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-950">
        {isPlaying && (
          <Game3DHUD
            score={score}
            level={level}
            coins={coins}
            combo={round}
            targetScore={targetRounds * 100}
            isPaused={false}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene
              activeButton={activeButton}
              isDisabled={!isPlayerTurn || isShowingSequence}
              isPlaying={isPlaying}
              isShowingSequence={isShowingSequence}
              onButtonClick={handleButtonClick}
            />
          </Suspense>
        </Canvas>
        
        {/* Status indicator */}
        {isPlaying && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className={`px-4 py-2 rounded-full text-white text-sm font-medium ${
              isShowingSequence ? "bg-purple-500 animate-pulse" : "bg-green-500"
            }`}>
              {isShowingSequence ? "👀 Xem kỹ nhé..." : "👆 Lượt của bạn!"}
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
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-white mb-2">Simon Says 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - {targetRounds} rounds</p>
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

export default SimonSays3D;
