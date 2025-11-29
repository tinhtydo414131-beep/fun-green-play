import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Trophy, Users, Sparkles, Shield, Gift } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import camlyCoin from "@/assets/camly-coin.png";
import categoryAdventure from "@/assets/category-adventure.png";
import categoryPuzzle from "@/assets/category-puzzle.png";
import categoryCasual from "@/assets/category-casual.png";
import categoryEducational from "@/assets/category-educational.png";
import featureGames from "@/assets/feature-games.png";
import featureSafe from "@/assets/feature-safe.png";
import featureRewards from "@/assets/feature-rewards.png";
import featureFriends from "@/assets/feature-friends.png";
import featureCompete from "@/assets/feature-compete.png";
import featureLearning from "@/assets/feature-learning.png";
import { JoyBot } from "@/components/JoyBot";
import { FeaturedGame } from "@/components/FeaturedGame";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect logged-in users to dashboard
    if (!loading && user) {
      // Don't auto-redirect, let them explore homepage
    }
  }, [user, loading]);

  const features = [
    {
      icon: <Gamepad2 className="w-12 h-12 text-primary" />,
      title: "100+ Fun Games",
      description: "Play amazing games made for kids! From puzzles to adventures! 🎮",
      color: "from-primary to-purple-500",
      image: featureGames
    },
    {
      icon: <Shield className="w-12 h-12 text-accent" />,
      title: "Safe & Secure",
      description: "Kid-friendly content, no ads, and parent-approved safety! 🛡️",
      color: "from-accent to-green-500",
      image: featureSafe
    },
    {
      icon: <Gift className="w-12 h-12 text-secondary" />,
      title: "Earn Rewards",
      description: "Play games and earn crypto tokens you can collect! 🎁",
      color: "from-secondary to-orange-500",
      image: featureRewards
    },
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: "Make Friends",
      description: "Chat with other kids and make new gaming buddies! 👥",
      color: "from-primary to-pink-500",
      image: featureFriends
    },
    {
      icon: <Trophy className="w-12 h-12 text-accent" />,
      title: "Compete & Win",
      description: "Join the leaderboard and become the top player! 🏆",
      color: "from-accent to-blue-500",
      image: featureCompete
    },
    {
      icon: <Sparkles className="w-12 h-12 text-secondary" />,
      title: "Learn While Playing",
      description: "Educational games that make learning super fun! ✨",
      color: "from-secondary to-purple-500",
      image: featureLearning
    }
  ];

  const categories = [
    { name: "Adventure 🗺️", count: 5, color: "bg-gradient-to-br from-primary to-purple-500", image: categoryAdventure },
    { name: "Puzzle 🧩", count: 4, color: "bg-gradient-to-br from-accent to-green-500", image: categoryPuzzle },
    { name: "Casual 🎯", count: 3, color: "bg-gradient-to-br from-secondary to-orange-500", image: categoryCasual },
    { name: "Educational 📚", count: 2, color: "bg-gradient-to-br from-primary to-pink-500", image: categoryEducational },
  ];

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 }
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.5
  };

  return (
    <motion.div 
      className="min-h-screen bg-background-green relative overflow-hidden pb-safe"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Navigation />
      <Hero />
      <FeaturedGame />
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-primary">
              Why Kids Love Us! 💖
            </h2>
            <p className="text-xl font-comic text-foreground/80 font-bold max-w-2xl mx-auto">
              Everything you need for the best gaming experience!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="overflow-hidden border-4 border-primary/50 hover:border-primary transition-all hover:shadow-2xl transform hover:scale-105 animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-10 transition-opacity`} />
                </div>
                <div className="p-8">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg group-hover:shadow-xl transition-all`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-fredoka font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/90 font-comic text-lg font-bold">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-primary">
              Game Categories 🎨
            </h2>
            <p className="text-xl font-comic text-foreground/80 font-bold">
              Pick your favorite type of game to play!
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <button
                key={category.name}
                onClick={() => navigate("/games")}
                className="relative overflow-hidden rounded-3xl border-4 border-primary/50 shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[4/3]">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 ${category.color} opacity-40 group-hover:opacity-30 transition-opacity`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <p className="text-4xl md:text-5xl font-fredoka font-bold mb-2 drop-shadow-lg">{category.count}</p>
                    <p className="text-lg md:text-xl font-comic font-bold drop-shadow-lg">{category.name}</p>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm drop-shadow-lg">Click to explore! →</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 border-4 border-primary/60 shadow-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-primary">
              Ready to Start Playing? 🚀
            </h2>
            <p className="text-xl font-comic text-foreground/90 font-bold max-w-2xl mx-auto">
              Join thousands of kids having fun, making friends, and earning rewards!
            </p>
            {!user ? (
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="font-fredoka font-bold text-2xl px-12 py-10 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-110 transition-all"
              >
                Sign Up Free! ✨
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/games")}
                size="lg"
                className="font-fredoka font-bold text-2xl px-12 py-10 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-110 transition-all"
              >
                Start Playing! 🎮
              </Button>
            )}
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary/10 to-secondary/10 border-t-4 border-primary/60 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-fredoka font-bold text-primary mb-4">FUN Planet 🌍</h3>
              <p className="font-comic text-muted-foreground">Build Your Planet – Play & Earn Joy!</p>
            </div>
            <div>
              <h4 className="text-xl font-fredoka font-bold text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2 font-comic">
                <p className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">About Us</p>
                <p className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Privacy Policy</p>
                <p className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Terms of Service</p>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-fredoka font-bold text-foreground mb-4">Follow Us! 📱</h4>
              <p className="font-comic text-muted-foreground">Stay updated with new games and features!</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t-2 border-primary/20 text-center">
            <p className="font-comic text-muted-foreground">© 2024 FUN Planet. Build Your Planet – Play & Earn Joy! Made with ❤️</p>
          </div>
        </div>
      </footer>
      <JoyBot />
    </motion.div>
  );
};

export default Index;
