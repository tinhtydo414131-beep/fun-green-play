import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Game2048 = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addNewTile(newBoard);
    addNewTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  };

  const addNewTile = (currentBoard: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
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
      
      while (merged.length < 4) {
        merged.push(0);
      }
      
      return merged;
    };

    if (direction === 'left') {
      newBoard = newBoard.map(row => slide(row));
    } else if (direction === 'right') {
      newBoard = newBoard.map(row => slide(row.reverse()).reverse());
    } else if (direction === 'up') {
      for (let col = 0; col < 4; col++) {
        const column = newBoard.map(row => row[col]);
        const slided = slide(column);
        for (let row = 0; row < 4; row++) {
          newBoard[row][col] = slided[row];
        }
      }
    } else if (direction === 'down') {
      for (let col = 0; col < 4; col++) {
        const column = newBoard.map(row => row[col]).reverse();
        const slided = slide(column).reverse();
        for (let row = 0; row < 4; row++) {
          newBoard[row][col] = slided[row];
        }
      }
    }

    moved = JSON.stringify(board) !== JSON.stringify(newBoard);

    if (moved) {
      addNewTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      
      if (newBoard.flat().includes(2048)) {
        toast.success("Bạn đã thắng! Đạt 2048!");
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

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      0: 'bg-muted/50',
      2: 'bg-primary/20',
      4: 'bg-primary/30',
      8: 'bg-primary/40',
      16: 'bg-primary/50',
      32: 'bg-primary/60',
      64: 'bg-primary/70',
      128: 'bg-primary/80',
      256: 'bg-primary/90',
      512: 'bg-primary',
      1024: 'bg-primary',
      2048: 'bg-primary',
    };
    return colors[value] || 'bg-primary';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Điểm: {score}
        </h2>
        <p className="text-muted-foreground">
          Dùng phím mũi tên để chơi
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <Card
              key={`${i}-${j}`}
              className={`w-20 h-20 flex items-center justify-center text-2xl font-bold ${getTileColor(cell)} border-2 border-border`}
            >
              {cell !== 0 && cell}
            </Card>
          ))
        )}
      </div>

      <div className="flex gap-4">
        <Button onClick={initializeGame} size="lg">
          Chơi lại
        </Button>
      </div>
    </div>
  );
};
