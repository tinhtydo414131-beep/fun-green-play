import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, X, Maximize2, Gamepad2, Palette, Globe, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { haptics } from "@/utils/haptics";
import confetti from "canvas-confetti";

interface SampleGame {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  path: string;
  category: string;
}

const SAMPLE_GAMES: SampleGame[] = [
  {
    id: "2048-puzzle",
    title: "2048 Puzzle",
    description: "Merge tiles to reach 2048! A classic brain teaser.",
    icon: "🧩",
    gradient: "from-purple-500 to-indigo-600",
    path: "/games/2048-puzzle.html",
    category: "Brain"
  },
  {
    id: "drawing-canvas",
    title: "Drawing Canvas",
    description: "Express your creativity with colors and brushes!",
    icon: "🎨",
    gradient: "from-pink-500 to-rose-600",
    path: "/games/drawing-canvas.html",
    category: "Creative"
  },
  {
    id: "eco-builder",
    title: "Eco Builder 3D",
    description: "Build a beautiful eco-friendly world in 3D!",
    icon: "🌍",
    gradient: "from-green-500 to-emerald-600",
    path: "/games/eco-builder.html",
    category: "3D Builder"
  },
  {
    id: "gratitude-journal",
    title: "Gratitude Journal",
    description: "Write what you're thankful for and track your happiness!",
    icon: "💖",
    gradient: "from-amber-500 to-orange-600",
    path: "/games/gratitude-journal.html",
    category: "Mindfulness"
  },
  {
    id: "star-explorer",
    title: "Star Explorer",
    description: "Fly through space, collect stars, avoid asteroids!",
    icon: "🚀",
    gradient: "from-blue-500 to-cyan-600",
    path: "/games/star-explorer.html",
    category: "Adventure"
  }
];

export default function SampleGames() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<SampleGame | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePlayGame = (game: SampleGame) => {
    haptics.success();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00D4FF', '#FFD700', '#FF69B4', '#00FF88', '#9B59B6'],
      shapes: ['star'],
    });
    setActiveGame(game);
  };

  const handleCloseGame = () => {
    haptics.light();
    setActiveGame(null);
    setIsFullscreen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Brain": return <Gamepad2 className="w-4 h-4" />;
      case "Creative": return <Palette className="w-4 h-4" />;
      case "3D Builder": return <Globe className="w-4 h-4" />;
      case "Mindfulness": return <Heart className="w-4 h-4" />;
      case "Adventure": return <Star className="w-4 h-4" />;
      default: return <Gamepad2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background pb-safe">
      <Navigation />
      
      {/* Fullscreen Game Modal */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeGame.icon}</span>
                <div>
                  <h2 className="text-white font-bold">{activeGame.title}</h2>
                  <p className="text-white/70 text-sm">{activeGame.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleCloseGame}
                  className="bg-red-500 hover:bg-red-600 rounded-full"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Game iframe */}
            <iframe
              src={activeGame.path}
              className={`w-full border-0 ${isFullscreen ? 'h-full' : 'h-[calc(100%-80px)] mt-[80px]'}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              title={activeGame.title}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <section className="pt-20 md:pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 space-y-4"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/games')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full border border-yellow-400/30">
              <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="text-sm font-bold text-yellow-600">SAMPLE GAMES</span>
              <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                5 Sample Games to Inspire You! 🎮
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Play these fun games directly in your browser. No download required!
            </p>
          </motion.div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
                  {/* Gradient Header */}
                  <div className={`h-32 bg-gradient-to-br ${game.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-6xl"
                    >
                      {game.icon}
                    </motion.div>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-white/30 rounded-full"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 2) * 40}%`
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.7, 0.3]
                          }}
                          transition={{
                            duration: 2 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.3
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{game.title}</CardTitle>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs text-primary font-medium">
                        {getCategoryIcon(game.category)}
                        {game.category}
                      </span>
                    </div>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Button
                      onClick={() => handlePlayGame(game)}
                      className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90 text-white font-bold py-6 text-lg group-hover:scale-[1.02] transition-transform`}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-2xl">Create Your Own Game! 🎮</CardTitle>
                <CardDescription className="text-base">
                  Upload your game and earn 500,000 CAMLY tokens! It's that easy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/upload-game')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-6 text-lg"
                >
                  Upload Game +500K 💎
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}