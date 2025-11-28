import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { Sparkles, RotateCcw, ArrowLeft, Volume2, VolumeX } from "lucide-react";

interface LilBlockBuddyProps {
  level: number;
  onLevelComplete: (stars: number, score: number) => void;
  onBack?: () => void;
}

const LilBlockBuddy = ({ level, onLevelComplete, onBack }: LilBlockBuddyProps) => {
  const gridSize = Math.min(3 + level, 5); // Tăng kích thước từ 3x3 đến 5x5
  const totalTiles = gridSize * gridSize;
  
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // Khởi tạo Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Âm thanh khi di chuyển ô
  const playMoveSound = () => {
    if (!audioContextRef.current || !isSoundEnabled) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  // Âm thanh chiến thắng vui tươi
  const playWinSound = () => {
    if (!audioContextRef.current || !isSoundEnabled) return;
    const ctx = audioContextRef.current;
    
    // Chuỗi nốt nhạc vui tươi: C - E - G - C cao
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.15 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.15 + 0.3);
      
      oscillator.start(ctx.currentTime + index * 0.15);
      oscillator.stop(ctx.currentTime + index * 0.15 + 0.3);
    });
  };

  // Khởi tạo puzzle
  const initializePuzzle = () => {
    const numbers = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
    numbers.push(0); // 0 là ô trống
    
    // Shuffle tiles đảm bảo có thể giải được
    let shuffled = [...numbers];
    for (let i = 0; i < 100; i++) {
      const emptyIndex = shuffled.indexOf(0);
      const validMoves = getValidMoves(emptyIndex, gridSize);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      [shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyIndex]];
    }
    
    setTiles(shuffled);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setIsComplete(false);
  };

  useEffect(() => {
    initializePuzzle();
  }, [level]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isComplete]);

  // Lấy các nước đi hợp lệ
  const getValidMoves = (emptyIndex: number, size: number): number[] => {
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;
    const moves: number[] = [];

    if (row > 0) moves.push(emptyIndex - size); // Trên
    if (row < size - 1) moves.push(emptyIndex + size); // Dưới
    if (col > 0) moves.push(emptyIndex - 1); // Trái
    if (col < size - 1) moves.push(emptyIndex + 1); // Phải

    return moves;
  };

  // Kiểm tra hoàn thành
  const checkComplete = (currentTiles: number[]): boolean => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i + 1) return false;
    }
    return currentTiles[currentTiles.length - 1] === 0;
  };

  // Xử lý click tile
  const handleTileClick = (index: number) => {
    if (isComplete) return;
    
    if (!isPlaying) setIsPlaying(true);

    const emptyIndex = tiles.indexOf(0);
    const validMoves = getValidMoves(emptyIndex, gridSize);

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves(m => m + 1);
      
      // Phát âm thanh di chuyển
      playMoveSound();

      if (checkComplete(newTiles)) {
        setIsComplete(true);
        setIsPlaying(false);
        
        // Phát âm thanh chiến thắng
        playWinSound();
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Tính điểm dựa trên moves và time
        const baseScore = 1000;
        const movesPenalty = moves * 5;
        const timePenalty = time * 2;
        const finalScore = Math.max(100, baseScore - movesPenalty - timePenalty);
        
        // Tính stars
        const stars = moves < gridSize * 5 && time < 60 ? 3 : moves < gridSize * 8 ? 2 : 1;
        
        setTimeout(() => onLevelComplete(stars, finalScore), 1000);
      }
    }
  };

  // Màu sắc cho tiles - Pastel dịu mắt
  const getTileColor = (num: number): string => {
    const colors = [
      "from-cyan-300 to-blue-300",      // Xanh dương nhạt
      "from-pink-300 to-rose-300",      // Hồng nhạt
      "from-purple-300 to-indigo-300",  // Tím nhạt
      "from-amber-300 to-orange-300",   // Vàng cam nhạt
      "from-emerald-300 to-teal-300",   // Xanh lá nhạt
      "from-violet-300 to-fuchsia-300", // Tím hoa cà nhạt
      "from-lime-300 to-green-300",     // Xanh lá cây nhạt
      "from-sky-300 to-cyan-300",       // Xanh trời nhạt
    ];
    return colors[num % colors.length];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-fredoka font-bold bg-gradient-to-r from-primary via-accent to-glow bg-clip-text text-transparent">
            Lil Block Buddy 🧩
          </h1>
          <p className="text-lg text-muted-foreground font-comic">
            Sắp xếp các số theo thứ tự từ 1 đến {totalTiles - 1}!
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Level {level} • Grid {gridSize}x{gridSize}
          </Badge>
        </div>

        {/* Sound Toggle Button */}
        <div className="flex justify-end animate-fade-in">
          <Button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            variant="outline"
            size="icon"
            className="font-fredoka font-bold border-2 hover:scale-110 transition-all"
          >
            {isSoundEnabled ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center glassmorphism border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Số bước</p>
            <p className="text-2xl font-fredoka font-bold text-primary">{moves}</p>
          </Card>
          <Card className="p-4 text-center glassmorphism border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Thời gian</p>
            <p className="text-2xl font-fredoka font-bold text-accent">{formatTime(time)}</p>
          </Card>
          <Card className="p-4 text-center glassmorphism border-glow/20">
            <p className="text-sm text-muted-foreground mb-1">Target</p>
            <p className="text-2xl font-fredoka font-bold text-glow">⭐ {gridSize * 5}</p>
          </Card>
        </div>

        {/* Game Board */}
        <Card className="p-6 glassmorphism border-primary/20">
          <div 
            className="grid gap-2 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              maxWidth: '500px'
            }}
          >
            {tiles.map((num, index) => (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                disabled={num === 0 || isComplete}
                className={`aspect-square rounded-xl text-2xl md:text-3xl font-fredoka font-bold shadow-lg transition-all animate-fade-in ${
                  num === 0 
                    ? 'bg-background/50 cursor-default' 
                    : `bg-gradient-to-br ${getTileColor(num)} text-white hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95`
                }`}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                {num !== 0 && (
                  <div
                    className="inline-flex items-center justify-center px-3 py-1 rounded-2xl bg-black/30 backdrop-blur-sm"
                    style={{
                      textShadow:
                        '0 0 8px rgba(0,0,0,0.9), 2px 2px 0 rgba(0,0,0,0.9), -2px -2px 0 rgba(0,0,0,0.9)',
                      WebkitTextStroke: '1.5px black',
                    }}
                  >
                    {num}
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
              className="font-fredoka font-bold border-2 hover:scale-105 transition-all"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Quay lại
            </Button>
          )}
          <Button
            onClick={initializePuzzle}
            variant="outline"
            size="lg"
            className="font-fredoka font-bold border-2 hover:scale-105 transition-all"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        </div>

        {/* Win message */}
        {isComplete && (
          <div className="text-center space-y-2 animate-scale-in">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-fredoka font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Hoàn thành!
            </h2>
            <p className="text-lg text-muted-foreground">
              {moves} bước trong {formatTime(time)}
            </p>
          </div>
        )}

        {/* Tips */}
        <Card className="p-4 glassmorphism border-accent/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-fredoka font-bold text-accent">Mẹo chơi:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click vào ô cạnh ô trống để di chuyển</li>
                <li>• Hoàn thành càng nhanh và ít bước càng được nhiều sao</li>
                <li>• Grid size tăng dần theo level</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LilBlockBuddy;
