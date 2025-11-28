import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, Heart, Home, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useVoiceReactions } from "@/hooks/useVoiceReactions";
import confetti from 'canvas-confetti';

interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: string;
  unlocked: boolean;
}

interface Tool {
  id: string;
  name: string;
  emoji: string;
  action: string;
  unlocked: boolean;
}

interface Character {
  id: string;
  name: string;
  emoji: string;
  favorite: string;
  reaction: string;
  unlocked: boolean;
}

interface PlateItem {
  id: string;
  ingredient: string;
  emoji: string;
  transformed: string;
  x: number;
  y: number;
}

interface SavedDish {
  id: string;
  items: PlateItem[];
  character: string;
  stars: number;
  timestamp: number;
}

const INGREDIENTS: Ingredient[] = [
  // Veggies
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'veggies', unlocked: true },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'veggies', unlocked: true },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'veggies', unlocked: true },
  { id: 'onion', name: 'Onion', emoji: '🧅', category: 'veggies', unlocked: false },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', category: 'veggies', unlocked: false },
  { id: 'pepper', name: 'Pepper', emoji: '🫑', category: 'veggies', unlocked: false },
  // Fruits
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'fruits', unlocked: true },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'fruits', unlocked: true },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', category: 'fruits', unlocked: true },
  { id: 'orange', name: 'Orange', emoji: '🍊', category: 'fruits', unlocked: false },
  { id: 'pineapple', name: 'Pineapple', emoji: '🍍', category: 'fruits', unlocked: false },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', category: 'fruits', unlocked: false },
  // Proteins
  { id: 'fish', name: 'Fish', emoji: '🐟', category: 'proteins', unlocked: true },
  { id: 'steak', name: 'Steak', emoji: '🥩', category: 'proteins', unlocked: true },
  { id: 'egg', name: 'Egg', emoji: '🥚', category: 'proteins', unlocked: false },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', category: 'proteins', unlocked: false },
  // Carbs
  { id: 'bread', name: 'Bread', emoji: '🍞', category: 'carbs', unlocked: true },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', category: 'carbs', unlocked: false },
  { id: 'rice', name: 'Rice', emoji: '🍚', category: 'carbs', unlocked: false },
  // Sweets
  { id: 'cake', name: 'Cake', emoji: '🍰', category: 'sweets', unlocked: false },
  { id: 'icecream', name: 'Ice Cream', emoji: '🍦', category: 'sweets', unlocked: false },
  { id: 'chocolate', name: 'Chocolate', emoji: '🍫', category: 'sweets', unlocked: false },
  { id: 'cookie', name: 'Cookie', emoji: '🍪', category: 'sweets', unlocked: false },
];

const TOOLS: Tool[] = [
  { id: 'chop', name: 'Chop', emoji: '🔪', action: 'chopped', unlocked: true },
  { id: 'boil', name: 'Boil', emoji: '🍲', action: 'boiled', unlocked: true },
  { id: 'fry', name: 'Fry', emoji: '🍳', action: 'fried', unlocked: true },
  { id: 'bake', name: 'Bake', emoji: '🔥', action: 'baked', unlocked: false },
  { id: 'blend', name: 'Blend', emoji: '🥤', action: 'blended', unlocked: false },
  { id: 'grill', name: 'Grill', emoji: '🍖', action: 'grilled', unlocked: false },
];

const CHARACTERS: Character[] = [
  { id: 'bunny', name: 'Happy Bunny', emoji: '🐰', favorite: 'veggies', reaction: 'Carrot dance!', unlocked: true },
  { id: 'fox', name: 'Cheerful Fox', emoji: '🦊', favorite: 'fruits', reaction: 'Rainbow burp!', unlocked: true },
  { id: 'bear', name: 'Giggling Bear', emoji: '🐻', favorite: 'sweets', reaction: 'Belly roll!', unlocked: true },
  { id: 'penguin', name: 'Playful Penguin', emoji: '🐧', favorite: 'proteins', reaction: 'Ice skate!', unlocked: false },
  { id: 'dog', name: 'Dancing Dog', emoji: '🐕', favorite: 'proteins', reaction: 'Tail spin!', unlocked: false },
  { id: 'cat', name: 'Smiley Cat', emoji: '🐱', favorite: 'carbs', reaction: 'Purr-paw!', unlocked: false },
];

const CATEGORIES = [
  { id: 'veggies', name: 'Veggies', emoji: '🥕', color: 'bg-green-500' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎', color: 'bg-red-500' },
  { id: 'proteins', name: 'Proteins', emoji: '🥩', color: 'bg-orange-500' },
  { id: 'carbs', name: 'Carbs', emoji: '🍞', color: 'bg-yellow-500' },
  { id: 'sweets', name: 'Sweets', emoji: '🍰', color: 'bg-pink-500' },
];

export const HappyKitchenJoy = ({ onBack }: { onBack?: () => void }) => {
  const { playClick, playSuccess, playPop, playJump, playScore, startBackgroundMusic, stopBackgroundMusic, isMusicEnabled, isSoundEnabled, toggleMusic, toggleSound } = useGameAudio();
  const { speakReaction, stop: stopVoice, toggle: toggleVoice, isEnabled: isVoiceEnabled, isSpeaking: isCharacterSpeaking } = useVoiceReactions();
  const [joyStars, setJoyStars] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('veggies');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [plateItems, setPlateItems] = useState<PlateItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<Ingredient | null>(null);
  const [ingredients, setIngredients] = useState(INGREDIENTS);
  const [tools, setTools] = useState(TOOLS);
  const [characters, setCharacters] = useState(CHARACTERS);
  const [showReaction, setShowReaction] = useState(false);
  const [gallery, setGallery] = useState<SavedDish[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const plateRef = useRef<HTMLDivElement>(null);

  // Start background music on mount
  useEffect(() => {
    startBackgroundMusic();
    return () => {
      stopBackgroundMusic();
      stopVoice();
    };
  }, []);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('happyKitchenJoy');
    if (saved) {
      const data = JSON.parse(saved);
      setJoyStars(data.joyStars || 0);
      setIngredients(data.ingredients || INGREDIENTS);
      setTools(data.tools || TOOLS);
      setCharacters(data.characters || CHARACTERS);
      setGallery(data.gallery || []);
      setShowTutorial(false);
    }
  }, []);

  // Save progress
  const saveProgress = () => {
    localStorage.setItem('happyKitchenJoy', JSON.stringify({
      joyStars,
      ingredients,
      tools,
      characters,
      gallery,
    }));
  };

  useEffect(() => {
    saveProgress();
  }, [joyStars, ingredients, tools, characters, gallery]);

  // Check for unlocks
  useEffect(() => {
    if (joyStars >= 100 && ingredients.filter(i => !i.unlocked).length > 0) {
      const nextIngredient = ingredients.find(i => !i.unlocked);
      if (nextIngredient) {
        setIngredients(prev => prev.map(i => 
          i.id === nextIngredient.id ? { ...i, unlocked: true } : i
        ));
        setJoyStars(prev => prev - 100);
        confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
        toast.success(`🎉 Unlocked ${nextIngredient.name}!`);
        playSuccess();
      }
    }
  }, [joyStars]);

  const handleDragStart = (ingredient: Ingredient) => {
    setDraggedItem(ingredient);
    playClick(); // Pickup sound
  };

  const playToolSound = (toolId: string) => {
    // Different sounds for different tools
    switch (toolId) {
      case 'chop':
        playPop(); // Sharp chop sound
        break;
      case 'boil':
        playJump(); // Bubbling sound
        break;
      case 'fry':
        playScore(); // Sizzle sound
        break;
      case 'bake':
        playClick(); // Oven ding
        break;
      case 'blend':
        playJump(); // Whirring sound
        break;
      case 'grill':
        playScore(); // Grilling sound
        break;
      default:
        playPop();
    }
  };

  const handleToolDrop = (tool: Tool) => {
    if (draggedItem) {
      const newItem: PlateItem = {
        id: `${draggedItem.id}-${Date.now()}`,
        ingredient: draggedItem.name,
        emoji: draggedItem.emoji,
        transformed: tool.action,
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      setPlateItems(prev => [...prev, newItem]);
      setDraggedItem(null);
      playToolSound(tool.id); // Play specific tool sound
      
      // Particle effect
      confetti({
        particleCount: 30,
        angle: 90,
        spread: 45,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFD700', '#FF69B4', '#87CEEB'],
        startVelocity: 20,
      });
    }
  };

  const serveDish = () => {
    if (plateItems.length === 0) {
      toast.info('Add some ingredients first!');
      playClick();
      return;
    }

    // Happy eating sound
    playSuccess();
    
    // Additional celebration sounds
    setTimeout(() => playJump(), 200);
    setTimeout(() => playScore(), 400);
    setTimeout(() => playPop(), 600);
    
    setShowReaction(true);

    // Play character voice reaction after 500ms delay
    setTimeout(() => {
      speakReaction(selectedCharacter.id, selectedCharacter.favorite);
    }, 500);

    // Calculate stars based on creativity
    const baseStars = 10;
    const creativityBonus = Math.min(plateItems.length * 5, 40);
    const favoriteBonus = plateItems.some(item => 
      ingredients.find(i => i.name === item.ingredient)?.category === selectedCharacter.favorite
    ) ? 20 : 0;
    const totalStars = baseStars + creativityBonus + favoriteBonus;

    setJoyStars(prev => prev + totalStars);

    // Mega confetti explosion
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors: ['#FF69B4', '#FFD700', '#87CEEB', '#FF6B9D', '#C3F0CA'],
    });

    // Save to gallery
    const newDish: SavedDish = {
      id: `dish-${Date.now()}`,
      items: plateItems,
      character: selectedCharacter.name,
      stars: totalStars,
      timestamp: Date.now(),
    };
    setGallery(prev => [newDish, ...prev].slice(0, 20));

    setTimeout(() => {
      setShowReaction(false);
      setPlateItems([]);
      toast.success(`+${totalStars} Joy Stars! 🌟`);
    }, 3000);
  };

  const resetKitchen = () => {
    setPlateItems([]);
    playClick(); // Clean sweep sound
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#87CEEB', '#FFD700'],
    });
    toast.success('Kitchen sparkle clean! ✨');
  };

  const unlockedIngredients = ingredients.filter(i => i.unlocked && i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-4">
      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTutorial(false)}
          >
            <Card className="max-w-md p-8 text-center space-y-4">
              <div className="text-6xl">👋</div>
              <h2 className="text-3xl font-bold text-primary">Welcome to Happy Kitchen Joy!</h2>
              <p className="text-lg">🥕 Drag ingredients to tools</p>
              <p className="text-lg">🍳 Transform them with cooking!</p>
              <p className="text-lg">🍽️ Serve to happy animals!</p>
              <p className="text-lg">⭐ Collect Joy Stars to unlock more!</p>
              <Button onClick={() => setShowTutorial(false)} size="lg" className="mt-4">
                Start Cooking! 🎉
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={() => setShowGallery(false)}
          >
            <Card className="max-w-4xl w-full max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-3xl font-bold mb-6 text-center">🎨 Your Creations</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map(dish => (
                  <Card key={dish.id} className="p-4 space-y-2">
                    <div className="text-4xl text-center">{dish.character}</div>
                    <div className="flex flex-wrap gap-1 justify-center min-h-[60px]">
                      {dish.items.slice(0, 8).map(item => (
                        <span key={item.id} className="text-3xl">{item.emoji}</span>
                      ))}
                    </div>
                    <Badge className="w-full justify-center">
                      <Star className="w-3 h-3 mr-1" />
                      {dish.stars} Stars
                    </Badge>
                  </Card>
                ))}
              </div>
              {gallery.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  No dishes yet! Start cooking to fill your gallery! 🍳
                </p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <Home className="w-5 h-5" />
            Home
          </Button>
          
          {/* Audio Controls */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMusic}
            title={isMusicEnabled ? "Mute Music" : "Play Music"}
          >
            <span className="text-xl">{isMusicEnabled ? "🎵" : "🔇"}</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            title={isSoundEnabled ? "Mute Sounds" : "Play Sounds"}
          >
            <span className="text-xl">{isSoundEnabled ? "🔊" : "🔈"}</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVoice}
            title={isVoiceEnabled ? "Mute Voices" : "Play Voices"}
          >
            <span className="text-xl">{isVoiceEnabled ? "🗣️" : "🤐"}</span>
          </Button>
        </div>
        
        <Badge variant="secondary" className="text-xl px-6 py-3 gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          {joyStars} Joy Stars
        </Badge>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGallery(true)} className="gap-2">
            <ImageIcon className="w-5 h-5" />
            Gallery
          </Button>
          <Button variant="outline" onClick={resetKitchen} className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 text-primary">
          Happy Kitchen Joy! 🎉
        </h1>

        {/* Character Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Friend!</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            {characters.filter(c => c.unlocked).map(char => (
              <Button
                key={char.id}
                variant={selectedCharacter.id === char.id ? "default" : "outline"}
                size="lg"
                onClick={() => {
                  setSelectedCharacter(char);
                  playClick(); // Character selection sound
                  toast.success(`${char.name} is ready to eat! 🎉`);
                }}
                className="text-4xl h-auto py-4 px-6 flex flex-col gap-2"
              >
                <span>{char.emoji}</span>
                <span className="text-sm">{char.name}</span>
              </Button>
            ))}
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Fridge - Ingredients */}
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🧊 Fridge
            </h2>
            
            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    playClick(); // Category switch sound
                  }}
                  className="gap-1"
                >
                  <span>{cat.emoji}</span>
                  <span className="text-xs">{cat.name}</span>
                </Button>
              ))}
            </div>

            {/* Ingredients Grid */}
            <div className="grid grid-cols-3 gap-3">
              {unlockedIngredients.map(ingredient => (
                <motion.div
                  key={ingredient.id}
                  draggable
                  onDragStart={() => handleDragStart(ingredient)}
                  onClick={() => playClick()} // Click feedback
                  className="bg-card border-2 border-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary transition-all hover:scale-110"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-5xl text-center">{ingredient.emoji}</div>
                  <p className="text-xs text-center mt-2 font-medium">{ingredient.name}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Center - Kitchen Tools & Plate */}
          <div className="space-y-6">
            {/* Tools */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">🔧 Tools</h2>
              <div className="grid grid-cols-3 gap-3">
                {tools.filter(t => t.unlocked).map(tool => (
                  <motion.div
                  key={tool.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleToolDrop(tool)}
                  onClick={() => playClick()} // Tool hover sound
                  className="bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl p-4 cursor-pointer hover:scale-110 transition-all border-4 border-orange-500"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-5xl text-center">{tool.emoji}</div>
                    <p className="text-xs text-center mt-2 font-bold text-white">{tool.name}</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Plate */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">🍽️ Your Dish</h2>
              <div
                ref={plateRef}
                className="relative bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full aspect-square border-8 border-yellow-300 overflow-hidden"
                style={{ minHeight: '250px' }}
              >
                <AnimatePresence>
                  {plateItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0, opacity: 0, y: -50 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute text-4xl"
                      style={{ 
                        left: `calc(${item.x}% - 20px)`, 
                        top: `calc(${item.y}% - 20px)`,
                        transform: `rotate(${index * 15}deg)`,
                      }}
                    >
                      {item.emoji}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {plateItems.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Drag ingredients here!
                  </div>
                )}
              </div>
              <Button 
                onClick={serveDish}
                size="lg" 
                className="w-full mt-4 text-xl"
                disabled={plateItems.length === 0}
              >
                Serve to {selectedCharacter.name}! 🎉
              </Button>
            </Card>
          </div>

          {/* Character Reaction Area */}
          <Card className="p-6 flex flex-col items-center justify-center">
            <motion.div
              animate={showReaction ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{ duration: 0.5, repeat: showReaction ? Infinity : 0 }}
              className="text-9xl mb-6"
            >
              {selectedCharacter.emoji}
            </motion.div>
            
            <h3 className="text-2xl font-bold mb-2">{selectedCharacter.name}</h3>
            <p className="text-muted-foreground mb-4">Loves {selectedCharacter.favorite}!</p>

            <AnimatePresence>
              {showReaction && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="space-y-4 text-center"
                >
                  <div className="text-6xl">
                    💖✨🌟💫⭐
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    SUPER YUMMY!
                  </p>
                  <p className="text-2xl text-pink-500">
                    {selectedCharacter.reaction}
                  </p>
                  {isCharacterSpeaking && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-4xl"
                    >
                      🗣️
                    </motion.div>
                  )}
                  <div className="flex gap-2 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showReaction && (
              <div className="text-center text-muted-foreground mt-4">
                <p className="text-lg">Waiting for food...</p>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl mt-2"
                >
                  😋
                </motion.div>
              </div>
            )}
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">Next Unlock Progress:</span>
            <span className="text-sm text-muted-foreground">{joyStars}/100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(joyStars, 100)}%` }}
              className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 h-full rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
