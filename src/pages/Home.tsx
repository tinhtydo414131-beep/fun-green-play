import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Users, Trophy, Gamepad2, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { JoyBot } from "@/components/JoyBot";
import { motion } from "framer-motion";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 }
  };

  const pageTransition = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-safe"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 text-center"
          >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border-2 border-primary/30"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-comic font-bold text-primary">
                    Build Your Planet – Play & Earn Joy!
                  </span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-fredoka font-bold">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    FUN Planet
                  </span>
                  <br />
                  <span className="text-foreground text-4xl md:text-6xl">
                    Where Fun Meets Rewards! 🚀
                  </span>
                </h1>

                <p className="text-xl md:text-2xl font-comic text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Play amazing games, make friends, and earn crypto rewards in the safest gaming platform for kids!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user ? (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate("/auth")}
                      className="font-fredoka font-bold text-xl px-8 py-6 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-105 transition-all"
                    >
                      <Gamepad2 className="w-6 h-6 mr-2" />
                      Start Playing Free!
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/games")}
                      className="font-fredoka font-bold text-xl px-8 py-6 border-2 hover:bg-primary/10"
                    >
                      Browse Games
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate("/dashboard")}
                      className="font-fredoka font-bold text-xl px-8 py-6 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl transform hover:scale-105 transition-all"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/games")}
                      className="font-fredoka font-bold text-xl px-8 py-6 border-2 hover:bg-primary/10"
                    >
                      Play Games
                    </Button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <Card className="p-4 text-center border-2 border-primary/30 bg-background/80 backdrop-blur-sm">
                  <div className="text-3xl font-fredoka font-bold text-primary">100+</div>
                  <div className="text-sm font-comic text-muted-foreground">Games</div>
                </Card>
                <Card className="p-4 text-center border-2 border-secondary/30 bg-background/80 backdrop-blur-sm">
                  <div className="text-3xl font-fredoka font-bold text-secondary">10K+</div>
                  <div className="text-sm font-comic text-muted-foreground">Players</div>
                </Card>
                <Card className="p-4 text-center border-2 border-accent/30 bg-background/80 backdrop-blur-sm">
                  <div className="text-3xl font-fredoka font-bold text-accent">1M+</div>
                  <div className="text-sm font-comic text-muted-foreground">Fun Hours</div>
                </Card>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Gamepad2 className="w-8 h-8" />, title: "100+ Games", color: "from-primary to-purple-500" },
              { icon: <Heart className="w-8 h-8" />, title: "Kid-Safe", color: "from-accent to-green-500" },
              { icon: <Trophy className="w-8 h-8" />, title: "Earn Rewards", color: "from-secondary to-orange-500" },
              { icon: <Users className="w-8 h-8" />, title: "Make Friends", color: "from-primary to-pink-500" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center border-2 border-primary/30 hover:border-primary/60 transition-all hover:shadow-xl group">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="font-fredoka font-bold text-lg text-foreground">
                    {feature.title}
                  </h3>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <JoyBot />
    </motion.div>
  );
};

export default Home;
