import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Sudoku = () => {
  const initialBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === 0) {
      setSelected([row, col]);
    }
  };

  const handleNumberClick = (num: number) => {
    if (!selected) return;
    const [row, col] = selected;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    if (checkWin(newBoard)) {
      toast.success('Chúc mừng! Bạn đã hoàn thành Sudoku!');
    }
  };

  const checkWin = (board: number[][]) => {
    return board.every(row => row.every(cell => cell !== 0));
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setSelected(null);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Sudoku</h2>
        <p className="text-muted-foreground">Điền số từ 1-9</p>
      </div>

      <div className="grid grid-cols-9 gap-1 p-4 bg-muted/30 rounded-lg">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <Card
              key={`${i}-${j}`}
              onClick={() => handleCellClick(i, j)}
              className={`w-10 h-10 flex items-center justify-center cursor-pointer font-bold ${
                selected?.[0] === i && selected?.[1] === j ? 'bg-primary text-primary-foreground' : 
                initialBoard[i][j] !== 0 ? 'bg-muted' : 'bg-background hover:bg-primary/20'
              } ${(i + 1) % 3 === 0 && i !== 8 ? 'mb-2' : ''} ${(j + 1) % 3 === 0 && j !== 8 ? 'mr-2' : ''}`}
            >
              {cell !== 0 ? cell : ''}
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-9 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button
            key={num}
            onClick={() => handleNumberClick(num)}
            variant="outline"
            size="sm"
          >
            {num}
          </Button>
        ))}
      </div>

      <Button onClick={resetGame} size="lg">Chơi lại</Button>
    </div>
  );
};
