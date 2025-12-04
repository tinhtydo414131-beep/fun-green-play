import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw } from "lucide-react";

type Player = "X" | "O" | null;

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
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [wins, setWins] = useState(0);
  const targetWins = Math.min(level, 3);

  const calculateWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const minimax = (squares: Player[], isMaximizing: boolean): number => {
    const winner = calculateWinner(squares);
    if (winner === "O") return 10;
    if (winner === "X") return -10;
    if (!squares.includes(null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "O";
          bestScore = Math.max(bestScore, minimax(squares, false));
          squares[i] = null;
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "X";
          bestScore = Math.min(bestScore, minimax(squares, true));
          squares[i] = null;
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (squares: Player[]): number => {
    // Easy mode: sometimes make random moves
    const difficulty = level * difficultyMultiplier;
    if (difficulty < 2 && Math.random() < 0.5) {
      const empty = squares.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
      return empty[Math.floor(Math.random() * empty.length)];
    }

    let bestScore = -Infinity;
    let bestMove = 0;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = "O";
        const score = minimax(squares, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const handleClick = (index: number) => {
    if (board[index] || calculateWinner(board) || !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);

    const winner = calculateWinner(newBoard);
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
      newBoard[aiMove] = "O";
      setBoard([...newBoard]);
      setIsXNext(true);

      const aiWinner = calculateWinner(newBoard);
      if (aiWinner === "O") {
        toast.error("Máy thắng rồi! 🤖");
      } else if (!newBoard.includes(null)) {
        toast("Hòa rồi! 🤝");
      }
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const resetAll = () => {
    resetGame();
    setWins(0);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && !board.includes(null);

  return (
    <div className="flex flex-col items-center gap-3 md:gap-6 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Thắng: {wins}/{targetWins}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {winner ? `${winner === "X" ? "Bạn" : "Máy"} thắng!` : isDraw ? "Hòa!" : `Lượt: ${isXNext ? "Bạn (X)" : "Máy (O)"}`}
        </p>
      </div>

      <Card className="p-3 md:p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {board.map((cell, index) => (
            <Button
              key={index}
              onClick={() => handleClick(index)}
              onTouchStart={(e) => { e.preventDefault(); handleClick(index); }}
              disabled={!!cell || !!winner || !isXNext}
              className={`w-[5.5rem] h-[5.5rem] md:w-24 md:h-24 text-4xl md:text-5xl font-bold touch-manipulation will-change-transform active:scale-95 transition-transform ${
                cell === "X" 
                  ? "bg-blue-500 hover:bg-blue-600 text-white" 
                  : cell === "O" 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-white/80 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700"
              }`}
              variant="outline"
            >
              {cell === "X" && "❌"}
              {cell === "O" && "⭕"}
            </Button>
          ))}
        </div>
      </Card>

      <div className="flex gap-3 flex-wrap justify-center">
        {onBack && (
          <Button onClick={onBack} size="lg" variant="outline" className="touch-manipulation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button onClick={resetGame} size="lg" variant="outline" className="touch-manipulation">
          <RotateCcw className="mr-2 h-4 w-4" />
          Ván mới
        </Button>
        <Button onClick={resetAll} size="lg" className="touch-manipulation">
          Từ đầu
        </Button>
      </div>
    </div>
  );
};
