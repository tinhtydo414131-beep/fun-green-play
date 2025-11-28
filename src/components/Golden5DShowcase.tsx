import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, Zap, Crown, Trophy } from 'lucide-react';

export const Golden5DShowcase = () => {
  return (
    <div className="space-y-8 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-6xl font-righteous golden-text">
          Golden 5D Theme
        </h1>
        <p className="text-xl text-muted-foreground font-quicksand">
          Experience depth, dimension, and golden luxury
        </p>
      </motion.div>

      {/* Golden Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="btn-golden btn-5d h-16 text-lg">
          <Crown className="mr-2" />
          Golden Button
        </Button>
        <Button className="bg-gradient-holographic btn-5d h-16 text-lg text-white">
          <Sparkles className="mr-2" />
          Holographic
        </Button>
        <Button className="bg-gradient-celebration btn-5d h-16 text-lg text-white">
          <Zap className="mr-2" />
          Celebration
        </Button>
      </div>

      {/* 5D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="card-5d shadow-glow-lg border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 golden-text text-3xl">
                <Star className="text-golden-500" />
                5D Depth Card
              </CardTitle>
              <CardDescription>Hover to feel the dimension</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                This card has real depth and dimension with layered shadows and golden glow effects.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="card-holographic shadow-glow-lg border-2 border-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-3xl font-righteous">
                <Sparkles className="text-white" />
                Holographic Card
              </CardTitle>
              <CardDescription className="text-white/80">Shifting rainbow colors</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-white">
                Watch the colors shift and shimmer like a real hologram!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gradient Border Card */}
      <Card className="gradient-border shadow-depth-4">
        <CardHeader>
          <CardTitle className="golden-text text-3xl flex items-center gap-2">
            <Trophy className="text-golden-600" />
            Animated Golden Border
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            The border shimmers with animated golden gradients creating a premium, luxurious feel.
          </p>
        </CardContent>
      </Card>

      {/* Text Effects */}
      <div className="space-y-4 text-center">
        <h2 className="text-5xl font-righteous golden-text animate-golden-shimmer">
          Golden Shimmer Text
        </h2>
        <h2 className="text-5xl font-pacifico holographic">
          Holographic Text Effect
        </h2>
      </div>

      {/* Golden Particles */}
      <div className="relative h-64 rounded-2xl bg-gradient-depth overflow-hidden shadow-depth-3">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 40 - 20, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-righteous text-golden-900">
              Golden Particles
            </h3>
            <p className="text-lg text-golden-700 font-quicksand">
              Floating ambient particles create atmosphere
            </p>
          </div>
        </div>
      </div>

      {/* Shadow Depths */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((depth) => (
          <Card
            key={depth}
            className={`shadow-depth-${depth} hover:shadow-depth-5 transition-all duration-300 cursor-pointer`}
          >
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold golden-text">Depth {depth}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
