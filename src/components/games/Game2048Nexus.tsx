import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { haptics } from "@/utils/haptics";
import { useIsMobile } from "@/hooks/use-mobile";
import { NexusParticleSystem } from "./nexus2048/NexusParticleSystem";
import { NexusGrid } from "./nexus2048/NexusGrid";
import { NexusHUD } from "./nexus2048/NexusHUD";
import { NexusControls } from "./nexus2048/NexusControls";
import { NexusGameOver } from "./nexus2048/NexusGameOver";
import { NexusAudioSystem } from "./nexus2048/NexusAudio";
import NexusLevelMap from "./NexusLevelMap";

interface Game2048NexusProps {
  onBack?: () => void;
}

const POINTS_PER_LEVEL = 600;

export const Game2048Nexus = ({ onBack }: Game2048NexusProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<NexusAudioSystem | null>(null);
  
  // Level selection state
  const [showLevelMap, setShowLevelMap] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [highestUnlocked, setHighestUnlocked] = useState(1);
  const [totalPlays, setTotalPlays] = useState(0);
  
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [nexusTokens, setNexusTokens] = useState(0);
  const [highestTile, setHighestTile] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [newTilePos, setNewTilePos] = useState<{ row: number; col: number } | null>(null);
  const [mergedTiles, setMergedTiles] = useState<Set<string>>(new Set());
  const [mergeEffects, setMergeEffects] = useState<{ x: number; y: number; color: string; value: number }[]>([]);
  const [spawnEffects, setSpawnEffects] = useState<{ x: number; y: number }[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 600 });

  const gridSize = currentLevel <= 5 ? 4 : currentLevel <= 10 ? 5 : 6;
  const targetScore = currentLevel * POINTS_PER_LEVEL;

  // Initialize audio
  useEffect(() => {
    audioRef.current = new NexusAudioSystem();
    return () => audioRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (isMusicOn) audioRef.current?.startMusic();
    else audioRef.current?.stopMusic();
  }, [isMusicOn]);

  // Container size for particles
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Load user stats and level progress
  useEffect(() => {
    if (!user) return;
    
    // Load nexus stats
    supabase.from('user_nexus_stats').select('nexus_tokens, highest_tile, total_score, games_played')
      .eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setNexusTokens(data.nexus_tokens);
          setHighScore(data.total_score || 0);
          setHighestTile(data.highest_tile);
          setTotalPlays(data.games_played || 0);
          // Calculate highest unlocked level based on total score
          const unlockedLevel = Math.min(100, Math.floor((data.total_score || 0) / POINTS_PER_LEVEL) + 1);
          setHighestUnlocked(Math.max(1, unlockedLevel));
        }
      });
  }, [user]);

  const initializeGame = useCallback(() => {
    const newBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    addNewTile(newBoard);
    addNewTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setIsWin(false);
  }, [gridSize]);

  useEffect(() => { 
    if (!showLevelMap) {
      initializeGame(); 
    }
  }, [initializeGame, showLevelMap]);

  const addNewTile = (currentBoard: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < currentBoard.length; i++) {
      for (let j = 0; j < currentBoard[i].length; j++) {
        if (currentBoard[i][j] === 0) emptyCells.push([i, j]);
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
      setNewTilePos({ row, col });
      if (isSoundOn) audioRef.current?.playSpawn();
    }
  };

  const handleLevelComplete = useCallback(async () => {
    if (!user) return;
    
    // Unlock next level
    const nextLevel = Math.min(100, currentLevel + 1);
    if (nextLevel > highestUnlocked) {
      setHighestUnlocked(nextLevel);
    }
    
    // Save progress
    try {
      await supabase.from('user_nexus_stats').upsert({
        user_id: user.id,
        total_score: Math.max(highScore, score),
        games_played: totalPlays + 1,
        highest_tile: highestTile,
        level_reached: nextLevel
      }, { onConflict: 'user_id' });
      
      setTotalPlays(prev => prev + 1);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [user, currentLevel, highestUnlocked, highScore, score, totalPlays, highestTile]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || isPaused) return;
    if (isSoundOn) audioRef.current?.playSlide();
    haptics.light();

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;
    const size = newBoard.length;

    const slide = (row: number[]) => {
      const filtered = row.filter(cell => cell !== 0);
      const merged: number[] = [];
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          newScore += filtered[i] * 2;
          i++;
        } else merged.push(filtered[i]);
      }
      while (merged.length < size) merged.push(0);
      return merged;
    };

    if (direction === 'left') newBoard = newBoard.map(row => slide(row));
    else if (direction === 'right') newBoard = newBoard.map(row => slide([...row].reverse()).reverse());
    else if (direction === 'up') {
      for (let col = 0; col < size; col++) {
        const column = newBoard.map(row => row[col]);
        const slided = slide(column);
        for (let row = 0; row < size; row++) newBoard[row][col] = slided[row];
      }
    } else if (direction === 'down') {
      for (let col = 0; col < size; col++) {
        const column = newBoard.map(row => row[col]).reverse();
        const slided = slide(column).reverse();
        for (let row = 0; row < size; row++) newBoard[row][col] = slided[row];
      }
    }

    moved = JSON.stringify(board) !== JSON.stringify(newBoard);

    if (moved) {
      addNewTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      setMoves(m => m + 1);

      const maxTile = Math.max(...newBoard.flat());
      if (maxTile > highestTile) {
        setHighestTile(maxTile);
        if (isSoundOn) audioRef.current?.playMerge(maxTile);
        haptics.success();
      }

      // Check if level is complete (score reached target)
      if (newScore >= targetScore && !isWin) {
        setIsWin(true);
        if (isSoundOn) audioRef.current?.playWin();
        toast.success(`🎉 Level ${currentLevel} Complete! +${targetScore} points!`);
        handleLevelComplete();
      }

      // Check game over
      let canMove = false;
      for (let i = 0; i < size && !canMove; i++) {
        for (let j = 0; j < size && !canMove; j++) {
          if (newBoard[i][j] === 0) canMove = true;
          if (i < size - 1 && newBoard[i][j] === newBoard[i + 1][j]) canMove = true;
          if (j < size - 1 && newBoard[i][j] === newBoard[i][j + 1]) canMove = true;
        }
      }
      if (!canMove) {
        setGameOver(true);
        if (isSoundOn) audioRef.current?.playGameOver();
      }
    }
  }, [board, score, gameOver, isPaused, highestTile, targetScore, isWin, currentLevel, isSoundOn, handleLevelComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dir = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        move(dir);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
    }
    setTouchStart(null);
  };

  const shareScore = () => {
    const text = `🎮 I scored ${score} with a ${highestTile} tile in 2048 Nexus Level ${currentLevel}! #2048Nexus`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    setShowLevelMap(false);
  };

  const handleBackToLevelMap = () => {
    setShowLevelMap(true);
    setGameOver(false);
    setIsWin(false);
  };

  // Show level map
  if (showLevelMap) {
    return (
      <NexusLevelMap
        highestUnlocked={highestUnlocked}
        totalScore={highScore}
        onSelectLevel={handleSelectLevel}
        onBack={onBack}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={(e) => e.preventDefault()}
    >
      <NexusParticleSystem
        width={containerSize.width}
        height={containerSize.height}
        mergeEffects={mergeEffects}
        spawnEffects={spawnEffects}
        isGameOver={gameOver}
        isWin={isWin}
      />

      <div className="relative z-10 max-w-2xl mx-auto p-4 space-y-6">
        <NexusHUD
          score={score}
          highScore={highScore}
          nexusTokens={nexusTokens}
          moves={moves}
          targetTile={targetScore}
          level={currentLevel}
          gridSize={gridSize}
          isMusicOn={isMusicOn}
          isSoundOn={isSoundOn}
          onToggleMusic={() => setIsMusicOn(!isMusicOn)}
          onToggleSound={() => setIsSoundOn(!isSoundOn)}
        />

        <NexusGrid board={board} gridSize={gridSize} newTilePos={newTilePos} mergedTiles={mergedTiles} />

        <NexusControls
          onMove={move}
          onRestart={initializeGame}
          onShare={shareScore}
          onBack={handleBackToLevelMap}
          onTogglePause={() => setIsPaused(!isPaused)}
          onToggleFullscreen={toggleFullscreen}
          isPaused={isPaused}
          isFullscreen={isFullscreen}
          isMobile={isMobile}
        />
      </div>

      <NexusGameOver
        isVisible={gameOver || isWin}
        isWin={isWin}
        score={score}
        highScore={Math.max(score, highScore)}
        highestTile={highestTile}
        onRestart={isWin ? handleBackToLevelMap : initializeGame}
        onShare={shareScore}
      />
    </div>
  );
};