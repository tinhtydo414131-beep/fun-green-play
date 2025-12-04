import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  Float,
  Text,
  RoundedBox,
  Sparkles
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface WordScramble3DProps {
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
            className="h-full bg-gradient-to-r from-orange-400 to-red-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading 3D... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

const WORDS_BY_LEVEL = [
  ["CAT", "DOG", "SUN", "FUN", "RUN"],
  ["LOVE", "GAME", "PLAY", "STAR", "MOON"],
  ["HAPPY", "MUSIC", "DANCE", "SMILE", "DREAM"],
  ["PLANET", "WONDER", "FRIEND", "FLOWER", "DRAGON"],
  ["RAINBOW", "HOLIDAY", "UNICORN", "MAGICAL", "MYSTERY"],
];

interface LetterBlock3DProps {
  letter: string;
  position: [number, number, number];
  isSelected: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
  index: number;
}

function LetterBlock3D({ letter, position, isSelected, isCorrect, onClick, index }: LetterBlock3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      
      // Scale on hover/select
      const targetScale = isSelected ? 1.2 : hovered ? 1.1 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15)
      );
      
      // Rotation when selected
      if (isSelected) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.2;
      } else {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
      }
    }
  });

  const color = isCorrect === true ? "#22c55e" : isCorrect === false ? "#ef4444" : isSelected ? "#fbbf24" : "#6366f1";

  return (
    <Float speed={0.5} rotationIntensity={0} floatIntensity={0}>
      <group 
        ref={meshRef} 
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <RoundedBox args={[0.9, 0.9, 0.3]} radius={0.1} smoothness={4} castShadow>
          <meshStandardMaterial 
            color={color}
            metalness={0.2}
            roughness={0.6}
            emissive={color}
            emissiveIntensity={isSelected ? 0.3 : 0.1}
          />
        </RoundedBox>
        
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {letter}
        </Text>
        
        {isCorrect === true && (
          <Sparkles count={10} scale={1.5} size={3} color="#ffd700" />
        )}
      </group>
    </Float>
  );
}

function AnswerSlots({ answer, wordLength }: { answer: string; wordLength: number }) {
  const slots = [];
  for (let i = 0; i < wordLength; i++) {
    const hasLetter = i < answer.length;
    slots.push(
      <group key={i} position={[(i - (wordLength - 1) / 2) * 1.1, -2.5, 0]}>
        <RoundedBox args={[0.9, 0.9, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial 
            color={hasLetter ? "#22c55e" : "#374151"}
            metalness={0.1}
            roughness={0.9}
          />
        </RoundedBox>
        {hasLetter && (
          <Text
            position={[0, 0, 0.1]}
            fontSize={0.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {answer[i]}
          </Text>
        )}
      </group>
    );
  }
  return <>{slots}</>;
}

function GameScene({
  scrambledLetters,
  selectedIndices,
  answer,
  wordLength,
  isCorrect,
  onLetterClick,
}: {
  scrambledLetters: string[];
  selectedIndices: number[];
  answer: string;
  wordLength: number;
  isCorrect: boolean | null;
  onLetterClick: (index: number) => void;
}) {
  const letterSpacing = 1.1;
  const startX = -((scrambledLetters.length - 1) * letterSpacing) / 2;

  return (
    <>
      <Environment preset="warehouse" background={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 3, 3]} intensity={0.5} color="#f97316" />
      
      {scrambledLetters.map((letter, index) => {
        const isSelected = selectedIndices.includes(index);
        return (
          <LetterBlock3D
            key={index}
            letter={letter}
            position={[startX + index * letterSpacing, 0, 0]}
            isSelected={isSelected}
            isCorrect={isCorrect}
            onClick={() => onLetterClick(index)}
            index={index}
          />
        );
      })}
      
      <AnswerSlots answer={answer} wordLength={wordLength} />
      
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={15} blur={2} />
      <fog attach="fog" args={["#1f1f1f", 5, 20]} />
    </>
  );
}

export function WordScramble3D({ level = 1, onLevelComplete, onBack }: WordScramble3DProps) {
  const wordList = WORDS_BY_LEVEL[Math.min(level - 1, WORDS_BY_LEVEL.length - 1)];
  const wordsToSolve = Math.min(3 + level, 8);
  
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wordsSolved, setWordsSolved] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 + level * 20);

  const scrambleWord = (word: string): string[] => {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    // Make sure it's actually scrambled
    if (letters.join("") === word) {
      [letters[0], letters[1]] = [letters[1], letters[0]];
    }
    return letters;
  };

  const loadNewWord = useCallback(() => {
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(word);
    setScrambledLetters(scrambleWord(word));
    setSelectedIndices([]);
    setAnswer("");
    setIsCorrect(null);
  }, [wordList]);

  const startGame = () => {
    setWordsSolved(0);
    setScore(0);
    setCoins(0);
    setCombo(0);
    setTimeLeft(60 + level * 20);
    setIsPlaying(true);
    setShowGameOver(false);
    loadNewWord();
  };

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsWin(wordsSolved >= wordsToSolve);
          setShowGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, wordsSolved, wordsToSolve]);

  const handleLetterClick = (index: number) => {
    if (!isPlaying || isCorrect !== null) return;
    if (selectedIndices.includes(index)) return;

    haptics.light();
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);
    const newAnswer = answer + scrambledLetters[index];
    setAnswer(newAnswer);

    // Check if word complete
    if (newAnswer.length === currentWord.length) {
      if (newAnswer === currentWord) {
        haptics.success();
        setIsCorrect(true);
        setCombo(c => c + 1);
        const earnedScore = 100 * (combo + 1);
        setScore(s => s + earnedScore);
        setCoins(c => c + earnedScore);
        
        const newSolved = wordsSolved + 1;
        setWordsSolved(newSolved);
        
        if (newSolved >= wordsToSolve) {
          toast.success("🎉 Hoàn thành tất cả!");
          setTimeout(() => {
            setIsWin(true);
            setShowGameOver(true);
            setIsPlaying(false);
            onLevelComplete?.();
          }, 1000);
        } else {
          toast.success(`✅ Đúng! ${newSolved}/${wordsToSolve}`);
          setTimeout(loadNewWord, 1000);
        }
      } else {
        haptics.error();
        setIsCorrect(false);
        setCombo(0);
        toast.error("❌ Sai rồi!");
        setTimeout(() => {
          setSelectedIndices([]);
          setAnswer("");
          setIsCorrect(null);
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    setSelectedIndices([]);
    setAnswer("");
    setIsCorrect(null);
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
            { label: "Words", value: `${wordsSolved}/${wordsToSolve}` },
            { label: "Combo max", value: combo },
          ]}
        />
      )}

      <div className="relative w-full aspect-[4/3] max-w-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-orange-900 to-red-950">
        {isPlaying && (
          <Game3DHUD
            score={score}
            level={level}
            coins={coins}
            combo={combo}
            timeLeft={timeLeft}
            targetScore={wordsToSolve}
            isPaused={false}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene
              scrambledLetters={scrambledLetters}
              selectedIndices={selectedIndices}
              answer={answer}
              wordLength={currentWord.length}
              isCorrect={isCorrect}
              onLetterClick={handleLetterClick}
            />
          </Suspense>
        </Canvas>
        
        {/* Progress */}
        {isPlaying && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              📝 {wordsSolved}/{wordsToSolve} từ
            </div>
          </div>
        )}
        
        {/* Reset button */}
        {isPlaying && answer.length > 0 && isCorrect === null && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button onClick={handleReset} variant="outline" size="sm" className="bg-white/90">
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
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
              <div className="text-6xl mb-4">🔤</div>
              <h2 className="text-2xl font-bold text-white mb-2">Word Scramble 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - {wordsToSolve} từ</p>
              <Button onClick={startGame} size="lg" className="bg-orange-500 hover:bg-orange-600">
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

export default WordScramble3D;
