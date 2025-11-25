import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const TicTacToe = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

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
      toast.success(`${gameWinner} thắng!`);
    } else if (newBoard.every(square => square !== null)) {
      toast.info("Hòa!");
    }
    
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {winner ? `${winner} thắng!` : `Lượt: ${isXNext ? 'X' : 'O'}`}
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {board.map((cell, index) => (
          <Card
            key={index}
            onClick={() => handleClick(index)}
            className="aspect-square flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-primary/20 transition-colors border-2 border-border hover:border-primary"
          >
            {cell}
          </Card>
        ))}
      </div>
      
      <Button onClick={resetGame} size="lg">
        Chơi lại
      </Button>
    </div>
  );
};
