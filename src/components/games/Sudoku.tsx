import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Lightbulb } from "lucide-react";

const easyPuzzles = [
  {
    puzzle: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  }
];

export const Sudoku = ({
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
  const puzzleData = easyPuzzles[0];
  const [board, setBoard] = useState<number[][]>(puzzleData.puzzle.map(row => [...row]));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [hints, setHints] = useState(3);

  const isOriginal = (row: number, col: number) => puzzleData.puzzle[row][col] !== 0;

  const checkCell = (row: number, col: number, value: number): boolean => {
    if (value === 0) return true;
    
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c] === value) return false;
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === value) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r !== row && c !== col && board[r][c] === value) return false;
      }
    }
    
    return true;
  };

  const handleNumberInput = (num: number) => {
    if (!selected || isOriginal(selected.row, selected.col)) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[selected.row][selected.col] = num;
    setBoard(newBoard);

    const key = `${selected.row}-${selected.col}`;
    if (num !== 0 && !checkCell(selected.row, selected.col, num)) {
      setErrors(prev => new Set(prev).add(key));
      toast.error("Số này không đúng vị trí!");
    } else {
      setErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(key);
        return newErrors;
      });
    }

    // Check if completed
    if (num !== 0) {
      const isComplete = newBoard.every((row, r) => 
        row.every((cell, c) => cell === puzzleData.solution[r][c])
      );
      if (isComplete) {
        toast.success("Hoàn thành! Tuyệt vời! 🎉");
        if (onLevelComplete) {
          setTimeout(() => onLevelComplete(), 1000);
        }
      }
    }
  };

  const useHint = () => {
    if (!selected || hints <= 0 || isOriginal(selected.row, selected.col)) return;
    
    const correctValue = puzzleData.solution[selected.row][selected.col];
    const newBoard = board.map(row => [...row]);
    newBoard[selected.row][selected.col] = correctValue;
    setBoard(newBoard);
    setHints(hints - 1);
    
    const key = `${selected.row}-${selected.col}`;
    setErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(key);
      return newErrors;
    });
    
    toast.success(`Gợi ý: ${correctValue}! 💡`);
  };

  const resetGame = () => {
    setBoard(puzzleData.puzzle.map(row => [...row]));
    setSelected(null);
    setErrors(new Set());
    setHints(3);
  };

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Sudoku</h2>
        <p className="text-sm text-muted-foreground">💡 Gợi ý: {hints}</p>
      </div>

      <Card className="p-1 md:p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="grid grid-cols-9 gap-[1px] bg-gray-400 dark:bg-gray-600 border-2 border-gray-600 dark:border-gray-400">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
              const isError = errors.has(`${rowIndex}-${colIndex}`);
              const isOriginalCell = isOriginal(rowIndex, colIndex);
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => setSelected({ row: rowIndex, col: colIndex })}
                  onTouchStart={(e) => { e.preventDefault(); setSelected({ row: rowIndex, col: colIndex }); }}
                  className={`
                    w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-base md:text-lg font-bold
                    touch-manipulation will-change-transform active:scale-95 transition-transform
                    ${isSelected ? "bg-blue-200 dark:bg-blue-700" : "bg-white dark:bg-gray-800"}
                    ${isError ? "bg-red-200 dark:bg-red-800 text-red-600" : ""}
                    ${isOriginalCell ? "text-gray-700 dark:text-gray-300" : "text-blue-600 dark:text-blue-400"}
                    ${colIndex % 3 === 2 && colIndex !== 8 ? "border-r-2 border-gray-600" : ""}
                    ${rowIndex % 3 === 2 && rowIndex !== 8 ? "border-b-2 border-gray-600" : ""}
                    hover:bg-blue-100 dark:hover:bg-blue-900
                  `}
                >
                  {cell !== 0 ? cell : ""}
                </button>
              );
            })
          )}
        </div>
      </Card>

      {/* Number pad - larger touch targets */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
          <Button
            key={num}
            onClick={() => handleNumberInput(num)}
            onTouchStart={(e) => { e.preventDefault(); handleNumberInput(num); }}
            variant="outline"
            className="w-14 h-14 md:w-12 md:h-12 text-xl font-bold touch-manipulation will-change-transform active:scale-95 transition-transform"
          >
            {num === 0 ? "❌" : num}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {onBack && (
          <Button onClick={onBack} size="lg" variant="outline" className="touch-manipulation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button onClick={useHint} size="lg" variant="outline" disabled={hints <= 0 || !selected} className="touch-manipulation">
          <Lightbulb className="mr-2 h-4 w-4" />
          Gợi ý ({hints})
        </Button>
        <Button onClick={resetGame} size="lg" className="touch-manipulation">
          <RotateCcw className="mr-2 h-4 w-4" />
          Lại
        </Button>
      </div>
    </div>
  );
};
