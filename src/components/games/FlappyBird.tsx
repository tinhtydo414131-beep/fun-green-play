import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";

export const FlappyBird = () => {
  const [birdY, setBirdY] = useState(50);
  const [pipes, setPipes] = useState<{ x: number; gapY: number }[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const { playJump, playError, playScore, startBackgroundMusic, stopBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      setBirdY(prev => {
        const newY = prev + velocity;
        if (newY > 90 || newY < 0) {
          setIsPlaying(false);
          playError();
          toast.error(`😢 Game Over! Điểm: ${score}`);
          return prev;
        }
        return newY;
      });
      setVelocity(prev => prev + 0.5);

      setPipes(prev => {
        const newPipes = prev.map(pipe => ({ ...pipe, x: pipe.x - 2 }))
          .filter(pipe => pipe.x > -10);
        
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 70) {
          newPipes.push({ x: 100, gapY: Math.random() * 50 + 20 });
        }

        // Check collision
        newPipes.forEach(pipe => {
          if (pipe.x > 8 && pipe.x < 18) {
            if (birdY < pipe.gapY - 15 || birdY > pipe.gapY + 15) {
              setIsPlaying(false);
              playError();
              toast.error(`😢 Game Over! Điểm: ${score}`);
            }
          }
          if (pipe.x === 8) {
            setScore(s => s + 1);
            playScore();
            toast.success('Tuyệt vời! +1 🎉');
          }
        });

        return newPipes;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, velocity, birdY, score]);

  const flap = () => {
    if (!isPlaying) return;
    setVelocity(-3);
    playJump();
  };

  const startGame = () => {
    setBirdY(50);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setIsPlaying(true);
    startBackgroundMusic();
  };

  useEffect(() => {
    if (!isPlaying) stopBackgroundMusic();
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 animate-fade-in">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          🐦 Chim Bay Phiêu Lưu
        </h2>
        <p className="text-3xl font-comic text-primary">Điểm: {score} 🌟</p>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
      </div>

      <div 
        className="relative w-full max-w-2xl h-96 border-4 border-primary rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
        onClick={flap}
        style={{ 
          background: 'linear-gradient(180deg, hsl(200 80% 85%) 0%, hsl(140 60% 90%) 100%)'
        }}
      >
        {/* Bird */}
        <div 
          className="absolute w-12 h-12 text-4xl flex items-center justify-center transition-all duration-100 animate-bounce"
          style={{ 
            left: '10%', 
            top: `${birdY}%`,
            transform: 'translateY(-50%)'
          }}
        >
          🐦
        </div>

        {/* Pipes */}
        {pipes.map((pipe, i) => (
          <div key={i} style={{ position: 'absolute', left: `${pipe.x}%` }}>
            {/* Top pipe */}
            <div 
              style={{ 
                width: '60px',
                height: `${pipe.gapY - 15}%`,
                background: 'linear-gradient(90deg, hsl(140 70% 45%) 0%, hsl(140 70% 50%) 100%)',
                position: 'absolute',
                top: 0,
                border: '3px solid hsl(140 70% 35%)',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            />
            {/* Bottom pipe */}
            <div 
              style={{ 
                width: '60px',
                height: `${85 - pipe.gapY}%`,
                background: 'linear-gradient(90deg, hsl(140 70% 45%) 0%, hsl(140 70% 50%) 100%)',
                position: 'absolute',
                bottom: 0,
                border: '3px solid hsl(140 70% 35%)',
                borderRadius: '8px 8px 0 0',
                boxShadow: '0 -4px 8px rgba(0,0,0,0.3)'
              }}
            />
          </div>
        ))}

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <p className="text-3xl font-fredoka font-bold text-white animate-pulse">
              Nhấn để bắt đầu! 🎮
            </p>
          </div>
        )}
      </div>

      <Button 
        onClick={startGame}
        size="lg"
        className="font-fredoka font-bold text-xl px-12 py-8 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-110 transition-all"
      >
        {isPlaying ? 'Chơi Lại 🔄' : 'Bắt Đầu 🎮'}
      </Button>

      <p className="text-center text-lg font-comic text-muted-foreground">
        Click để bay lên! 🚀
      </p>
    </div>
  );
};
