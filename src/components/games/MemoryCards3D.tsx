import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  Float,
  Text,
  RoundedBox
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface MemoryCards3DProps {
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

const CARD_EMOJIS = ["🌟", "🎮", "🎨", "🎵", "🎪", "🎭", "🎯", "🎲", "🌈", "🦄", "🍀", "💎"];

interface Card3DProps {
  position: [number, number, number];
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

function Card3D({ position, emoji, isFlipped, isMatched, onClick }: Card3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  
  useEffect(() => {
    targetRotation.current = isFlipped ? Math.PI : 0;
  }, [isFlipped]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation.current,
        0.1
      );
      
      if (isMatched) {
        meshRef.current.position.y = THREE.MathUtils.lerp(
          meshRef.current.position.y,
          position[1] + 0.3,
          0.05
        );
      }
    }
  });

  return (
    <group ref={meshRef} position={position} onClick={onClick}>
      {/* Card back */}
      <RoundedBox args={[1, 1.4, 0.1]} radius={0.05} smoothness={4} position={[0, 0, -0.05]}>
        <meshStandardMaterial 
          color={isMatched ? "#22c55e" : "#8b5cf6"} 
          metalness={0.3} 
          roughness={0.7}
        />
      </RoundedBox>
      
      {/* Card front */}
      <RoundedBox args={[1, 1.4, 0.1]} radius={0.05} smoothness={4} position={[0, 0, 0.05]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
      </RoundedBox>
      
      {/* Emoji on front */}
      <Text
        position={[0, 0, 0.12]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        {emoji}
      </Text>
      
      {/* Question mark on back */}
      <Text
        position={[0, 0, -0.12]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        ?
      </Text>
    </group>
  );
}

function GameScene({
  cards,
  flippedCards,
  matchedPairs,
  onCardClick,
  gridCols,
}: {
  cards: { id: number; emoji: string }[];
  flippedCards: number[];
  matchedPairs: number[];
  onCardClick: (id: number) => void;
  gridCols: number;
}) {
  const gridRows = Math.ceil(cards.length / gridCols);
  const cardSpacingX = 1.3;
  const cardSpacingY = 1.7;
  const offsetX = ((gridCols - 1) * cardSpacingX) / 2;
  const offsetY = ((gridRows - 1) * cardSpacingY) / 2;

  return (
    <>
      <Environment preset="studio" background={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      
      {cards.map((card, index) => {
        const col = index % gridCols;
        const row = Math.floor(index / gridCols);
        const x = col * cardSpacingX - offsetX;
        const y = -row * cardSpacingY + offsetY;
        
        return (
          <Card3D
            key={card.id}
            position={[x, y, 0]}
            emoji={card.emoji}
            isFlipped={flippedCards.includes(card.id) || matchedPairs.includes(card.id)}
            isMatched={matchedPairs.includes(card.id)}
            onClick={() => onCardClick(card.id)}
          />
        );
      })}
      
      <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={15} blur={2} />
      <fog attach="fog" args={["#1a1a2e", 5, 20]} />
    </>
  );
}

export function MemoryCards3D({ level = 1, onLevelComplete, onBack }: MemoryCards3DProps) {
  const pairCount = Math.min(6 + level, 12);
  const gridCols = pairCount <= 6 ? 4 : pairCount <= 9 ? 6 : 6;
  
  const [cards, setCards] = useState<{ id: number; emoji: string }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 + level * 15);
  const [isChecking, setIsChecking] = useState(false);

  const initializeGame = useCallback(() => {
    const selectedEmojis = CARD_EMOJIS.slice(0, pairCount);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    const shuffled = cardPairs
      .map((emoji, i) => ({ id: i, emoji, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, i) => ({ id: i, emoji: item.emoji }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setScore(0);
    setCoins(0);
    setCombo(0);
    setTimeLeft(60 + level * 15);
    setIsPlaying(true);
    setShowGameOver(false);
  }, [pairCount, level]);

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

  // Check for win
  useEffect(() => {
    if (matchedPairs.length === cards.length && cards.length > 0) {
      toast.success("🎉 Tuyệt vời! Hoàn thành!");
      haptics.success();
      setIsWin(true);
      setShowGameOver(true);
      setIsPlaying(false);
      onLevelComplete?.();
    }
  }, [matchedPairs, cards.length, onLevelComplete]);

  const handleCardClick = (cardId: number) => {
    if (!isPlaying || isChecking) return;
    if (flippedCards.includes(cardId) || matchedPairs.includes(cardId)) return;
    if (flippedCards.length >= 2) return;

    haptics.light();
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);
      
      const [first, second] = newFlipped;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, first, second]);
          setFlippedCards([]);
          setScore(s => s + 100 * (combo + 1));
          setCoins(c => c + 50 * (combo + 1));
          setCombo(c => c + 1);
          setIsChecking(false);
          haptics.success();
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
          setCombo(0);
          setIsChecking(false);
        }, 1000);
      }
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
            { label: "Moves", value: moves },
            { label: "Time", value: `${timeLeft}s` },
          ]}
        />
      )}

      <div className="relative w-full aspect-[4/3] max-w-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-purple-900 to-indigo-950">
        {isPlaying && (
          <Game3DHUD
            score={score}
            level={level}
            coins={coins}
            combo={combo}
            timeLeft={timeLeft}
            isPaused={false}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene
              cards={cards}
              flippedCards={flippedCards}
              matchedPairs={matchedPairs}
              onCardClick={handleCardClick}
              gridCols={gridCols}
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
              <div className="text-6xl mb-4">🃏</div>
              <h2 className="text-2xl font-bold text-white mb-2">Memory Cards 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - {pairCount} cặp</p>
              <Button onClick={initializeGame} size="lg" className="bg-purple-500 hover:bg-purple-600">
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

export default MemoryCards3D;
