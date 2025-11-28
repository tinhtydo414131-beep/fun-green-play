import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { Sparkles, RotateCcw, ArrowLeft, Volume2, VolumeX, Wand2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LilBlockBuddyProps {
  level: number;
  onLevelComplete: (stars: number, score: number) => void;
  onBack?: () => void;
}

interface LevelRecord {
  bestMoves: number;
  bestTime: number;
  lastPlayed: string;
}

const LilBlockBuddy = ({ level, onLevelComplete, onBack }: LilBlockBuddyProps) => {
  const gridSize = Math.min(3 + level, 5);
  const totalTiles = gridSize * gridSize;
  const { toast } = useToast();
  
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAutoSolving, setIsAutoSolving] = useState(false);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [levelRecord, setLevelRecord] = useState<LevelRecord | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const autoSolveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Giới hạn thử thách dựa trên level
  const maxMoves = gridSize * 10;
  const maxTime = 60 + (level * 15);

  // Load kỷ lục từ localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('lilBlockBuddyRecords');
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      if (records[level]) {
        setLevelRecord(records[level]);
      }
    }
  }, [level]);

  // Khởi tạo Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
      if (autoSolveIntervalRef.current) {
        clearInterval(autoSolveIntervalRef.current);
      }
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
    setIsFailed(false);
  };

  useEffect(() => {
    initializePuzzle();
  }, [level]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isComplete && !isFailed) {
      interval = setInterval(() => {
        setTime(t => {
          const newTime = t + 1;
          // Kiểm tra giới hạn thời gian trong chế độ thử thách
          if (isChallengeMode && newTime >= maxTime) {
            setIsPlaying(false);
            setIsFailed(true);
            toast({
              title: "Hết thời gian! ⏰",
              description: "Bạn đã vượt quá giới hạn thời gian. Thử lại nhé!",
              variant: "destructive",
            });
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isComplete, isFailed, isChallengeMode, maxTime, toast]);

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
    if (isComplete || isFailed) return;
    
    if (!isPlaying) setIsPlaying(true);

    const emptyIndex = tiles.indexOf(0);
    const validMoves = getValidMoves(emptyIndex, gridSize);

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      
      const newMoves = moves + 1;
      setMoves(newMoves);
      
      // Kiểm tra giới hạn số bước trong chế độ thử thách
      if (isChallengeMode && newMoves >= maxMoves) {
        setIsPlaying(false);
        setIsFailed(true);
        toast({
          title: "Hết lượt! 🎯",
          description: "Bạn đã dùng hết số bước cho phép. Thử lại nhé!",
          variant: "destructive",
        });
        return;
      }
      
      playMoveSound();

      if (checkComplete(newTiles)) {
        setIsComplete(true);
        setIsPlaying(false);
        
        playWinSound();
        
        // Cập nhật kỷ lục
        const isNewRecord = !levelRecord || 
          newMoves < levelRecord.bestMoves || 
          time < levelRecord.bestTime;
        
        if (isNewRecord) {
          const newRecord: LevelRecord = {
            bestMoves: !levelRecord ? newMoves : Math.min(newMoves, levelRecord.bestMoves),
            bestTime: !levelRecord ? time : Math.min(time, levelRecord.bestTime),
            lastPlayed: new Date().toISOString(),
          };
          
          setLevelRecord(newRecord);
          
          // Lưu vào localStorage
          const savedRecords = localStorage.getItem('lilBlockBuddyRecords');
          const records = savedRecords ? JSON.parse(savedRecords) : {};
          records[level] = newRecord;
          localStorage.setItem('lilBlockBuddyRecords', JSON.stringify(records));
          
          toast({
            title: "🎉 Kỷ lục mới!",
            description: `Bạn đã phá kỷ lục ${newMoves < (levelRecord?.bestMoves || Infinity) ? 'số bước' : 'thời gian'}!`,
          });
        }
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        const baseScore = 1000;
        const movesPenalty = newMoves * 5;
        const timePenalty = time * 2;
        const challengeBonus = isChallengeMode ? 500 : 0;
        const finalScore = Math.max(100, baseScore - movesPenalty - timePenalty + challengeBonus);
        
        const stars = newMoves < gridSize * 5 && time < 60 ? 3 : newMoves < gridSize * 8 ? 2 : 1;
        
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

  // Tính Manhattan distance cho A* heuristic
  const getManhattanDistance = (tiles: number[]): number => {
    let distance = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === 0) continue;
      const currentRow = Math.floor(i / gridSize);
      const currentCol = i % gridSize;
      const targetRow = Math.floor((tiles[i] - 1) / gridSize);
      const targetCol = (tiles[i] - 1) % gridSize;
      distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    }
    return distance;
  };

  // Tìm đường giải bằng A*
  const solvePuzzle = (): number[] => {
    interface Node {
      tiles: number[];
      moves: number[];
      cost: number;
      heuristic: number;
    }

    const start: Node = {
      tiles: [...tiles],
      moves: [],
      cost: 0,
      heuristic: getManhattanDistance(tiles),
    };

    const openSet: Node[] = [start];
    const visited = new Set<string>();

    while (openSet.length > 0) {
      // Sắp xếp theo f = cost + heuristic
      openSet.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));
      const current = openSet.shift()!;

      const stateKey = current.tiles.join(',');
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      if (checkComplete(current.tiles)) {
        return current.moves;
      }

      const emptyIndex = current.tiles.indexOf(0);
      const validMoves = getValidMoves(emptyIndex, gridSize);

      for (const moveIndex of validMoves) {
        const newTiles = [...current.tiles];
        [newTiles[emptyIndex], newTiles[moveIndex]] = [newTiles[moveIndex], newTiles[emptyIndex]];

        const newNode: Node = {
          tiles: newTiles,
          moves: [...current.moves, moveIndex],
          cost: current.cost + 1,
          heuristic: getManhattanDistance(newTiles),
        };

        openSet.push(newNode);
      }

      // Giới hạn số node để tránh treo
      if (visited.size > 10000) {
        return [];
      }
    }

    return [];
  };

  // Tự động giải puzzle
  const handleAutoSolve = () => {
    if (isAutoSolving) {
      setIsAutoSolving(false);
      if (autoSolveIntervalRef.current) {
        clearInterval(autoSolveIntervalRef.current);
        autoSolveIntervalRef.current = null;
      }
      return;
    }

    setIsAutoSolving(true);
    const solution = solvePuzzle();

    if (solution.length === 0) {
      setIsAutoSolving(false);
      return;
    }

    let stepIndex = 0;
    autoSolveIntervalRef.current = setInterval(() => {
      if (stepIndex >= solution.length) {
        setIsAutoSolving(false);
        if (autoSolveIntervalRef.current) {
          clearInterval(autoSolveIntervalRef.current);
          autoSolveIntervalRef.current = null;
        }
        return;
      }

      handleTileClick(solution[stepIndex]);
      stepIndex++;
    }, 500);
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
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Level {level} • Grid {gridSize}x{gridSize}
            </Badge>
            {isChallengeMode && (
              <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
                <Zap className="w-4 h-4 mr-1" />
                Chế độ Thử thách
              </Badge>
            )}
          </div>
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
          <Card className={cn(
            "p-4 text-center glassmorphism border-primary/20",
            isChallengeMode && moves >= maxMoves * 0.8 && "border-destructive/50 animate-pulse"
          )}>
            <p className="text-sm text-muted-foreground mb-1">
              Số bước {isChallengeMode && `(${maxMoves} max)`}
            </p>
            <p className={cn(
              "text-2xl font-fredoka font-bold",
              isChallengeMode && moves >= maxMoves * 0.8 ? "text-destructive" : "text-primary"
            )}>
              {moves}
            </p>
            {levelRecord && (
              <p className="text-xs text-muted-foreground mt-1">
                🏆 Tốt nhất: {levelRecord.bestMoves}
              </p>
            )}
          </Card>
          <Card className={cn(
            "p-4 text-center glassmorphism border-accent/20",
            isChallengeMode && time >= maxTime * 0.8 && "border-destructive/50 animate-pulse"
          )}>
            <p className="text-sm text-muted-foreground mb-1">
              Thời gian {isChallengeMode && `(${formatTime(maxTime)} max)`}
            </p>
            <p className={cn(
              "text-2xl font-fredoka font-bold",
              isChallengeMode && time >= maxTime * 0.8 ? "text-destructive" : "text-accent"
            )}>
              {formatTime(time)}
            </p>
            {levelRecord && (
              <p className="text-xs text-muted-foreground mt-1">
                🏆 Tốt nhất: {formatTime(levelRecord.bestTime)}
              </p>
            )}
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
        <div className="flex justify-center gap-4 flex-wrap">
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
            onClick={() => {
              setIsChallengeMode(!isChallengeMode);
              initializePuzzle();
            }}
            variant={isChallengeMode ? "default" : "outline"}
            size="lg"
            className="font-fredoka font-bold border-2 hover:scale-105 transition-all"
          >
            <Zap className="mr-2 h-5 w-5" />
            {isChallengeMode ? "Chế độ thường" : "Thử thách"}
          </Button>
          <Button
            onClick={initializePuzzle}
            variant="outline"
            size="lg"
            className="font-fredoka font-bold border-2 hover:scale-105 transition-all"
            disabled={isAutoSolving}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
          <Button
            onClick={handleAutoSolve}
            variant={isAutoSolving ? "default" : "outline"}
            size="lg"
            className="font-fredoka font-bold border-2 hover:scale-105 transition-all"
            disabled={isComplete || isChallengeMode}
          >
            <Wand2 className="mr-2 h-5 w-5" />
            {isAutoSolving ? "Dừng" : "Tự động giải"}
          </Button>
        </div>

        {/* Win/Fail message */}
        {isComplete && (
          <div className="text-center space-y-2 animate-scale-in">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-fredoka font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Hoàn thành!
            </h2>
            <p className="text-lg text-muted-foreground">
              {moves} bước trong {formatTime(time)}
            </p>
            {isChallengeMode && (
              <Badge variant="default" className="text-lg px-4 py-2">
                🏆 Bonus +500 điểm (Chế độ thử thách)
              </Badge>
            )}
          </div>
        )}
        
        {isFailed && (
          <div className="text-center space-y-2 animate-scale-in">
            <div className="text-6xl">😅</div>
            <h2 className="text-3xl font-fredoka font-bold bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
              Thử lại nhé!
            </h2>
            <p className="text-lg text-muted-foreground">
              {moves >= maxMoves ? "Đã dùng hết số bước cho phép" : "Đã hết thời gian"}
            </p>
            <Button
              onClick={initializePuzzle}
              size="lg"
              className="font-fredoka font-bold"
            >
              Chơi lại
            </Button>
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
                {isChallengeMode && (
                  <>
                    <li className="text-destructive font-bold">• ⚡ Chế độ thử thách: Giới hạn thời gian và số bước!</li>
                    <li className="text-primary font-bold">• 🏆 Hoàn thành được thưởng +500 điểm bonus</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LilBlockBuddy;
