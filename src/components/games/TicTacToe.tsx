import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const TicTacToe = ({
  level = 1,
  difficultyMultiplier = 1.0,
  onLevelComplete
}: {
  level?: number;
  difficultyMultiplier?: number;
  onLevelComplete?: () => void;
  onBack?: () => void;
} = {}) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const targetWins = Math.max(1, Math.floor(level * 0.5)); // Level 1-2: 1 win, Level 3-4: 2 wins, etc.
  const aiDifficulty = Math.min(1, difficultyMultiplier / 2); // 0 = random, 1 = perfect

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // Minimax algorithm for AI
  const minimax = (squares: (string | null)[], isMaximizing: boolean): number => {
    const winner = calculateWinner(squares);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (squares.every(s => s !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minimax(squares, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minimax(squares, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getAIMove = (squares: (string | null)[]): number => {
    // Mix random and smart moves based on difficulty
    if (Math.random() > aiDifficulty) {
      // Random move
      const available = squares.map((s, i) => s === null ? i : -1).filter(i => i !== -1);
      return available[Math.floor(Math.random() * available.length)];
    }

    // Smart move using minimax
    let bestScore = -Infinity;
    let bestMove = 0;
    
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
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
    if (board[index] || winner || !isXNext || isThinking) return;
    
    // Player move (X)
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === 'X') {
        const newGamesWon = gamesWon + 1;
        setGamesWon(newGamesWon);
        setScore(score + 10);
        toast.success(`🎉 Bạn Thắng Rồi! (${newGamesWon}/${targetWins})`);
        if (newGamesWon >= targetWins && onLevelComplete) {
          setTimeout(() => onLevelComplete(), 1000);
        }
      } else {
        toast.error('🤖 Máy Thắng Rồi!');
      }
      return;
    }
    
    if (newBoard.every(square => square !== null)) {
      toast.info("Hòa rồi! 🤝");
      return;
    }
    
    // AI move (O)
    setIsXNext(false);
    setIsThinking(true);
    setTimeout(() => {
      const aiMove = getAIMove([...newBoard]);
      const aiBoard = [...newBoard];
      aiBoard[aiMove] = 'O';
      setBoard(aiBoard);
      setIsThinking(false);
      
      const aiWinner = calculateWinner(aiBoard);
      if (aiWinner) {
        setWinner(aiWinner);
        if (aiWinner === 'X') {
          const newGamesWon = gamesWon + 1;
          setGamesWon(newGamesWon);
          setScore(score + 10);
          toast.success(`🎉 Bạn Thắng Rồi! (${newGamesWon}/${targetWins})`);
          if (newGamesWon >= targetWins && onLevelComplete) {
            setTimeout(() => onLevelComplete(), 1000);
          }
        } else {
          toast.error('🤖 Máy Thắng Rồi!');
        }
        return;
      }
      
      if (aiBoard.every(square => square !== null)) {
        toast.info("Hòa rồi! 🤝");
        return;
      }
      
      setIsXNext(true);
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setIsThinking(false);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 animate-fade-in">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          {winner ? (winner === 'X' ? '🎉 Bạn Thắng Rồi!' : '🤖 Máy Thắng Rồi!') : isThinking ? '🤖 Máy Đang Suy Nghĩ...' : `Lượt: ${isXNext ? '❌ Bạn' : '⭕ Máy'}`}
        </h2>
        <p className="text-2xl font-comic text-primary">Thắng: {gamesWon}/{targetWins} | Điểm: {score} 🌟</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl shadow-2xl border-4 border-primary/30">
        {board.map((cell, index) => (
          <Card
            key={index}
            onClick={() => handleClick(index)}
            className="aspect-square flex items-center justify-center text-6xl font-bold cursor-pointer transition-all duration-300 border-4 border-primary/30 hover:border-primary hover:bg-gradient-to-br hover:from-primary/20 hover:to-secondary/20 transform hover:scale-110 shadow-lg hover:shadow-2xl"
          >
            {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
          </Card>
        ))}
      </div>
      
      <Button 
        onClick={resetGame} 
        size="lg"
        className="font-fredoka font-bold text-xl px-12 py-8 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-110 transition-all"
      >
        Chơi Lại 🔄
      </Button>
    </div>
  );
};
