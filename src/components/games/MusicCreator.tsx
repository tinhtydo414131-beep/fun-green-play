import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MusicCreatorProps {
  level: number;
  onLevelComplete: () => void;
}

type Note = '🎵' | '🎶' | '🎸' | '🎹' | '🥁' | '🎺' | '🎻';

interface MusicNote {
  id: number;
  note: Note;
  played: boolean;
}

const notes: Note[] = ['🎵', '🎶', '🎸', '🎹', '🥁', '🎺', '🎻'];

const MusicCreator = ({ level, onLevelComplete }: MusicCreatorProps) => {
  const [sequence, setSequence] = useState<MusicNote[]>([]);
  const [playedCount, setPlayedCount] = useState(0);
  const targetNotes = level * 5;

  useEffect(() => {
    // Generate random music sequence
    const newSequence: MusicNote[] = [];
    for (let i = 0; i < targetNotes; i++) {
      newSequence.push({
        id: i,
        note: notes[Math.floor(Math.random() * notes.length)],
        played: false,
      });
    }
    setSequence(newSequence);
  }, [level, targetNotes]);

  useEffect(() => {
    if (playedCount >= targetNotes && targetNotes > 0) {
      setTimeout(() => onLevelComplete(), 500);
    }
  }, [playedCount, targetNotes, onLevelComplete]);

  const playNote = (id: number) => {
    setSequence(prev =>
      prev.map(note => note.id === id ? { ...note, played: true } : note)
    );
    setPlayedCount(prev => prev + 1);
  };

  const resetGame = () => {
    const newSequence: MusicNote[] = [];
    for (let i = 0; i < targetNotes; i++) {
      newSequence.push({
        id: i,
        note: notes[Math.floor(Math.random() * notes.length)],
        played: false,
      });
    }
    setSequence(newSequence);
    setPlayedCount(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="w-full max-w-4xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-fredoka font-bold text-primary">Music Creator 🎵</h2>
          <p className="text-lg font-comic text-muted-foreground">
            Màn {level} - Chơi {targetNotes} nốt nhạc!
          </p>
          <div className="text-2xl font-fredoka font-bold text-primary">
            Đã chơi: {playedCount}/{targetNotes} 🎶
          </div>
        </div>

        <div className="relative w-full h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl border-4 border-primary/30 overflow-hidden p-4">
          <div className="grid grid-cols-5 gap-3 h-full">
            {sequence.map((item) => (
              <Button
                key={item.id}
                onClick={() => !item.played && playNote(item.id)}
                disabled={item.played}
                variant={item.played ? 'outline' : 'default'}
                className={`text-4xl h-full transition-all ${
                  item.played ? 'opacity-50 scale-95' : 'animate-pulse hover:scale-110'
                }`}
              >
                {item.note}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={resetGame}
            variant="outline"
            className="font-fredoka font-bold px-8 py-6 text-lg"
          >
            🔄 Làm mới
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MusicCreator;
