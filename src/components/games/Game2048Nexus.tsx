import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wallet, Coins, Trophy, Zap, Award, Share2, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

interface Game2048NexusProps {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
}

export const Game2048Nexus = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete,
  onBack
}: Game2048NexusProps) => {
  const { user } = useAuth();
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [nexusTokens, setNexusTokens] = useState(0);
  const [highestTile, setHighestTile] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const gridSize = level <= 5 ? 4 : level <= 10 ? 5 : level <= 15 ? 6 : 7;
  const targetTile = Math.pow(2, Math.min(17, 11 + Math.floor(level / 5)));

  useEffect(() => {
    initializeGame();
    loadUserStats();
  }, [level]);

  const loadUserStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_nexus_stats')
      .select('nexus_tokens, highest_tile')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setNexusTokens(data.nexus_tokens);
      setHighestTile(data.highest_tile);
    } else if (!error) {
      // Create initial stats
      await supabase.from('user_nexus_stats').insert({
        user_id: user.id,
        nexus_tokens: 0,
        highest_tile: 0
      });
    }
  };

  const initializeGame = () => {
    const newBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    addNewTile(newBoard);
    addNewTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  };

  const addNewTile = (currentBoard: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const updateUserStats = useCallback(async (newScore: number, maxTile: number) => {
    if (!user) return;

    const tokensEarned = Math.floor(newScore / 1000);
    
    // First get current games_played count
    const { data: currentStats } = await supabase
      .from('user_nexus_stats')
      .select('games_played')
      .eq('user_id', user.id)
      .single();

    const { error } = await supabase
      .from('user_nexus_stats')
      .update({
        nexus_tokens: nexusTokens + tokensEarned,
        total_score: newScore,
        highest_tile: Math.max(highestTile, maxTile),
        games_played: (currentStats?.games_played || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (!error && tokensEarned > 0) {
      setNexusTokens(prev => prev + tokensEarned);
      toast.success(`🪙 Earned ${tokensEarned} Camly coin!`);
    }
  }, [user, nexusTokens, highestTile]);

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const slide = (row: number[]) => {
      const filtered = row.filter(cell => cell !== 0);
      const merged: number[] = [];
      
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          newScore += filtered[i] * 2;
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      
      while (merged.length < gridSize) {
        merged.push(0);
      }
      
      return merged;
    };

    if (direction === 'left') {
      newBoard = newBoard.map(row => slide(row));
    } else if (direction === 'right') {
      newBoard = newBoard.map(row => slide(row.reverse()).reverse());
    } else if (direction === 'up') {
      for (let col = 0; col < gridSize; col++) {
        const column = newBoard.map(row => row[col]);
        const slided = slide(column);
        for (let row = 0; row < gridSize; row++) {
          newBoard[row][col] = slided[row];
        }
      }
    } else if (direction === 'down') {
      for (let col = 0; col < gridSize; col++) {
        const column = newBoard.map(row => row[col]).reverse();
        const slided = slide(column).reverse();
        for (let row = 0; row < gridSize; row++) {
          newBoard[row][col] = slided[row];
        }
      }
    }

    moved = JSON.stringify(board) !== JSON.stringify(newBoard);

    if (moved) {
      addNewTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      
      const maxTile = Math.max(...newBoard.flat());
      if (maxTile > highestTile) {
        setHighestTile(maxTile);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (maxTile >= targetTile) {
        toast.success(`🎉 Level ${level} Complete! Target ${targetTile} reached!`);
        updateUserStats(newScore, maxTile);
        if (onLevelComplete) onLevelComplete();
      }

      // Update stats every 1000 points
      if (Math.floor(newScore / 1000) > Math.floor(score / 1000)) {
        updateUserStats(newScore, maxTile);
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [board]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        move(deltaY > 0 ? 'down' : 'up');
      }
    }

    setTouchStart(null);
  };

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      0: 'bg-background/20 border-primary/10',
      2: 'bg-gradient-to-br from-cyan-500/80 to-blue-500/80',
      4: 'bg-gradient-to-br from-blue-500/80 to-purple-500/80',
      8: 'bg-gradient-to-br from-purple-500/80 to-pink-500/80',
      16: 'bg-gradient-to-br from-pink-500/80 to-rose-500/80',
      32: 'bg-gradient-to-br from-rose-500/80 to-orange-500/80',
      64: 'bg-gradient-to-br from-orange-500/80 to-amber-500/80',
      128: 'bg-gradient-to-br from-amber-500/80 to-yellow-500/80',
      256: 'bg-gradient-to-br from-yellow-500/80 to-lime-500/80',
      512: 'bg-gradient-to-br from-lime-500/80 to-emerald-500/80',
      1024: 'bg-gradient-to-br from-emerald-500/80 to-teal-500/80',
      2048: 'bg-gradient-to-br from-teal-500/80 to-cyan-500/80',
    };
    return colors[value] || 'bg-gradient-to-br from-primary to-accent';
  };

  const shareScore = () => {
    const text = `🎮 I just scored ${score} with a ${highestTile} tile in 2048 Nexus! Can you beat it? #2048Nexus #Web3Gaming`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Stats */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-fredoka font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            2048 NEXUS
          </h1>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Card className="px-4 py-2 bg-background/50 backdrop-blur border-primary/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Score</div>
                  <div className="text-lg font-bold">{score}</div>
                </div>
              </div>
            </Card>

            <Card className="px-4 py-2 bg-background/50 backdrop-blur border-accent/20">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Camly coin</div>
                  <div className="text-lg font-bold">{nexusTokens}</div>
                </div>
              </div>
            </Card>

            <Card className="px-4 py-2 bg-background/50 backdrop-blur border-primary/20">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-500" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Best Tile</div>
                  <div className="text-lg font-bold">{highestTile || 0}</div>
                </div>
              </div>
            </Card>
          </div>

          <Badge variant="secondary" className="text-lg px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
            Level {level} • Grid {gridSize}×{gridSize} • Target: {targetTile}
          </Badge>
        </div>

        {/* Game Board */}
        <Card 
          className="p-4 bg-background/30 backdrop-blur border-primary/20 shadow-2xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`aspect-square rounded-xl flex items-center justify-center text-2xl md:text-3xl font-fredoka font-bold shadow-lg transition-all duration-200 ${getTileColor(cell)} ${cell !== 0 ? 'animate-scale-in border-2 border-white/20' : ''}`}
                  style={{ 
                    animationDelay: `${(i * gridSize + j) * 20}ms`,
                    textShadow: cell !== 0 ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                    boxShadow: cell !== 0 ? '0 0 20px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.1)' : 'none'
                  }}
                >
                  {cell !== 0 && (
                    <span className="text-white drop-shadow-lg">{cell}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex gap-4 justify-center flex-wrap">
          {onBack && (
            <Button 
              onClick={onBack}
              size="lg"
              variant="outline"
              className="border-primary/30 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          )}
          
          <Button 
            onClick={initializeGame} 
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform"
          >
            <Zap className="w-4 h-4 mr-2" />
            New Game
          </Button>

          <Button 
            onClick={shareScore}
            size="lg"
            variant="outline"
            className="border-primary/30 hover:scale-105 transition-transform"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Score
          </Button>

          {!user && (
            <Button 
              onClick={() => window.location.href = '/auth'}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 transition-transform"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Login to Earn
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card className="p-4 bg-background/30 backdrop-blur border-primary/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            How to Play
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use arrow keys (or swipe on mobile) to move tiles</li>
            <li>• Merge tiles with same numbers to create bigger tiles</li>
            <li>• Earn 1 Camly coin for every 1000 points</li>
            <li>• Reach {targetTile} to complete Level {level}</li>
            <li>• Grid size increases with level: {gridSize}×{gridSize}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
