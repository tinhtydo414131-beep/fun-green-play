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
  Sparkles,
  Stars
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Game3DHUD, Game3DGameOver } from "./3d/Game3DUI";
import { haptics } from "@/utils/haptics";
import { toast } from "sonner";

interface TriviaQuiz3DProps {
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

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

const QUESTIONS: Question[] = [
  { question: "Thủ đô của Việt Nam?", options: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế"], correct: 0, category: "🌍" },
  { question: "1 + 1 = ?", options: ["1", "2", "3", "11"], correct: 1, category: "🔢" },
  { question: "Mặt trời mọc hướng nào?", options: ["Tây", "Đông", "Nam", "Bắc"], correct: 1, category: "🌍" },
  { question: "Con vật nào là bạn thân nhất của người?", options: ["Mèo", "Chó", "Chuột", "Chim"], correct: 1, category: "🐾" },
  { question: "Cầu vồng có bao nhiêu màu?", options: ["5", "6", "7", "8"], correct: 2, category: "🌈" },
  { question: "Hành tinh nào gần Mặt trời nhất?", options: ["Sao Kim", "Sao Thủy", "Trái Đất", "Sao Hỏa"], correct: 1, category: "🚀" },
  { question: "Một năm có bao nhiêu tháng?", options: ["10", "11", "12", "13"], correct: 2, category: "📅" },
  { question: "Nước sôi ở bao nhiêu độ C?", options: ["90°", "100°", "110°", "120°"], correct: 1, category: "🔬" },
  { question: "Ai là tác giả Harry Potter?", options: ["J.R.R. Tolkien", "J.K. Rowling", "Stephen King", "Dan Brown"], correct: 1, category: "📚" },
  { question: "Đại dương lớn nhất là?", options: ["Đại Tây Dương", "Ấn Độ Dương", "Thái Bình Dương", "Bắc Băng Dương"], correct: 2, category: "🌊" },
];

interface AnswerButton3DProps {
  text: string;
  position: [number, number, number];
  isSelected: boolean;
  isCorrect: boolean | null;
  isDisabled: boolean;
  onClick: () => void;
  index: number;
}

function AnswerButton3D({ text, position, isSelected, isCorrect, isDisabled, onClick, index }: AnswerButton3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Entrance animation
      const targetY = position[1];
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
      
      // Scale on hover
      const targetScale = hovered && !isDisabled ? 1.05 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15)
      );
      
      // Shake on wrong
      if (isCorrect === false && isSelected) {
        meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 30) * 0.1;
      }
    }
  });

  const getColor = () => {
    if (isCorrect === true) return "#22c55e";
    if (isCorrect === false && isSelected) return "#ef4444";
    if (isSelected) return "#fbbf24";
    return "#4f46e5";
  };

  return (
    <group 
      ref={meshRef} 
      position={[position[0], position[1] - 5, position[2]]}
      onClick={() => !isDisabled && onClick()}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[3, 0.8, 0.3]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial 
          color={getColor()}
          metalness={0.2}
          roughness={0.6}
          emissive={getColor()}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </RoundedBox>
      
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.8}
      >
        {text}
      </Text>
      
      {isCorrect === true && (
        <Sparkles count={15} scale={3} size={3} color="#ffd700" />
      )}
    </group>
  );
}

function QuestionDisplay({ question, category }: { question: string; category: string }) {
  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
      <group position={[0, 2, 0]}>
        {/* Category emoji */}
        <Text
          position={[0, 1, 0]}
          fontSize={0.8}
          anchorX="center"
          anchorY="middle"
        >
          {category}
        </Text>
        
        {/* Question box */}
        <RoundedBox args={[5, 1.5, 0.2]} radius={0.1} smoothness={4}>
          <meshStandardMaterial 
            color="#1e1b4b"
            metalness={0.1}
            roughness={0.9}
          />
        </RoundedBox>
        
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={4.5}
          textAlign="center"
        >
          {question}
        </Text>
      </group>
    </Float>
  );
}

function GameScene({
  question,
  selectedAnswer,
  correctAnswer,
  showResult,
  onAnswerClick,
}: {
  question: Question | null;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  showResult: boolean;
  onAnswerClick: (index: number) => void;
}) {
  if (!question) return null;

  return (
    <>
      <Environment preset="night" background={false} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 5, 3]} intensity={0.5} color="#fbbf24" />
      
      <Stars radius={100} depth={50} count={1000} factor={4} fade />
      
      <QuestionDisplay question={question.question} category={question.category} />
      
      {question.options.map((option, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = col === 0 ? -1.7 : 1.7;
        const y = row === 0 ? -0.5 : -1.5;
        
        return (
          <AnswerButton3D
            key={index}
            text={option}
            position={[x, y, 0]}
            isSelected={selectedAnswer === index}
            isCorrect={showResult ? (correctAnswer === index ? true : selectedAnswer === index ? false : null) : null}
            isDisabled={showResult}
            onClick={() => onAnswerClick(index)}
            index={index}
          />
        );
      })}
      
      <ContactShadows position={[0, -3, 0]} opacity={0.3} scale={10} blur={2} />
      <fog attach="fog" args={["#0f0a1f", 5, 25]} />
    </>
  );
}

export function TriviaQuiz3D({ level = 1, onLevelComplete, onBack }: TriviaQuiz3DProps) {
  const questionsCount = Math.min(5 + level, 10);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const startGame = () => {
    // Shuffle and pick questions
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, questionsCount);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setScore(0);
    setCoins(0);
    setCombo(0);
    setTimeLeft(15);
    setIsPlaying(true);
    setShowGameOver(false);
  };

  // Timer
  useEffect(() => {
    if (!isPlaying || showResult || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time's up - treat as wrong answer
          handleAnswer(-1);
          return 15;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, showResult, timeLeft, currentIndex]);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    haptics.light();
    setSelectedAnswer(index);
    setCorrectAnswer(questions[currentIndex].correct);
    setShowResult(true);
    
    const isCorrect = index === questions[currentIndex].correct;
    
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
      toast.error("❌ Sai rồi!");
    }
    
    // Next question after delay
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        // Game over
        const winThreshold = Math.ceil(questionsCount * 0.6);
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        setIsWin(finalCorrect >= winThreshold);
        setShowGameOver(true);
        setIsPlaying(false);
        if (finalCorrect >= winThreshold) {
          onLevelComplete?.();
        }
      } else {
        setCurrentIndex(i => i + 1);
        setSelectedAnswer(null);
        setCorrectAnswer(null);
        setShowResult(false);
        setTimeLeft(15);
      }
    }, 1500);
  };

  const currentQuestion = questions[currentIndex] || null;

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

      <div className="relative w-full aspect-[4/3] max-w-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-indigo-900 to-violet-950">
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
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              correctAnswer={correctAnswer}
              showResult={showResult}
              onAnswerClick={handleAnswer}
            />
          </Suspense>
        </Canvas>
        
        {/* Progress */}
        {isPlaying && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              ❓ {currentIndex + 1}/{questions.length}
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
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold text-white mb-2">Trivia Quiz 3D</h2>
              <p className="text-white/70 mb-4">Level {level} - {questionsCount} câu hỏi</p>
              <Button onClick={startGame} size="lg" className="bg-yellow-500 hover:bg-yellow-600">
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

export default TriviaQuiz3D;
