import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GameTutorialModal } from "./GameTutorialModal";
import { GameHUD } from "./GameHUD";
import { GameOverModal } from "./GameOverModal";
import { haptics } from "@/utils/haptics";

interface Position {
  x: number;
  y: number;
}

type PowerUpType = "speed" | "shield" | "magnet" | "double" | null;

interface PowerUp {
  type: PowerUpType;
  position: Position;
  emoji: string;
}

const POWER_UP_DATA = {
  speed: { emoji: "⚡", name: "Tốc độ", description: "Tăng tốc 3s", duration: 3000 },
  shield: { emoji: "🛡️", name: "Khiên", description: "Không chết 5s", duration: 5000 },
  magnet: { emoji: "🧲", name: "Nam châm", description: "Hút táo", duration: 4000 },
  double: { emoji: "✨", name: "x2 Điểm", description: "Nhân đôi điểm", duration: 5000 },
};

export const Snake = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete,
  onBack
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const gridSize = 15;
  const initialSpeed = Math.max(80, 200 - (level * 15));
  const targetScore = level * 5;

  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<string>("RIGHT");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>(null);
  const [powerUpOnField, setPowerUpOnField] = useState<PowerUp | null>(null);
  const [lives, setLives] = useState(3);
  const [powerUpInventory, setPowerUpInventory] = useState([
    { icon: "🛡️", name: "Khiên", active: false, count: 1 },
    { icon: "⚡", name: "Tốc độ", active: false, count: 0 },
  ]);
  
  const directionRef = useRef(direction);
  const lastEatTime = useRef(Date.now());

  // Load tutorial preference and high score
  useEffect(() => {
    const tutorialShown = localStorage.getItem("snake_tutorial_shown");
    if (tutorialShown) setShowTutorial(false);
    
    const saved = localStorage.getItem("snake_high_score");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const spawnPowerUp = useCallback(() => {
    if (Math.random() > 0.3 || powerUpOnField) return; // 30% chance, only one at a time
    
    const types: PowerUpType[] = ["speed", "shield", "magnet", "double"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let pos: Position;
    do {
      pos = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    } while (
      snake.some(s => s.x === pos.x && s.y === pos.y) ||
      (food.x === pos.x && food.y === pos.y)
    );
    
    setPowerUpOnField({
      type,
      position: pos,
      emoji: POWER_UP_DATA[type!].emoji
    });
    
    // Remove after 10 seconds
    setTimeout(() => {
      setPowerUpOnField(prev => prev?.type === type ? null : prev);
    }, 10000);
  }, [snake, food, powerUpOnField]);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood({ x: 5, y: 5 });
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setCoins(0);
    setCombo(0);
    setGameOver(false);
    setShowGameOver(false);
    setIsPlaying(false);
    setIsPaused(false);
    setActivePowerUp(null);
    setPowerUpOnField(null);
    setLives(3);
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
    haptics.light();
  };

  const handleTutorialClose = () => {
    localStorage.setItem("snake_tutorial_shown", "true");
    setShowTutorial(false);
  };

  const handleTutorialStart = () => {
    handleTutorialClose();
    startGame();
  };

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;
      
      const current = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (current !== "LEFT") setDirection("RIGHT");
          break;
        case " ":
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, isPaused]);

  useEffect(() => {
    if (!isPlaying || gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = directionRef.current;
        
        switch (currentDir) {
          case "UP": head.y -= 1; break;
          case "DOWN": head.y += 1; break;
          case "LEFT": head.x -= 1; break;
          case "RIGHT": head.x += 1; break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          if (activePowerUp === "shield") {
            // Wrap around with shield
            head.x = (head.x + gridSize) % gridSize;
            head.y = (head.y + gridSize) % gridSize;
          } else {
            handleDeath();
            return prevSnake;
          }
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          if (activePowerUp !== "shield") {
            handleDeath();
            return prevSnake;
          }
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          const now = Date.now();
          const timeSinceLastEat = now - lastEatTime.current;
          
          // Combo system
          if (timeSinceLastEat < 3000) {
            setCombo(c => c + 1);
          } else {
            setCombo(1);
          }
          lastEatTime.current = now;
          
          const pointsEarned = activePowerUp === "double" ? 2 : 1;
          const comboBonus = Math.floor(combo * 0.1);
          
          setScore(prev => {
            const newScore = prev + pointsEarned + comboBonus;
            if (newScore >= targetScore && onLevelComplete) {
              toast.success("🎉 Level hoàn thành!");
              haptics.success();
              setTimeout(() => onLevelComplete(), 500);
            }
            return newScore;
          });
          
          setCoins(c => c + (pointsEarned + comboBonus) * 100);
          setFood(generateFood());
          spawnPowerUp();
          haptics.light();
          
          if (combo >= 3) {
            toast.success(`🔥 Combo x${combo}!`);
          }
        } else {
          newSnake.pop();
        }

        // Check power-up collision
        if (powerUpOnField && head.x === powerUpOnField.position.x && head.y === powerUpOnField.position.y) {
          activatePowerUp(powerUpOnField.type);
          setPowerUpOnField(null);
        }

        return newSnake;
      });
    };

    const speed = activePowerUp === "speed" ? initialSpeed * 0.6 : initialSpeed;
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [isPlaying, gameOver, isPaused, food, generateFood, initialSpeed, targetScore, onLevelComplete, activePowerUp, combo, powerUpOnField, spawnPowerUp]);

  const handleDeath = () => {
    haptics.error();
    if (lives > 1) {
      setLives(l => l - 1);
      setSnake([{ x: 7, y: 7 }]);
      setDirection("RIGHT");
      directionRef.current = "RIGHT";
      setCombo(0);
      toast.error(`💔 Mất mạng! Còn ${lives - 1} mạng`);
    } else {
      setGameOver(true);
      setIsPlaying(false);
      setShowGameOver(true);
      
      // Save high score
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("snake_high_score", score.toString());
      }
    }
  };

  const activatePowerUp = (type: PowerUpType) => {
    if (!type) return;
    
    setActivePowerUp(type);
    toast.success(`${POWER_UP_DATA[type].emoji} ${POWER_UP_DATA[type].name}!`);
    haptics.success();
    
    setTimeout(() => {
      setActivePowerUp(null);
    }, POWER_UP_DATA[type].duration);
  };

  const handleDirectionButton = (newDir: string) => {
    if (!isPlaying || isPaused) return;
    const current = directionRef.current;
    if (
      (newDir === "UP" && current !== "DOWN") ||
      (newDir === "DOWN" && current !== "UP") ||
      (newDir === "LEFT" && current !== "RIGHT") ||
      (newDir === "RIGHT" && current !== "LEFT")
    ) {
      setDirection(newDir);
      haptics.light();
    }
  };

  const handleUsePowerUp = (index: number) => {
    const pu = powerUpInventory[index];
    if (pu.count > 0 && !pu.active) {
      setPowerUpInventory(prev => {
        const updated = [...prev];
        updated[index] = { ...pu, active: true, count: pu.count - 1 };
        return updated;
      });
      
      if (pu.name === "Khiên") {
        setActivePowerUp("shield");
        setTimeout(() => {
          setActivePowerUp(null);
          setPowerUpInventory(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], active: false };
            return updated;
          });
        }, 5000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 md:gap-4 w-full">
      {/* Tutorial Modal */}
      <GameTutorialModal
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        onStart={handleTutorialStart}
        gameTitle="Rắn Săn Mồi"
        gameIcon="🐍"
        howToPlay={[
          "Dùng phím mũi tên hoặc nút điều khiển để di chuyển rắn",
          "Ăn táo 🍎 để lớn lên và ghi điểm",
          "Tránh đâm vào tường và thân rắn",
          "Thu thập power-up để có sức mạnh đặc biệt"
        ]}
        objectives={[
          `Đạt ${targetScore} điểm để qua level`,
          "Ăn liên tục để tạo combo",
          "Sống sót càng lâu càng tốt"
        ]}
        rewards={{
          perLevel: 5000,
          firstPlay: 10000,
          combo: 2000
        }}
        powerUps={[
          { icon: "⚡", name: "Tốc độ", description: "Tăng tốc 3 giây" },
          { icon: "🛡️", name: "Khiên", description: "Bất tử 5 giây" },
          { icon: "🧲", name: "Nam châm", description: "Hút táo gần" },
          { icon: "✨", name: "x2 Điểm", description: "Nhân đôi điểm" }
        ]}
        tips={[
          "Ăn nhanh liên tục để tạo combo x5!",
          "Thu thập power-up để dễ qua level hơn",
          "Cẩn thận khi rắn dài - dễ tự đâm vào thân!"
        ]}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOver}
        onClose={() => setShowGameOver(false)}
        onRestart={startGame}
        onHome={() => onBack?.()}
        isWin={score >= targetScore}
        score={score}
        coinsEarned={coins}
        level={level}
        highScore={highScore}
        stats={[
          { label: "Độ dài rắn", value: snake.length },
          { label: "Max Combo", value: combo },
        ]}
      />

      {/* Game HUD */}
      {isPlaying && (
        <GameHUD
          score={score}
          level={level}
          lives={lives}
          maxLives={3}
          combo={combo}
          targetScore={targetScore}
          coins={coins}
          powerUps={powerUpInventory}
          onPause={() => setIsPaused(p => !p)}
          onUsePowerUp={handleUsePowerUp}
          showComboEffect={combo > 1}
        />
      )}

      {!isPlaying && !showTutorial && (
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            🐍 Rắn Săn Mồi
          </h2>
          <p className="text-sm text-muted-foreground">Level {level} • Mục tiêu: {targetScore} điểm</p>
        </div>
      )}

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setIsPaused(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-background p-6 rounded-xl text-center"
            >
              <Pause className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Tạm dừng</h3>
              <p className="text-muted-foreground mb-4">Nhấn để tiếp tục</p>
              <Button onClick={() => setIsPaused(false)}>
                <Play className="mr-2 h-4 w-4" /> Tiếp tục
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-1 md:p-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 relative overflow-hidden">
        {/* Active power-up indicator */}
        {activePowerUp && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
              {POWER_UP_DATA[activePowerUp].emoji} {POWER_UP_DATA[activePowerUp].name}
            </div>
          </motion.div>
        )}
        
        <div 
          className="grid gap-[1px] bg-green-300 dark:bg-green-700 rounded will-change-transform"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: `min(92vw, 400px)`,
            height: `min(92vw, 400px)`
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
            const snakeIndex = snake.findIndex(segment => segment.x === x && segment.y === y);
            const isSnake = snakeIndex !== -1;
            const isFood = food.x === x && food.y === y;
            const isPowerUp = powerUpOnField?.position.x === x && powerUpOnField?.position.y === y;

            return (
              <div
                key={i}
                className={`aspect-square rounded-sm flex items-center justify-center transition-colors ${
                  isSnakeHead 
                    ? `${activePowerUp === "shield" ? "bg-blue-500" : "bg-green-600"} dark:bg-green-400 scale-110` 
                    : isSnake 
                    ? `${activePowerUp === "shield" ? "bg-blue-400" : "bg-green-500"} dark:bg-green-500` 
                    : isFood 
                    ? "bg-red-500 animate-pulse" 
                    : isPowerUp
                    ? "bg-yellow-400 animate-bounce"
                    : "bg-green-100 dark:bg-green-900"
                }`}
              >
                {isSnakeHead && <span className="text-[8px] md:text-xs">👀</span>}
                {isFood && <span className="text-[8px] md:text-xs">🍎</span>}
                {isPowerUp && <span className="text-[8px] md:text-xs">{powerUpOnField?.emoji}</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-3 md:hidden mt-2">
        <div />
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 w-14 touch-manipulation active:scale-95 transition-transform"
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton("UP"); }}
          onClick={() => handleDirectionButton("UP")}
          disabled={!isPlaying || isPaused}
        >
          <ArrowUp className="h-7 w-7" />
        </Button>
        <div />
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 w-14 touch-manipulation active:scale-95 transition-transform"
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton("LEFT"); }}
          onClick={() => handleDirectionButton("LEFT")}
          disabled={!isPlaying || isPaused}
        >
          <ArrowLeft className="h-7 w-7" />
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 w-14 touch-manipulation active:scale-95 transition-transform"
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton("DOWN"); }}
          onClick={() => handleDirectionButton("DOWN")}
          disabled={!isPlaying || isPaused}
        >
          <ArrowDown className="h-7 w-7" />
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 w-14 touch-manipulation active:scale-95 transition-transform"
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton("RIGHT"); }}
          onClick={() => handleDirectionButton("RIGHT")}
          disabled={!isPlaying || isPaused}
        >
          <ArrowRight className="h-7 w-7" />
        </Button>
      </div>

      <div className="flex gap-3 mt-2">
        {onBack && (
          <Button onClick={onBack} size="lg" variant="outline" className="touch-manipulation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button onClick={startGame} size="lg" className="touch-manipulation bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90">
          {isPlaying ? "Chơi lại" : gameOver ? "Chơi lại" : "Bắt đầu"} 🐍
        </Button>
      </div>
    </div>
  );
};
