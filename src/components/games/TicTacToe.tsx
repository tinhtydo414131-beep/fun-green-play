import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw } from "lucide-react";

type Player = "X" | "O" | null;
type Difficulty = "easy" | "medium" | "hard";

const BOARD_SIZE = 10;
const WIN_LENGTH = 5;

export const TicTacToe = ({
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
  const [board, setBoard] = useState<Player[]>(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [wins, setWins] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameStarted, setGameStarted] = useState(false);
  const targetWins = Math.min(level, 3);

  const checkWinner = useCallback((squares: Player[], lastMove: number): Player => {
    if (lastMove === -1) return null;
    
    const row = Math.floor(lastMove / BOARD_SIZE);
    const col = lastMove % BOARD_SIZE;
    const player = squares[lastMove];
    
    if (!player) return null;

    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      
      // Check positive direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
          if (squares[r * BOARD_SIZE + c] === player) {
            count++;
          } else break;
        } else break;
      }
      
      // Check negative direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
          if (squares[r * BOARD_SIZE + c] === player) {
            count++;
          } else break;
        } else break;
      }
      
      if (count >= WIN_LENGTH) return player;
    }
    
    return null;
  }, []);

  const evaluateLine = (squares: Player[], start: number, dr: number, dc: number, player: Player): number => {
    let score = 0;
    const opponent = player === "O" ? "X" : "O";
    
    for (let len = WIN_LENGTH; len >= 2; len--) {
      for (let offset = 0; offset <= WIN_LENGTH - len; offset++) {
        let playerCount = 0;
        let emptyCount = 0;
        let blocked = false;
        
        for (let i = offset; i < offset + len; i++) {
          const row = Math.floor(start / BOARD_SIZE) + dr * i;
          const col = start % BOARD_SIZE + dc * i;
          
          if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
            blocked = true;
            break;
          }
          
          const cell = squares[row * BOARD_SIZE + col];
          if (cell === player) playerCount++;
          else if (cell === null) emptyCount++;
          else {
            blocked = true;
            break;
          }
        }
        
        if (!blocked && playerCount > 0 && emptyCount > 0) {
          score += Math.pow(10, playerCount);
        }
      }
    }
    
    return score;
  };

  const evaluatePosition = (squares: Player[], player: Player): number => {
    let score = 0;
    
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
      const row = Math.floor(i / BOARD_SIZE);
      const col = i % BOARD_SIZE;
      
      // Check all 4 directions from each cell
      score += evaluateLine(squares, i, 0, 1, player);  // horizontal
      score += evaluateLine(squares, i, 1, 0, player);  // vertical
      score += evaluateLine(squares, i, 1, 1, player);  // diagonal
      score += evaluateLine(squares, i, 1, -1, player); // anti-diagonal
    }
    
    return score;
  };

  const getEmptyCells = (squares: Player[]): number[] => {
    return squares.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
  };

  const getBestMove = useCallback((squares: Player[]): number => {
    const emptyCells = getEmptyCells(squares);
    if (emptyCells.length === 0) return -1;
    
    // Easy: mostly random moves
    if (difficulty === "easy") {
      if (Math.random() < 0.7) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }
    
    // Medium: 50% smart, 50% random
    if (difficulty === "medium") {
      if (Math.random() < 0.4) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }

    // For hard/smart moves: evaluate each possible move
    let bestScore = -Infinity;
    let bestMoves: number[] = [];
    
    for (const move of emptyCells) {
      const newSquares = [...squares];
      newSquares[move] = "O";
      
      // Check for immediate win
      if (checkWinner(newSquares, move) === "O") {
        return move;
      }
      
      // Check if this blocks opponent's win
      newSquares[move] = "X";
      if (checkWinner(newSquares, move) === "X") {
        return move;
      }
      
      newSquares[move] = "O";
      const score = evaluatePosition(newSquares, "O") - evaluatePosition(newSquares, "X") * 1.1;
      
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
    
    // Prefer center area
    const centerMoves = bestMoves.filter(move => {
      const row = Math.floor(move / BOARD_SIZE);
      const col = move % BOARD_SIZE;
      return row >= 3 && row <= 6 && col >= 3 && col <= 6;
    });
    
    if (centerMoves.length > 0) {
      return centerMoves[Math.floor(Math.random() * centerMoves.length)];
    }
    
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }, [difficulty, checkWinner]);

  const handleClick = (index: number) => {
    if (board[index] || !isXNext) return;
    
    // Check if there's already a winner
    const existingWinner = board.some((_, i) => checkWinner(board, i));
    if (existingWinner) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);

    const winner = checkWinner(newBoard, index);
    if (winner === "X") {
      const newWins = wins + 1;
      setWins(newWins);
      toast.success("Bạn thắng! 🎉");
      if (newWins >= targetWins && onLevelComplete) {
        setTimeout(() => onLevelComplete(), 1000);
      }
      return;
    }

    if (!newBoard.includes(null)) {
      toast("Hòa rồi! 🤝");
      return;
    }

    // AI move
    setTimeout(() => {
      const aiMove = getBestMove([...newBoard]);
      if (aiMove === -1) return;
      
      newBoard[aiMove] = "O";
      setBoard([...newBoard]);
      setIsXNext(true);

      const aiWinner = checkWinner(newBoard, aiMove);
      if (aiWinner === "O") {
        toast.error("Máy thắng rồi! 🤖");
      } else if (!newBoard.includes(null)) {
        toast("Hòa rồi! 🤝");
      }
    }, 300);
  };

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setIsXNext(true);
  };

  const resetAll = () => {
    resetGame();
    setWins(0);
    setGameStarted(false);
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameStarted(true);
    resetGame();
  };

  const hasWinner = board.some((_, i) => checkWinner(board, i));
  const isDraw = !hasWinner && !board.includes(null);
  const currentWinner = board.reduce<Player>((acc, _, i) => acc || checkWinner(board, i), null);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Caro 5 Ô</h2>
        <p className="text-muted-foreground text-center">Chọn độ khó để bắt đầu</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button 
            onClick={() => startGame("easy")} 
            size="lg" 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            🌱 Dễ
          </Button>
          <Button 
            onClick={() => startGame("medium")} 
            size="lg" 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            ⚡ Trung bình
          </Button>
          <Button 
            onClick={() => startGame("hard")} 
            size="lg" 
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            🔥 Khó
          </Button>
        </div>
        
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Thắng: {wins}/{targetWins}
          </h2>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            difficulty === "easy" ? "bg-green-500/20 text-green-600" :
            difficulty === "medium" ? "bg-yellow-500/20 text-yellow-600" :
            "bg-red-500/20 text-red-600"
          }`}>
            {difficulty === "easy" ? "Dễ" : difficulty === "medium" ? "TB" : "Khó"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentWinner ? `${currentWinner === "X" ? "Bạn" : "Máy"} thắng!` : isDraw ? "Hòa!" : `Lượt: ${isXNext ? "Bạn (X)" : "Máy (O)"}`}
        </p>
        <p className="text-xs text-muted-foreground/70">Nối 5 ô liên tiếp để thắng</p>
      </div>

      <Card className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 overflow-auto max-w-full">
        <div 
          className="grid gap-0.5"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            width: 'fit-content'
          }}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!!cell || !!currentWinner || !isXNext}
              className={`w-7 h-7 md:w-8 md:h-8 text-lg md:text-xl font-bold flex items-center justify-center rounded-sm transition-all touch-manipulation ${
                cell === "X" 
                  ? "bg-blue-500 text-white" 
                  : cell === "O" 
                  ? "bg-red-500 text-white" 
                  : "bg-white/80 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 hover:scale-105"
              } ${!cell && !currentWinner && isXNext ? "cursor-pointer" : "cursor-default"}`}
            >
              {cell === "X" && "✕"}
              {cell === "O" && "○"}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex gap-2 flex-wrap justify-center">
        {onBack && (
          <Button onClick={onBack} size="sm" variant="outline" className="touch-manipulation">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Quay lại
          </Button>
        )}
        <Button onClick={resetGame} size="sm" variant="outline" className="touch-manipulation">
          <RotateCcw className="mr-1 h-3 w-3" />
          Ván mới
        </Button>
        <Button onClick={resetAll} size="sm" className="touch-manipulation">
          Đổi độ khó
        </Button>
      </div>
    </div>
  );
};
