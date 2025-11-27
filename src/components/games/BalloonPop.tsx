import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";
import { CelebrationNotification } from "@/components/CelebrationNotification";
import { Heart, Trophy, Zap, Bomb, Snowflake } from "lucide-react";
import confetti from "canvas-confetti";

type BalloonType = 'normal' | 'double' | 'freeze' | 'bomb';

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  type: BalloonType;
  speed: number;
}

export const BalloonPop = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [lastPopTime, setLastPopTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedCamly, setEarnedCamly] = useState(0);
  
  const { playPop, playSuccess, startBackgroundMusic, stopBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  const balloonColors = [
    'hsl(262, 100%, 64%)', // Purple
    'hsl(186, 100%, 50%)', // Cyan
    'hsl(45, 100%, 51%)',  // Yellow
    'hsl(330, 100%, 71%)', // Pink
    'hsl(142, 76%, 36%)'   // Green
  ];

  const getBalloonEmoji = (color: string) => {
    const colorMap: Record<string, string> = {
      'hsl(262, 100%, 64%)': '🟣',
      'hsl(186, 100%, 50%)': '🔵',
      'hsl(45, 100%, 51%)': '🟡',
      'hsl(330, 100%, 71%)': '🎀',
      'hsl(142, 76%, 36%)': '🟢'
    };
    return colorMap[color] || '🎈';
  };

  const getTypeIcon = (type: BalloonType) => {
    switch (type) {
      case 'double': return <Zap className="w-4 h-4 text-yellow-300" />;
      case 'freeze': return <Snowflake className="w-4 h-4 text-blue-300" />;
      case 'bomb': return <Bomb className="w-4 h-4 text-orange-300" />;
      default: return null;
    }
  };

  // Spawn balloons
  useEffect(() => {
    if (!isPlaying || isFrozen) return;

    const spawnRate = Math.max(400, 1000 - (level * 50));
    const interval = setInterval(() => {
      const type: BalloonType = Math.random() < 0.85 ? 'normal' : 
                                 Math.random() < 0.5 ? 'double' :
                                 Math.random() < 0.5 ? 'freeze' : 'bomb';
      
      const newBalloon: Balloon = {
        id: Date.now() + Math.random(),
        x: Math.random() * 85 + 5,
        y: -10,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
        type,
        speed: 0.8 + (level * 0.15) + (Math.random() * 0.3)
      };
      setBalloons(prev => [...prev, newBalloon]);
    }, spawnRate);

    return () => clearInterval(interval);
  }, [isPlaying, level, isFrozen]);

  // Move balloons
  useEffect(() => {
    if (!isPlaying || isFrozen) return;

    const moveInterval = setInterval(() => {
      setBalloons(prev => 
        prev.map(balloon => ({ ...balloon, y: balloon.y + balloon.speed }))
          .filter(balloon => balloon.y < 110)
      );
    }, 30);

    return () => clearInterval(moveInterval);
  }, [isPlaying, isFrozen]);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Combo reset
  useEffect(() => {
    if (!isPlaying) return;
    
    const resetCombo = setTimeout(() => {
      if (Date.now() - lastPopTime > 2000 && combo > 0) {
        setCombo(0);
      }
    }, 2000);

    return () => clearTimeout(resetCombo);
  }, [lastPopTime, combo, isPlaying]);

  const popBalloon = useCallback((balloon: Balloon) => {
    setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    
    let points = 1;
    const now = Date.now();
    const newCombo = combo + 1;
    
    // Handle special balloon types
    if (balloon.type === 'double') {
      points *= 2;
      toast.success('🔥 Double Score!', { duration: 1000 });
    } else if (balloon.type === 'freeze') {
      setIsFrozen(true);
      toast.success('❄️ Frozen 5s!', { duration: 1000 });
      setTimeout(() => setIsFrozen(false), 5000);
    } else if (balloon.type === 'bomb') {
      // Pop all balloons in nearby area
      const bombRadius = 15;
      setBalloons(prev => {
        const popped = prev.filter(b => {
          const distance = Math.sqrt(Math.pow(b.x - balloon.x, 2) + Math.pow(b.y - balloon.y, 2));
          return distance > bombRadius;
        });
        const poppedCount = prev.length - popped.length;
        points += poppedCount;
        return popped;
      });
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`💣 Bomb! +${points} points!`, { duration: 1500 });
    }

    // Combo multiplier
    let multiplier = 1;
    if (newCombo >= 20) {
      multiplier = 3;
      // FUN AND RICH celebration!
      setEarnedCamly(100);
      setShowCelebration(true);
      playSuccess();
      toast.success('🎊 FUN AND RICH!!! +100 CAMLY!', { duration: 3000 });
    } else if (newCombo >= 10) {
      multiplier = 2;
      toast.success('🔥 x2 Combo!', { duration: 1000 });
    } else if (newCombo >= 5) {
      multiplier = 1.5;
      toast.success('⚡ x1.5 Combo!', { duration: 1000 });
    }

    const finalPoints = Math.floor(points * multiplier);
    setScore(prev => prev + finalPoints);
    setCombo(newCombo);
    setLastPopTime(now);
    
    playPop();
    
    // Fireworks effect
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: [balloon.color]
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: [balloon.color]
    });
  }, [combo, playPop, playSuccess]);

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setBalloons([]);
    setIsPlaying(true);
    setIsFrozen(false);
    startBackgroundMusic();
  };

  const endGame = () => {
    setIsPlaying(false);
    stopBackgroundMusic();
    
    // Calculate Camly rewards
    const camlyEarned = Math.floor(score / 1000);
    if (camlyEarned > 0) {
      toast.success(`🪙 You earned ${camlyEarned} CAMLY!`, { duration: 3000 });
    }
    
    if (onLevelComplete && score >= 50) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onLevelComplete();
      }, 500);
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      stopBackgroundMusic();
    }
  }, [isPlaying, stopBackgroundMusic]);

  return (
    <>
      {showCelebration && (
        <CelebrationNotification
          amount={earnedCamly}
          token="CAMLY"
          onComplete={() => setShowCelebration(false)}
        />
      )}
      
      <div className="flex flex-col items-center gap-4 w-full max-w-[420px] mx-auto px-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🎈 Balloon Pop
            </h1>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Heart className="w-5 h-5 text-primary" />
            </Button>
          </div>
          <AudioControls 
            isMusicEnabled={isMusicEnabled}
            isSoundEnabled={isSoundEnabled}
            onToggleMusic={toggleMusic}
            onToggleSound={toggleSound}
          />
        </div>

        {/* Stats */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-3 text-center border-2 border-primary/20">
            <div className="text-2xl font-fredoka font-bold text-foreground">{score}</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border-2 border-secondary/20">
            <div className="text-2xl font-fredoka font-bold text-foreground">{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border-2 border-accent/20">
            <div className="text-2xl font-fredoka font-bold text-foreground">x{combo}</div>
            <div className="text-xs text-muted-foreground">Combo</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border-4 border-primary/30 overflow-hidden shadow-xl">
          {/* Floating background balloons */}
          {!isPlaying && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${(i * 12) % 80 + 10}%`,
                    top: `${(i * 15) % 70 + 10}%`,
                    fontSize: '3rem',
                    opacity: 0.3,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + (i % 3)}s`
                  }}
                >
                  {getBalloonEmoji(balloonColors[i % balloonColors.length])}
                </div>
              ))}
            </div>
          )}

          {/* Game balloons */}
          {balloons.map(balloon => (
            <div
              key={balloon.id}
              onClick={() => popBalloon(balloon)}
              className="absolute cursor-pointer transition-all hover:scale-125 active:scale-95"
              style={{
                left: `${balloon.x}%`,
                top: `${balloon.y}%`,
                fontSize: '3rem',
                filter: isFrozen ? 'brightness(0.7)' : 'none',
                transform: `translateX(-50%) translateY(-50%) ${balloon.type !== 'normal' ? 'scale(1.2)' : ''}`
              }}
            >
              <div className="relative">
                {getBalloonEmoji(balloon.color)}
                {balloon.type !== 'normal' && (
                  <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5">
                    {getTypeIcon(balloon.type)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Start overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
              <Button 
                onClick={startGame} 
                size="lg"
                className="text-xl font-fredoka font-bold rounded-[32px] bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform shadow-2xl px-12 py-6 h-auto"
              >
                🎮 Play Now!
              </Button>
            </div>
          )}
        </div>

        {/* Power-ups legend */}
        <div className="w-full grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1 bg-card rounded-xl p-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-muted-foreground">x2 Score</span>
          </div>
          <div className="flex items-center gap-1 bg-card rounded-xl p-2">
            <Snowflake className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">Freeze 5s</span>
          </div>
          <div className="flex items-center gap-1 bg-card rounded-xl p-2">
            <Bomb className="w-4 h-4 text-orange-500" />
            <span className="text-muted-foreground">Pop Area</span>
          </div>
        </div>

        {/* Level indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="w-4 h-4" />
          <span>Level {level}</span>
        </div>
      </div>
    </>
  );
};
