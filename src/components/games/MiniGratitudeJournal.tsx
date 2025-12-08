import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, BookOpen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { fireConfetti } from '@/components/ConfettiEffect';

interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
  emoji: string;
}

interface MiniGratitudeJournalProps {
  onComplete?: (score: number) => void;
  onBack?: () => void;
}

const EMOJIS = ['🌟', '💖', '🌈', '🦋', '🌸', '☀️', '🎈', '🍀'];

export function MiniGratitudeJournal({ onComplete, onBack }: MiniGratitudeJournalProps) {
  const [entries, setEntries] = useState<GratitudeEntry[]>(() => {
    const saved = localStorage.getItem('gratitude-entries');
    return saved ? JSON.parse(saved) : [];
  });
  const [newEntry, setNewEntry] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌟');
  const [showPrompt, setShowPrompt] = useState(true);

  const prompts = [
    "What made you smile today? 😊",
    "Who are you grateful for? 💕",
    "What's something beautiful you saw? 🌸",
    "What's a happy memory from today? ✨",
    "What are you proud of? 🏆",
  ];

  const [currentPrompt] = useState(() => 
    prompts[Math.floor(Math.random() * prompts.length)]
  );

  useEffect(() => {
    localStorage.setItem('gratitude-entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!newEntry.trim()) return;

    const entry: GratitudeEntry = {
      id: Date.now().toString(),
      text: newEntry.trim(),
      date: new Date().toLocaleDateString(),
      emoji: selectedEmoji,
    };

    setEntries([entry, ...entries]);
    setNewEntry('');
    setShowPrompt(false);
    
    // Celebration!
    fireConfetti('reward');
    
    // Award points
    if (entries.length === 0) {
      onComplete?.(100); // First entry bonus
    } else {
      onComplete?.(50);
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            Gratitude Journal
          </h2>
        </div>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 justify-center">
        <Card className="p-3 text-center bg-gradient-to-br from-pink-500/10 to-purple-500/10">
          <div className="text-2xl font-bold text-primary">{entries.length}</div>
          <div className="text-xs text-muted-foreground">Entries</div>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
          <div className="text-2xl font-bold text-secondary">
            {new Set(entries.map(e => e.date)).size}
          </div>
          <div className="text-xs text-muted-foreground">Days</div>
        </Card>
      </div>

      {/* Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl"
          >
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-lg font-medium">{currentPrompt}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Entry */}
      <Card className="p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedEmoji(emoji)}
              className={`text-2xl p-1 rounded-lg ${
                selectedEmoji === emoji ? 'bg-primary/20 ring-2 ring-primary' : ''
              }`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
        
        <Textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="I'm grateful for..."
          className="min-h-[100px] resize-none"
          maxLength={500}
        />
        
        <Button 
          onClick={addEntry} 
          disabled={!newEntry.trim()}
          className="w-full gap-2 bg-gradient-to-r from-primary to-pink-500"
        >
          <Plus className="w-4 h-4" />
          Add to Journal
        </Button>
      </Card>

      {/* Entries List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <Card className="p-4 relative group">
                <div className="flex gap-3">
                  <span className="text-2xl">{entry.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{entry.date}</p>
                    <p className="text-foreground">{entry.text}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 text-pink-300" />
            <p>Start your gratitude journey today!</p>
            <p className="text-sm">Write what you're thankful for ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}
