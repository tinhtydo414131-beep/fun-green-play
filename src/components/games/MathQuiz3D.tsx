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
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface MathQuiz3DProps {
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
            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-sm">Loading 3D... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

function generateProblem(level: number): MathProblem {
  const maxNum = 10 + level * 5;
  const operations = level >= 3 ? ["+", "-", "×"] : level >= 2 ? ["+", "-"] : ["+"];
  const op = operations[Math.floor(Math.random() * operations.length)];
  
  let a: number, b: number, answer: number;
  
  switch (op) {
    case "+":
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
    default:
      a = 1; b = 1; answer = 2;
  }
  
  // Generate options
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrongAnswer = answer + offset;
    if (wrongAnswer > 0 && wrongAnswer !== answer) {
      options.add(wrongAnswer);
    }
  }
  
  return {
    question: `${a} ${op} ${b} = ?`,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5)
  };
}

function QuestionBoard({ question }: { question: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
      <group ref={meshRef} position={[0, 2, 0]}>
        <RoundedBox args={[5, 2, 0.3]} radius={0.15} smoothness={4}>
          <meshStandardMaterial 
            color="#1e3a5f"
            metalness={0.2}
            roughness={0.8}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {question}
        </Text>
      </group>
    </Float>
  );
}

interface AnswerButton3DProps {
  value: number;
  position: [number, number, number];
  isSelected: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
}

function AnswerButton3D({ value, position, isSelected, isCorrect, onClick }: AnswerButton3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15)
      );
      
      if (isCorrect === true) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      } else if (isCorrect === false && isSelected) {
        meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 30) * 0.1;
      }
    }
  });

  const getColor = () => {
    if (isCorrect === true) return "#22c55e";
    if (isCorrect === false && isSelected) return "#ef4444";
    if (isSelected) return "#fbbf24";
    return "#3b82f6";
  };

  return (
    <group 
      ref={meshRef} 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[1.8, 1.2, 0.3]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial 
          color={getColor()}
          metalness={0.3}
          roughness={0.6}
          emissive={getColor()}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </RoundedBox>
      
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
      
      {isCorrect === true && (
        <Sparkles count={20} scale={2} size={4} color="#ffd700" />
      )}
    </group>
  );
}

function GameScene({
  problem,
  selectedAnswer,
  showResult,
  onAnswerClick,
}: {
  problem: MathProblem | null;
  selectedAnswer: number | null;
  showResult: boolean;
  onAnswerClick: (value: number) => void;
}) {
  if (!problem) return null;

  const positions: [number, number, number][] = [
    [-1.2, -0.5, 0],
    [1.2, -0.5, 0],
    [-1.2, -2, 0],
    [1.2, -2, 0],
  ];

  return (
    <>
      <Environment preset="city" background={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 5, 3]} intensity={0.5} color="#3b82f6" />
      
      <QuestionBoard question={problem.question} />
      
      {problem.options.map((option, index) => (
        <AnswerButton3D
          key={index}
          value={option}
          position={positions[index]}
          isSelected={selectedAnswer === option}
          isCorrect={showResult ? (option === problem.answer ? true : selectedAnswer === option ? false : null) : null}
          onClick={() => onAnswerClick(option)}
        />
      ))}
      
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={12} blur={2} />
      <fog attach="fog" args={["#0a1628", 5, 20]} />
    </>
  );
}

export function MathQuiz3D({ level = 1, onLevelComplete, onBack }: MathQuiz3DProps) {
  const questionsCount = 5 + level * 2;
  
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const loadNewProblem = useCallback(() => {
    setCurrentProblem(generateProblem(level));
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(10);
  }, [level]);

  const startGame = () => {
    setQuestionIndex(0);
    setCorrectCount(0);
    setScore(0);
    setCoins(0);
    setCombo(0);
    setIsPlaying(true);
    setShowGameOver(false);
    loadNewProblem();
  };

  // Timer
  useEffect(() => {
    if (!isPlaying || showResult || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswer(-999);
          return 10;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, showResult, timeLeft]);

  const handleAnswer = (value: number) => {
    if (showResult) return;
    if (!currentProblem) return;
    
    haptics.light();
    setSelectedAnswer(value);
    setShowResult(true);
    
    const isCorrect = value === currentProblem.answer;
    
    if (isCorrect) {
      haptics.success();
      setCorrectCount(c => c + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      const earnedScore = 100 * newCombo + timeLeft * 10;
      setScore(s => s + earnedScore);
      setCoins(c => c + earnedScore);
      toast.success(`✅ Đúng! +${earnedScore}`);
    } else {
      haptics.error();
      setCombo(0);
      toast.error(`❌ Sai! Đáp án: ${currentProblem.answer}`);
    }
    
    setTimeout(() => {
      const nextIndex = questionIndex + 1;
      if (nextIndex >= questionsCount) {
        const winThreshold = Math.ceil(questionsCount * 0.6);
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        setIsWin(finalCorrect >= winThreshold);
        setShowGameOver(true);
        setIsPlaying(false);
        if (finalCorrect >= winThreshold) {
          onLevelComplete?.();
        }
      } else {
        setQuestionIndex(nextIndex);
        loadNewProblem();
      }
    }, 1500);
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
            { label: "Đúng", value: `${correctCount}/${questionsCount}` },
            { label: "Combo max", value: combo },
          ]}
        />
      )}

      <div className="relative w-full aspect-[4/3] max-w-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-blue-900 to-indigo-950">
        {isPlaying && (
          <Game3DHUD
            score={score}
            level={level}
            coins={coins}
            combo={combo}
            timeLeft={timeLeft}
            targetScore={questionsCount * 100}
            isPaused={false}
          />
        )}
        
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <GameScene
              problem={currentProblem}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              onAnswerClick={handleAnswer}
            />
          </Suspense>
        </Canvas>
        
        {isPlaying && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              📝 {questionIndex + 1}/{questionsCount}
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
              <div className="text-6xl mb-4">🧮</div>
              <h2 className="text-2xl font-bold text-white mb-2">Math Quiz 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - {questionsCount} câu</p>
              <Button onClick={startGame} size="lg" className="bg-blue-500 hover:bg-blue-600">
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

export default MathQuiz3D;
