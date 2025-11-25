import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const TicTacToe = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState(0);

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

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setScore(score + 10);
      toast.success(`🎉 ${gameWinner} Thắng Rồi!`);
    } else if (newBoard.every(square => square !== null)) {
      toast.info("Hòa rồi! 🤝");
    }
    
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 animate-fade-in">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          {winner ? `🎉 ${winner} Thắng Rồi!` : `Lượt: ${isXNext ? '❌' : '⭕'}`}
        </h2>
        <p className="text-2xl font-comic text-primary">Điểm: {score} 🌟</p>
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
