import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GameTutorialModal } from "./GameTutorialModal";
import { GameHUD } from "./GameHUD";
import { GameOverModal } from "./GameOverModal";
import { haptics } from "@/utils/haptics";

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryCards = ({
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
  const pairCount = Math.min(8, Math.floor(4 + level * 0.5));
  const emojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🥑', '🍒'].slice(0, pairCount);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 + level * 10);
  const [powerUps, setPowerUps] = useState([
    { icon: "👁️", name: "Peek", active: false, count: 2 },
    { icon: "🔄", name: "Shuffle", active: false, count: 1 },
  ]);
  
  const maxMoves = Math.floor(30 / difficultyMultiplier);
  const { playClick, playSuccess, playError, startBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  useEffect(() => {
    const tutorialShown = localStorage.getItem("memory_tutorial_shown");
    if (tutorialShown) setShowTutorial(false);
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && isPlaying) {
      endGame(false);
    }
  }, [isPlaying, timeLeft]);

  const initializeGame = () => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setScore(0);
    setCoins(0);
    setCombo(0);
    setTimeLeft(60 + level * 10);
    setIsPlaying(true);
    startBackgroundMusic();
  };

  const handleTutorialClose = () => {
    localStorage.setItem("memory_tutorial_shown", "true");
    setShowTutorial(false);
  };

  const handleTutorialStart = () => {
    handleTutorialClose();
    initializeGame();
  };

  const endGame = (won: boolean) => {
    setIsPlaying(false);
    setShowGameOver(true);
    if (won) {
      haptics.success();
      onLevelComplete?.();
    } else {
      haptics.error();
    }
  };

  const handleCardClick = (id: number) => {
    if (!isPlaying || flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    playClick();
    haptics.light();
    
    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlippedCards;
      
      if (cards[first].emoji === cards[second].emoji) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        playSuccess();
        haptics.success();
        
        // Score and combo
        const newCombo = combo + 1;
        setCombo(newCombo);
        const points = 10 + (newCombo * 5);
        setScore(s => s + points);
        setCoins(c => c + points * 10);
        setMatches(m => m + 1);
        
        toast.success(`+${points} điểm! ${newCombo >= 2 ? `🔥 Combo x${newCombo}!` : ""}`);
        
        if (newCards.every(card => card.isMatched)) {
          toast.success(`🎉 Hoàn thành với ${moves + 1} nước đi!`);
          endGame(true);
        }
      } else {
        playError();
        haptics.error();
        setCombo(0);
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  const usePowerUp = (index: number) => {
    const pu = powerUps[index];
    if (pu.count <= 0 || !isPlaying) return;
    
    setPowerUps(prev => {
      const updated = [...prev];
      updated[index] = { ...pu, count: pu.count - 1, active: true };
      return updated;
    });
    
    if (pu.name === "Peek") {
      // Show all cards for 2 seconds
      const newCards = cards.map(c => ({ ...c, isFlipped: true }));
      setCards(newCards);
      toast.success("👁️ Nhìn trước 2 giây!");
      
      setTimeout(() => {
        setCards(cards.map(c => ({ ...c, isFlipped: c.isMatched })));
        setPowerUps(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], active: false };
          return updated;
        });
      }, 2000);
    } else if (pu.name === "Shuffle") {
      // Shuffle unmatched cards
      const unmatchedIndices = cards.map((c, i) => !c.isMatched ? i : -1).filter(i => i !== -1);
      const unmatchedEmojis = unmatchedIndices.map(i => cards[i].emoji).sort(() => Math.random() - 0.5);
      
      const newCards = [...cards];
      unmatchedIndices.forEach((cardIndex, i) => {
        newCards[cardIndex] = { ...newCards[cardIndex], emoji: unmatchedEmojis[i] };
      });
      setCards(newCards);
      toast.success("🔄 Đã xáo trộn!");
      
      setTimeout(() => {
        setPowerUps(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], active: false };
          return updated;
        });
      }, 500);
    }
    
    haptics.success();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 animate-fade-in w-full max-w-2xl mx-auto">
      {/* Tutorial Modal */}
      <GameTutorialModal
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        onStart={handleTutorialStart}
        gameTitle="Trí Nhớ Siêu Đẳng"
        gameIcon="🧠"
        howToPlay={[
          "Lật 2 thẻ để tìm cặp giống nhau",
          "Nhớ vị trí các thẻ đã lật",
          "Ghép tất cả các cặp để thắng",
          "Dùng power-up để hỗ trợ"
        ]}
        objectives={[
          "Ghép tất cả các cặp thẻ",
          "Hoàn thành trước khi hết thời gian",
          "Tạo combo để nhân điểm"
        ]}
        rewards={{
          perLevel: 3000,
          firstPlay: 10000,
          combo: 1500
        }}
        powerUps={[
          { icon: "👁️", name: "Peek", description: "Xem tất cả thẻ 2s" },
          { icon: "🔄", name: "Shuffle", description: "Xáo trộn thẻ" }
        ]}
        tips={[
          "Ghép liên tục để tạo combo cao",
          "Dùng Peek khi còn ít thẻ",
          "Tập trung nhớ vị trí từng loại"
        ]}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOver}
        onClose={() => setShowGameOver(false)}
        onRestart={initializeGame}
        onHome={() => onBack?.()}
        isWin={matches === pairCount}
        score={score}
        coinsEarned={coins}
        level={level}
        stats={[
          { label: "Số nước đi", value: moves },
          { label: "Max Combo", value: combo },
          { label: "Thời gian còn", value: `${timeLeft}s` }
        ]}
      />

      {/* Header */}
      <div className="text-center space-y-2 w-full">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          🧠 Trí Nhớ Siêu Đẳng
        </h2>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
      </div>

      {/* Game HUD */}
      {isPlaying && (
        <GameHUD
          score={score}
          level={level}
          combo={combo}
          targetScore={pairCount * 10}
          coins={coins}
          powerUps={powerUps}
          onUsePowerUp={usePowerUp}
          showComboEffect={combo > 1}
        />
      )}

      {/* Timer */}
      {isPlaying && (
        <motion.div
          animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className={`text-lg font-bold ${timeLeft <= 10 ? "text-red-500" : "text-muted-foreground"}`}
        >
          ⏱️ {timeLeft}s
        </motion.div>
      )}
      
      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 w-full max-w-md p-3 md:p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/20">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: card.isFlipped || card.isMatched ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square flex items-center justify-center text-3xl md:text-4xl cursor-pointer transition-all duration-200 border-2 shadow-md hover:shadow-lg active:scale-95 ${
                  card.isMatched
                    ? 'bg-gradient-to-br from-green-400/50 to-emerald-400/50 border-green-500'
                    : card.isFlipped
                    ? 'bg-gradient-to-br from-primary/30 to-secondary/30 border-primary'
                    : 'bg-gradient-to-br from-background to-muted border-border hover:border-primary'
                }`}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '❓'}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Controls */}
      <div className="flex gap-3">
        {onBack && (
          <Button 
            onClick={onBack}
            size="lg"
            variant="outline"
            className="font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button 
          onClick={initializeGame} 
          size="lg"
          className="font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
        >
          {isPlaying ? "Chơi Lại" : "Bắt Đầu"} 🔄
        </Button>
      </div>
    </div>
  );
};
