import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  Float,
  Cloud,
  Sparkles,
  RoundedBox
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface SkyCastle3DProps {
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
            className="h-full bg-gradient-to-r from-sky-400 to-blue-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading 3D... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface CastleBlock {
  id: number;
  position: [number, number, number];
  type: "stone" | "wood" | "gold" | "crystal";
  size: [number, number, number];
}

function CastleBlock3D({ 
  block, 
  isSelected,
  onClick 
}: { 
  block: CastleBlock; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.05 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15)
      );
      
      if (isSelected) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
  });

  const colors = {
    stone: "#78716c",
    wood: "#a3866a",
    gold: "#fbbf24",
    crystal: "#67e8f9"
  };

  return (
    <mesh
      ref={meshRef}
      position={block.position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={block.size} />
      <meshStandardMaterial 
        color={colors[block.type]}
        metalness={block.type === "gold" ? 0.8 : block.type === "crystal" ? 0.5 : 0.2}
        roughness={block.type === "crystal" ? 0.1 : 0.7}
        emissive={isSelected ? colors[block.type] : "#000000"}
        emissiveIntensity={isSelected ? 0.3 : 0}
        transparent={block.type === "crystal"}
        opacity={block.type === "crystal" ? 0.8 : 1}
      />
    </mesh>
  );
}

function BuildButton3D({ 
  position, 
  type, 
  cost,
  canAfford,
  onClick 
}: { 
  position: [number, number, number]; 
  type: string;
  cost: number;
  canAfford: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  
  const icons = {
    stone: "🪨",
    wood: "🪵",
    gold: "💎",
    crystal: "✨"
  };

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
      <group 
        position={position}
        onClick={() => canAfford && onClick()}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <RoundedBox 
          args={[1, 0.6, 0.2]} 
          radius={0.1} 
          smoothness={4}
          scale={hovered && canAfford ? 1.1 : 1}
        >
          <meshStandardMaterial 
            color={canAfford ? "#4f46e5" : "#6b7280"}
            metalness={0.3}
            roughness={0.6}
            emissive={canAfford && hovered ? "#4f46e5" : "#000000"}
            emissiveIntensity={0.2}
          />
        </RoundedBox>
        <Html position={[0, 0, 0.15]} center>
          <div className={`text-center ${canAfford ? "text-white" : "text-gray-400"}`}>
            <div className="text-lg">{icons[type as keyof typeof icons]}</div>
            <div className="text-xs">{cost}💰</div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function FloatingIsland() {
  return (
    <group position={[0, -2, 0]}>
      {/* Top grass */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[6, 5, 0.3, 32]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>
      {/* Middle earth */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[5, 4, 1, 32]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>
      {/* Bottom rock */}
      <mesh position={[0, -1.5, 0]}>
        <coneGeometry args={[4, 2, 32]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </mesh>
    </group>
  );
}

function GameScene({
  blocks,
  selectedBlock,
  coins,
  onBlockClick,
  onBuildBlock,
}: {
  blocks: CastleBlock[];
  selectedBlock: number | null;
  coins: number;
  onBlockClick: (id: number) => void;
  onBuildBlock: (type: "stone" | "wood" | "gold" | "crystal") => void;
}) {
  const buildCosts = { stone: 10, wood: 20, gold: 50, crystal: 100 };

  return (
    <>
      <Environment preset="sunset" background={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#fbbf24" />
      
      {/* Sky background elements */}
      <Cloud position={[-15, 5, -10]} speed={0.2} opacity={0.5} />
      <Cloud position={[15, 8, -15]} speed={0.3} opacity={0.4} />
      <Cloud position={[0, 12, -20]} speed={0.1} opacity={0.6} />
      
      <FloatingIsland />
      
      {/* Castle blocks */}
      {blocks.map(block => (
        <CastleBlock3D
          key={block.id}
          block={block}
          isSelected={selectedBlock === block.id}
          onClick={() => onBlockClick(block.id)}
        />
      ))}
      
      {/* Build buttons */}
      <group position={[0, -3.5, 4]}>
        <BuildButton3D 
          position={[-2, 0, 0]} 
          type="stone" 
          cost={buildCosts.stone}
          canAfford={coins >= buildCosts.stone}
          onClick={() => onBuildBlock("stone")}
        />
        <BuildButton3D 
          position={[-0.7, 0, 0]} 
          type="wood" 
          cost={buildCosts.wood}
          canAfford={coins >= buildCosts.wood}
          onClick={() => onBuildBlock("wood")}
        />
        <BuildButton3D 
          position={[0.7, 0, 0]} 
          type="gold" 
          cost={buildCosts.gold}
          canAfford={coins >= buildCosts.gold}
          onClick={() => onBuildBlock("gold")}
        />
        <BuildButton3D 
          position={[2, 0, 0]} 
          type="crystal" 
          cost={buildCosts.crystal}
          canAfford={coins >= buildCosts.crystal}
          onClick={() => onBuildBlock("crystal")}
        />
      </group>
      
      <Sparkles count={50} scale={20} size={2} color="#fbbf24" opacity={0.3} />
      <ContactShadows position={[0, -1.8, 0]} opacity={0.5} scale={15} blur={2} />
      <fog attach="fog" args={["#87ceeb", 10, 40]} />
    </>
  );
}

export function SkyCastle3D({ level = 1, onLevelComplete, onBack }: SkyCastle3DProps) {
  const targetBlocks = 10 + level * 5;
  const buildCosts = { stone: 10, wood: 20, gold: 50, crystal: 100 };
  const blockPoints = { stone: 10, wood: 25, gold: 75, crystal: 150 };
  
  const [blocks, setBlocks] = useState<CastleBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [coins, setCoins] = useState(200);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [nextBlockId, setNextBlockId] = useState(0);

  const startGame = () => {
    setBlocks([]);
    setSelectedBlock(null);
    setCoins(200);
    setScore(0);
    setNextBlockId(0);
    setTimeLeft(120);
    setIsPlaying(true);
    setShowGameOver(false);
  };

  // Coin generation
  useEffect(() => {
    if (!isPlaying) return;
    
    const coinGen = setInterval(() => {
      setCoins(c => c + 5 + Math.floor(blocks.length / 3));
    }, 2000);
    
    return () => clearInterval(coinGen);
  }, [isPlaying, blocks.length]);

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsWin(blocks.length >= targetBlocks);
          setShowGameOver(true);
          setIsPlaying(false);
          if (blocks.length >= targetBlocks) {
            onLevelComplete?.();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, blocks.length, targetBlocks, onLevelComplete]);

  const getNextPosition = useCallback((): [number, number, number] => {
    if (blocks.length === 0) {
      return [0, -1.3, 0];
    }
    
    // Try to stack on top of existing blocks
    const gridSize = 4;
    const positions: [number, number, number][] = [];
    
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const blocksAtPos = blocks.filter(
          b => Math.abs(b.position[0] - x) < 0.5 && Math.abs(b.position[2] - z) < 0.5
        );
        const maxY = blocksAtPos.reduce((max, b) => Math.max(max, b.position[1] + b.size[1]), -1.3);
        positions.push([x, maxY, z]);
      }
    }
    
    // Prefer lower positions for stability
    positions.sort((a, b) => a[1] - b[1]);
    
    // Add some randomness
    const index = Math.floor(Math.random() * Math.min(5, positions.length));
    return positions[index];
  }, [blocks]);

  const handleBuildBlock = (type: "stone" | "wood" | "gold" | "crystal") => {
    if (coins < buildCosts[type]) {
      toast.error("Không đủ xu!");
      return;
    }
    
    haptics.success();
    
    const position = getNextPosition();
    const sizes: Record<string, [number, number, number]> = {
      stone: [1, 0.5, 1],
      wood: [1.2, 0.4, 1.2],
      gold: [0.8, 0.6, 0.8],
      crystal: [0.6, 0.8, 0.6]
    };
    
    const newBlock: CastleBlock = {
      id: nextBlockId,
      position,
      type,
      size: sizes[type]
    };
    
    setBlocks(prev => [...prev, newBlock]);
    setCoins(c => c - buildCosts[type]);
    setScore(s => s + blockPoints[type]);
    setNextBlockId(id => id + 1);
    
    toast.success(`🏰 +${blockPoints[type]} điểm!`);
    
    // Check win
    if (blocks.length + 1 >= targetBlocks) {
      toast.success("🏰 Lâu đài hoàn thành!");
      setIsWin(true);
      setShowGameOver(true);
      setIsPlaying(false);
      onLevelComplete?.();
    }
  };

  const handleBlockClick = (id: number) => {
    setSelectedBlock(selectedBlock === id ? null : id);
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
          coinsEarned={score}
          level={level}
          stats={[
            { label: "Blocks", value: `${blocks.length}/${targetBlocks}` },
            { label: "Height", value: Math.max(...blocks.map(b => b.position[1]), 0).toFixed(1) },
          ]}
        />
      )}

      <div className="relative w-full aspect-[4/3] max-w-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500">
        {isPlaying && (
          <>
            <Game3DHUD
              score={score}
              level={level}
              coins={coins}
              timeLeft={timeLeft}
              targetScore={targetBlocks * 10}
              isPaused={false}
            />
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                🏰 {blocks.length}/{targetBlocks} blocks
              </div>
            </div>
          </>
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [8, 6, 8], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene
              blocks={blocks}
              selectedBlock={selectedBlock}
              coins={coins}
              onBlockClick={handleBlockClick}
              onBuildBlock={handleBuildBlock}
            />
          </Suspense>
        </Canvas>
        
        {!isPlaying && !showGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🏰</div>
              <h2 className="text-2xl font-bold text-white mb-2">Sky Castle 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - Xây {targetBlocks} blocks</p>
              <Button onClick={startGame} size="lg" className="bg-sky-500 hover:bg-sky-600">
                Bắt đầu
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile build buttons */}
      {isPlaying && (
        <div className="flex gap-2 md:hidden flex-wrap justify-center">
          <Button 
            onClick={() => handleBuildBlock("stone")} 
            disabled={coins < buildCosts.stone}
            variant="outline"
            className="flex items-center gap-1"
          >
            🪨 {buildCosts.stone}💰
          </Button>
          <Button 
            onClick={() => handleBuildBlock("wood")} 
            disabled={coins < buildCosts.wood}
            variant="outline"
            className="flex items-center gap-1"
          >
            🪵 {buildCosts.wood}💰
          </Button>
          <Button 
            onClick={() => handleBuildBlock("gold")} 
            disabled={coins < buildCosts.gold}
            variant="outline"
            className="flex items-center gap-1"
          >
            💎 {buildCosts.gold}💰
          </Button>
          <Button 
            onClick={() => handleBuildBlock("crystal")} 
            disabled={coins < buildCosts.crystal}
            variant="outline"
            className="flex items-center gap-1"
          >
            ✨ {buildCosts.crystal}💰
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

export default SkyCastle3D;
