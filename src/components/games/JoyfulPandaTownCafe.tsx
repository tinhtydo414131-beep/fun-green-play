import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Home, Sparkles, Users, Cookie, Volume2, VolumeX } from 'lucide-react';
import { toast } from "sonner";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useVoiceReactions } from "@/hooks/useVoiceReactions";
import confetti from 'canvas-confetti';

interface Character {
  id: string;
  name: string;
  emoji: string;
  favorite: string;
  greeting: string;
  unlocked: boolean;
}

interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: string;
  unlocked: boolean;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  emoji: string;
  unlocked: boolean;
}

interface Helper {
  id: string;
  name: string;
  emoji: string;
  skill: string;
  unlocked: boolean;
}

interface Order {
  items: string[];
  customer: Character;
}

interface PlateItem {
  id: string;
  ingredient: string;
  emoji: string;
  transformed: string;
}

const CHARACTERS: Character[] = [
  { id: 'panda', name: 'Dr. Panda', emoji: '🐼', favorite: 'all', greeting: 'Welcome friend!', unlocked: true },
  { id: 'bunny', name: 'Bouncy Bunny', emoji: '🐰', favorite: 'veggies', greeting: 'Hop hop hello!', unlocked: true },
  { id: 'fox', name: 'Smiley Fox', emoji: '🦊', favorite: 'fruits', greeting: 'Hey there buddy!', unlocked: true },
  { id: 'bear', name: 'Giggling Bear', emoji: '🐻', favorite: 'sweets', greeting: 'Big bear hugs!', unlocked: true },
  { id: 'penguin', name: 'Playful Penguin', emoji: '🐧', favorite: 'proteins', greeting: 'Slide on in!', unlocked: false },
  { id: 'dog', name: 'Dancing Dog', emoji: '🐕', favorite: 'proteins', greeting: 'Woof woof!', unlocked: false },
  { id: 'cat', name: 'Curious Cat', emoji: '🐱', favorite: 'all', greeting: 'Purr-fect day!', unlocked: false },
  { id: 'mouse', name: 'Tiny Mouse', emoji: '🐭', favorite: 'carbs', greeting: 'Squeak squeak!', unlocked: false },
];

const INGREDIENTS: Ingredient[] = [
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'veggies', unlocked: true },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', category: 'veggies', unlocked: true },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'veggies', unlocked: true },
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'fruits', unlocked: true },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'fruits', unlocked: true },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', category: 'fruits', unlocked: true },
  { id: 'fish', name: 'Fish', emoji: '🐟', category: 'proteins', unlocked: true },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', category: 'proteins', unlocked: true },
  { id: 'bread', name: 'Bread', emoji: '🍞', category: 'carbs', unlocked: true },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', category: 'carbs', unlocked: true },
  { id: 'cake', name: 'Cake', emoji: '🍰', category: 'sweets', unlocked: false },
  { id: 'cookie', name: 'Cookie', emoji: '🍪', category: 'sweets', unlocked: false },
];

const HELPERS: Helper[] = [
  { id: 'panda_helper', name: 'Chef Panda', emoji: '👨‍🍳', skill: 'cooking', unlocked: true },
  { id: 'bunny_helper', name: 'Helper Bunny', emoji: '🐰', skill: 'chopping', unlocked: true },
  { id: 'fox_helper', name: 'Helper Fox', emoji: '🦊', skill: 'serving', unlocked: false },
];

const RECIPES: Recipe[] = [
  { id: 'salad', name: 'Fresh Salad', ingredients: ['tomato', 'lettuce', 'carrot'], emoji: '🥗', unlocked: true },
  { id: 'fruit_bowl', name: 'Fruit Bowl', ingredients: ['apple', 'banana', 'strawberry'], emoji: '🍇', unlocked: true },
  { id: 'sandwich', name: 'Yummy Sandwich', ingredients: ['bread', 'cheese', 'tomato'], emoji: '🥪', unlocked: false },
  { id: 'pasta_dish', name: 'Pasta Special', ingredients: ['pasta', 'tomato', 'cheese'], emoji: '🍝', unlocked: false },
];

type GamePhase = 'welcome' | 'customer_arriving' | 'greeting' | 'ordering' | 'preparing' | 'serving' | 'reacting' | 'thanking';

export const JoyfulPandaTownCafe = ({ onBack }: { onBack?: () => void }) => {
  const { playClick, playSuccess, playPop, playJump, playScore, startBackgroundMusic, stopBackgroundMusic, isMusicEnabled, toggleMusic } = useGameAudio();
  const { speakReaction, stop: stopVoice, toggle: toggleVoice, isEnabled: isVoiceEnabled } = useVoiceReactions();
  
  const [happinessHearts, setHappinessHearts] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('welcome');
  const [currentCustomer, setCurrentCustomer] = useState<Character | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [plateItems, setPlateItems] = useState<PlateItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<Ingredient | null>(null);
  const [characters, setCharacters] = useState(CHARACTERS);
  const [ingredients, setIngredients] = useState(INGREDIENTS);
  const [helpers, setHelpers] = useState(HELPERS);
  const [recipes, setRecipes] = useState(RECIPES);
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [showHighFive, setShowHighFive] = useState(false);
  const [highFiveScore, setHighFiveScore] = useState(0);

  useEffect(() => {
    startBackgroundMusic();
    const saved = localStorage.getItem('joyfulPandaTownCafe');
    if (saved) {
      const data = JSON.parse(saved);
      setHappinessHearts(data.happinessHearts || 0);
      setCharacters(data.characters || CHARACTERS);
      setIngredients(data.ingredients || INGREDIENTS);
      setHelpers(data.helpers || HELPERS);
      setRecipes(data.recipes || RECIPES);
    }
    return () => {
      stopBackgroundMusic();
      stopVoice();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('joyfulPandaTownCafe', JSON.stringify({
      happinessHearts,
      characters,
      ingredients,
      helpers,
      recipes,
    }));
  }, [happinessHearts, characters, ingredients, helpers, recipes]);

  // Check for unlocks
  useEffect(() => {
    if (happinessHearts >= 200 && characters.filter(c => !c.unlocked).length > 0) {
      const nextCharacter = characters.find(c => !c.unlocked);
      if (nextCharacter) {
        setCharacters(prev => prev.map(c => 
          c.id === nextCharacter.id ? { ...c, unlocked: true } : c
        ));
        setHappinessHearts(prev => prev - 200);
        confetti({ particleCount: 300, spread: 90, origin: { y: 0.6 } });
        toast.success(`🎉 ${nextCharacter.name} joined the cafe!`);
        playSuccess();
      }
    }
  }, [happinessHearts]);

  const startNewCustomer = () => {
    const availableCustomers = characters.filter(c => c.unlocked && c.id !== 'panda');
    const customer = availableCustomers[Math.floor(Math.random() * availableCustomers.length)];
    setCurrentCustomer(customer);
    setGamePhase('customer_arriving');
    
    setTimeout(() => {
      setGamePhase('greeting');
      playPop();
    }, 1000);
  };

  const handleGreet = () => {
    if (currentCustomer) {
      playClick();
      speakReaction('panda', undefined, () => {
        setTimeout(() => {
          // Generate random order
          const orderItems = ingredients
            .filter(i => i.unlocked)
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 2)
            .map(i => i.id);
          
          setCurrentOrder({ items: orderItems, customer: currentCustomer! });
          setGamePhase('ordering');
          toast.success(`${currentCustomer.name}: ${currentCustomer.greeting}`);
          setHappinessHearts(prev => prev + 10);
        }, 1000);
      });
    }
  };

  const handleStartCooking = () => {
    setGamePhase('preparing');
    playClick();
  };

  const handleDragStart = (ingredient: Ingredient) => {
    setDraggedItem(ingredient);
    playClick();
  };

  const handleToolDrop = (toolName: string) => {
    if (draggedItem) {
      const newItem: PlateItem = {
        id: `${draggedItem.id}-${Date.now()}`,
        ingredient: draggedItem.name,
        emoji: draggedItem.emoji,
        transformed: toolName,
      };
      setPlateItems(prev => [...prev, newItem]);
      setDraggedItem(null);
      playPop();
      
      // Helper assists
      if (selectedHelper) {
        confetti({
          particleCount: 20,
          angle: 90,
          spread: 30,
          origin: { x: 0.3, y: 0.8 },
          colors: ['#FFD700', '#FF69B4'],
        });
        toast.success(`${selectedHelper.name} helped! ✨`);
      }
    }
  };

  const handleServe = () => {
    if (plateItems.length === 0) {
      toast.info('Prepare some food first!');
      return;
    }

    setGamePhase('serving');
    playSuccess();
    
    setTimeout(() => {
      setGamePhase('reacting');
      
      // Voice reaction
      if (currentCustomer) {
        speakReaction(currentCustomer.id, currentCustomer.favorite);
      }
      
      // Calculate hearts
      const baseHearts = 20;
      const itemBonus = plateItems.length * 10;
      const helperBonus = selectedHelper ? 20 : 0;
      const totalHearts = baseHearts + itemBonus + helperBonus;
      
      setHappinessHearts(prev => prev + totalHearts);
      
      // Mega confetti
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#FFD700', '#87CEEB', '#98FB98'],
      });
      
      setTimeout(() => {
        setGamePhase('thanking');
        setShowHighFive(true);
      }, 3000);
    }, 1000);
  };

  const handleHighFive = () => {
    const score = Math.random();
    setHighFiveScore(score);
    playJump();
    
    if (score > 0.7) {
      setHappinessHearts(prev => prev + 30);
      confetti({ particleCount: 100, spread: 60 });
      toast.success('Perfect high-five! +30 hearts! 🖐️');
    } else {
      setHappinessHearts(prev => prev + 10);
      toast.success('Great high-five! +10 hearts! 🖐️');
    }
    
    setTimeout(() => {
      setShowHighFive(false);
      setPlateItems([]);
      setCurrentCustomer(null);
      setCurrentOrder(null);
      setSelectedHelper(null);
      setGamePhase('welcome');
    }, 1500);
  };

  const unlockedCharacters = characters.filter(c => c.unlocked);
  const unlockedIngredients = ingredients.filter(i => i.unlocked);
  const unlockedHelpers = helpers.filter(h => h.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <Home className="w-5 h-5" />
            Home
          </Button>
          <Button variant="outline" size="icon" onClick={toggleMusic}>
            {isMusicEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="icon" onClick={toggleVoice}>
            <span className="text-xl">{isVoiceEnabled ? "🗣️" : "🤐"}</span>
          </Button>
        </div>
        
        <Badge variant="secondary" className="text-2xl px-6 py-3 gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          {happinessHearts} Hearts
        </Badge>
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-6xl font-bold text-center mb-8 text-primary"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🐼 Joyful Panda Town Cafe 🏪
        </motion.h1>

        {/* Welcome Screen */}
        <AnimatePresence mode="wait">
          {gamePhase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-8 text-center space-y-6">
                <div className="text-8xl">👨‍🍳</div>
                <h2 className="text-4xl font-bold">Welcome to the Cafe!</h2>
                <p className="text-xl text-muted-foreground">Ready to serve some happy customers?</p>
                <Button 
                  size="lg" 
                  className="text-2xl px-12 py-8"
                  onClick={() => {
                    startNewCustomer();
                    playClick();
                  }}
                >
                  <Users className="w-8 h-8 mr-3" />
                  Welcome Customer!
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Customer Arriving */}
          {gamePhase === 'customer_arriving' && currentCustomer && (
            <motion.div
              key="arriving"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
            >
              <Card className="p-12 text-center space-y-6">
                <motion.div 
                  className="text-9xl"
                  animate={{ 
                    x: [0, 20, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {currentCustomer.emoji}
                </motion.div>
                <h2 className="text-4xl font-bold">{currentCustomer.name} is arriving!</h2>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-2xl"
                >
                  👋 Walking in...
                </motion.div>
              </Card>
            </motion.div>
          )}

          {/* Greeting Phase */}
          {gamePhase === 'greeting' && currentCustomer && (
            <motion.div
              key="greeting"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Card className="p-12 text-center space-y-6">
                <div className="text-9xl">{currentCustomer.emoji}</div>
                <h2 className="text-4xl font-bold">{currentCustomer.name} has arrived!</h2>
                <p className="text-2xl text-muted-foreground">Greet your customer to earn hearts! 💖</p>
                <Button 
                  size="lg" 
                  className="text-3xl px-16 py-10"
                  onClick={handleGreet}
                >
                  👋 Say Hello! (+10 ❤️)
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Ordering Phase */}
          {gamePhase === 'ordering' && currentCustomer && currentOrder && (
            <motion.div
              key="ordering"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-12 space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-7xl">{currentCustomer.emoji}</div>
                  <h2 className="text-3xl font-bold">{currentCustomer.name}'s Order:</h2>
                  <div className="flex gap-4 justify-center items-center flex-wrap">
                    {currentOrder.items.map((itemId, index) => {
                      const ingredient = ingredients.find(i => i.id === itemId);
                      return ingredient ? (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="text-6xl bg-white rounded-2xl p-4 shadow-lg"
                        >
                          {ingredient.emoji}
                        </motion.div>
                      ) : null;
                    })}
                  </div>
                  <p className="text-xl text-muted-foreground">
                    (But you can make anything! Be creative! 🎨)
                  </p>
                  <Button 
                    size="lg" 
                    className="text-2xl px-12 py-8"
                    onClick={handleStartCooking}
                  >
                    <Cookie className="w-6 h-6 mr-2" />
                    Start Cooking!
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Preparing Phase */}
          {gamePhase === 'preparing' && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* Helpers Panel */}
              <Card className="p-6 space-y-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Helpers
                </h3>
                <p className="text-sm text-muted-foreground">Tap to cooperate!</p>
                <div className="space-y-3">
                  {unlockedHelpers.map(helper => (
                    <Button
                      key={helper.id}
                      variant={selectedHelper?.id === helper.id ? "default" : "outline"}
                      className="w-full text-xl py-6"
                      onClick={() => {
                        setSelectedHelper(helper);
                        playClick();
                        toast.success(`${helper.name} is ready to help!`);
                      }}
                    >
                      <span className="text-3xl mr-2">{helper.emoji}</span>
                      {helper.name}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Kitchen Panel */}
              <Card className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">🍳 Kitchen</h3>
                
                {/* Ingredients */}
                <div>
                  <p className="text-sm font-bold mb-2">Ingredients:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {unlockedIngredients.slice(0, 8).map(ingredient => (
                      <motion.div
                        key={ingredient.id}
                        draggable
                        onDragStart={() => handleDragStart(ingredient)}
                        className="bg-white border-2 border-border rounded-xl p-3 cursor-grab hover:scale-110 transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-4xl text-center">{ingredient.emoji}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <p className="text-sm font-bold mb-2">Cooking Tools:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Chop 🔪', 'Cook 🍳', 'Mix 🥄'].map((tool) => (
                      <motion.div
                        key={tool}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleToolDrop(tool)}
                        className="bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl p-4 text-center text-white font-bold cursor-pointer hover:scale-105 transition-all"
                        whileHover={{ scale: 1.05 }}
                      >
                        {tool}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Plate */}
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 min-h-[150px] border-4 border-yellow-300 relative">
                  <p className="text-sm font-bold mb-2">🍽️ Your Dish:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <AnimatePresence>
                      {plateItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="text-5xl"
                          style={{ transform: `rotate(${index * 15}deg)` }}
                        >
                          {item.emoji}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full text-xl"
                  onClick={handleServe}
                  disabled={plateItems.length === 0}
                >
                  Serve to {currentCustomer?.name}! 🎉
                </Button>
              </Card>

              {/* Customer Waiting */}
              <Card className="p-6 flex flex-col items-center justify-center space-y-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl"
                >
                  {currentCustomer?.emoji}
                </motion.div>
                <h3 className="text-2xl font-bold">{currentCustomer?.name}</h3>
                <motion.p
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xl text-muted-foreground"
                >
                  Waiting patiently... 😋
                </motion.p>
              </Card>
            </motion.div>
          )}

          {/* Serving & Reacting */}
          {(gamePhase === 'serving' || gamePhase === 'reacting') && currentCustomer && (
            <motion.div
              key="reacting"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Card className="p-16 text-center space-y-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-9xl"
                >
                  {currentCustomer.emoji}
                </motion.div>
                
                {gamePhase === 'reacting' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-7xl">
                      💖✨🌟💫⭐🎉
                    </div>
                    <h2 className="text-5xl font-bold text-primary">
                      SUPER YUMMY!
                    </h2>
                    <p className="text-3xl text-pink-500">
                      Best Chef Ever! You're Amazing!
                    </p>
                    <div className="flex gap-4 justify-center">
                      {[...Array(7)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Heart className="w-10 h-10 text-red-500 fill-red-500" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {/* High Five Phase */}
          {gamePhase === 'thanking' && showHighFive && (
            <motion.div
              key="highfive"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Card className="p-16 text-center space-y-8">
                <h2 className="text-4xl font-bold">Give a High-Five! 🖐️</h2>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-9xl cursor-pointer"
                  onClick={handleHighFive}
                >
                  🖐️
                </motion.div>
                <p className="text-2xl text-muted-foreground">
                  Tap the hand for bonus hearts!
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">Next Unlock:</span>
            <span className="text-sm text-muted-foreground">{happinessHearts}/200 ❤️</span>
          </div>
          <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((happinessHearts / 200) * 100, 100)}%` }}
              className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 h-full rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
