import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeDeciduous, Flower2, Sun, Cloud, Bird, Droplet, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fireConfetti } from '@/components/ConfettiEffect';

interface MiniEcoBuilderProps {
  onComplete?: (score: number) => void;
  onBack?: () => void;
}

interface PlacedItem {
  id: string;
  type: string;
  x: number;
  y: number;
  emoji: string;
  scale: number;
}

const ITEMS = [
  { type: 'tree', emoji: '🌳', icon: TreeDeciduous, color: 'text-green-600', points: 10 },
  { type: 'flower', emoji: '🌸', icon: Flower2, color: 'text-pink-500', points: 5 },
  { type: 'bird', emoji: '🦋', icon: Bird, color: 'text-blue-500', points: 15 },
  { type: 'sun', emoji: '☀️', icon: Sun, color: 'text-yellow-500', points: 20 },
  { type: 'cloud', emoji: '☁️', icon: Cloud, color: 'text-gray-400', points: 8 },
  { type: 'water', emoji: '💧', icon: Droplet, color: 'text-cyan-500', points: 12 },
];

export function MiniEcoBuilder({ onComplete, onBack }: MiniEcoBuilderProps) {
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [selectedTool, setSelectedTool] = useState(ITEMS[0]);
  const [score, setScore] = useState(0);
  const [ecoLevel, setEcoLevel] = useState(1);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const newItem: PlacedItem = {
      id: Date.now().toString(),
      type: selectedTool.type,
      x,
      y,
      emoji: selectedTool.emoji,
      scale: 0.8 + Math.random() * 0.4,
    };

    setPlacedItems([...placedItems, newItem]);
    
    const newScore = score + selectedTool.points;
    setScore(newScore);

    // Level up
    const newLevel = Math.floor(newScore / 100) + 1;
    if (newLevel > ecoLevel) {
      setEcoLevel(newLevel);
      fireConfetti('celebration');
      onComplete?.(newScore);
    }
  };

  const clearWorld = () => {
    setPlacedItems([]);
    setScore(0);
    setEcoLevel(1);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            Eco Builder
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
        <Card className="p-3 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <div className="flex items-center gap-1 justify-center">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-lg">{score}</span>
          </div>
          <div className="text-xs text-muted-foreground">Eco Points</div>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <div className="font-bold text-lg">Level {ecoLevel}</div>
          <div className="text-xs text-muted-foreground">
            {100 - (score % 100)} to next
          </div>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-br from-pink-500/10 to-purple-500/10">
          <div className="font-bold text-lg">{placedItems.length}</div>
          <div className="text-xs text-muted-foreground">Items</div>
        </Card>
      </div>

      {/* Tool Palette */}
      <div className="flex flex-wrap justify-center gap-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.type}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedTool(item)}
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedTool.type === item.type
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Canvas */}
      <div
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-crosshair touch-none"
        style={{
          background: `linear-gradient(180deg, 
            #87CEEB 0%, 
            #87CEEB 40%, 
            #90EE90 40%, 
            #228B22 100%
          )`,
        }}
      >
        {/* Sun */}
        <div className="absolute top-4 right-8 text-5xl animate-pulse">☀️</div>
        
        {/* Clouds */}
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          className="absolute top-8 left-4 text-4xl opacity-80"
        >
          ☁️
        </motion.div>

        {/* Placed Items */}
        <AnimatePresence>
          {placedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: item.scale, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="absolute"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${2 + item.scale}rem`,
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Grass */}
        <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end justify-around overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 + Math.random(), delay: Math.random() }}
              className="text-green-600 text-lg"
            >
              🌿
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={clearWorld} className="gap-2">
          🔄 Start Over
        </Button>
        <Button 
          className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
          onClick={() => fireConfetti('celebration')}
        >
          ✨ Celebrate!
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Tap to place items and build your eco-friendly world! 🌍
      </p>
    </div>
  );
}
