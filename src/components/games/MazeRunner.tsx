import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "@/components/AudioControls";
import { ArrowLeft } from "lucide-react";
import { MobileGameControls } from "@/components/MobileGameControls";
import { useIsMobile } from "@/hooks/use-mobile";

export const MazeRunner = ({
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
  const isMobile = useIsMobile();
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const goalPos = { x: 9, y: 9 };
  const maxMoves = Math.floor(30 / difficultyMultiplier);
  const { playClick, playSuccess, startBackgroundMusic, stopBackgroundMusic, toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } = useGameAudio();

  const maze = [
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      let newX = playerPos.x;
      let newY = playerPos.y;

      switch(e.key) {
        case 'ArrowUp': newY = Math.max(0, playerPos.y - 1); break;
        case 'ArrowDown': newY = Math.min(9, playerPos.y + 1); break;
        case 'ArrowLeft': newX = Math.max(0, playerPos.x - 1); break;
        case 'ArrowRight': newX = Math.min(9, playerPos.x + 1); break;
        default: return;
      }

      if (maze[newY][newX] === 0) {
        setPlayerPos({ x: newX, y: newY });
        setMoves(moves + 1);
        playClick();

        if (newX === goalPos.x && newY === goalPos.y) {
          playSuccess();
          toast.success(`Thắng rồi! Số bước: ${moves + 1}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, moves]);

  const resetGame = () => {
    setPlayerPos({ x: 0, y: 0 });
    setMoves(0);
    startBackgroundMusic();
  };

  const handleMobileControl = (direction: 'up' | 'down' | 'left' | 'right') => {
    let newX = playerPos.x;
    let newY = playerPos.y;

    switch(direction) {
      case 'up': newY = Math.max(0, playerPos.y - 1); break;
      case 'down': newY = Math.min(9, playerPos.y + 1); break;
      case 'left': newX = Math.max(0, playerPos.x - 1); break;
      case 'right': newX = Math.min(9, playerPos.x + 1); break;
    }

    if (maze[newY][newX] === 0) {
      setPlayerPos({ x: newX, y: newY });
      setMoves(moves + 1);
      playClick();

      if (newX === goalPos.x && newY === goalPos.y) {
        playSuccess();
        toast.success(`Thắng rồi! Số bước: ${moves + 1}`);
      }
    }
  };

  useEffect(() => {
    startBackgroundMusic();
    return () => stopBackgroundMusic();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Số bước: {moves}
        </h2>
        <p className="text-muted-foreground">Dùng phím mũi tên</p>
        <AudioControls 
          isMusicEnabled={isMusicEnabled}
          isSoundEnabled={isSoundEnabled}
          onToggleMusic={toggleMusic}
          onToggleSound={toggleSound}
        />
      </div>

      <div className="grid grid-cols-10 gap-1 p-4 bg-muted/30 rounded-lg">
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-8 h-8 ${
                x === playerPos.x && y === playerPos.y ? 'bg-primary' :
                x === goalPos.x && y === goalPos.y ? 'bg-yellow-500' :
                cell === 1 ? 'bg-foreground' : 'bg-background'
              } border border-border`}
            >
              {x === playerPos.x && y === playerPos.y && '🏃'}
              {x === goalPos.x && y === goalPos.y && '🏆'}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-4">
        {onBack && (
          <Button 
            onClick={onBack}
            size="lg"
            variant="outline"
          >
            <ArrowLeft className="mr-2" />
            Quay lại
          </Button>
        )}
        <Button onClick={resetGame} size="lg">Chơi lại</Button>
      </div>

      {isMobile && (
        <MobileGameControls
          onDirectionPress={handleMobileControl}
          showJumpButton={false}
        />
      )}
    </div>
  );
};
