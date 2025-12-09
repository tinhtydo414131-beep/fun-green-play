import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad2, Users, Upload, Wallet, Trophy, Shield, 
  Heart, Star, ChevronRight, ChevronLeft, X, Sparkles,
  Clock, BarChart3, MessageSquare, Music, Globe
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  tips: string[];
}

interface OnboardingTourProps {
  role: "kid" | "parent" | "developer";
  onComplete: () => void;
  onSkip: () => void;
}

const ROLE_STEPS: Record<string, OnboardingStep[]> = {
  kid: [
    {
      id: "welcome",
      title: "Welcome to Fun Planet! 🌍",
      description: "Your adventure begins here! Play games, make friends, and earn CAMLY coins.",
      icon: Sparkles,
      color: "from-pink-500 to-purple-500",
      tips: ["Explore 50+ fun games", "Collect stars and rewards", "Make new friends"]
    },
    {
      id: "games",
      title: "Play Amazing Games 🎮",
      description: "Discover puzzle, adventure, and creative games designed just for you!",
      icon: Gamepad2,
      color: "from-blue-500 to-cyan-500",
      tips: ["Find games by category", "Complete levels to earn coins", "Unlock achievements"]
    },
    {
      id: "rewards",
      title: "Earn CAMLY Coins 💰",
      description: "Play games, complete challenges, and watch your coins grow!",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      tips: ["Daily check-in bonus", "Game completion rewards", "Achievement NFTs"]
    },
    {
      id: "friends",
      title: "Make New Friends 👋",
      description: "Connect with other players, chat, and play together!",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      tips: ["Send friend requests", "Chat with friends", "Join game rooms"]
    },
    {
      id: "music",
      title: "Listen & Relax 🎵",
      description: "Enjoy calming 432Hz healing music while you play!",
      icon: Music,
      color: "from-purple-500 to-pink-500",
      tips: ["Relaxing background music", "Focus-enhancing sounds", "Create playlists"]
    }
  ],
  parent: [
    {
      id: "welcome",
      title: "Welcome, Parent! 👨‍👩‍👧",
      description: "Fun Planet is designed with safety first. Let's show you the controls.",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
      tips: ["100% kid-safe content", "No ads or purchases", "Educational focus"]
    },
    {
      id: "dashboard",
      title: "Parent Dashboard 📊",
      description: "Monitor your child's activity, playtime, and progress in one place.",
      icon: BarChart3,
      color: "from-green-500 to-teal-500",
      tips: ["View play history", "See time spent", "Track achievements"]
    },
    {
      id: "time-limits",
      title: "Set Time Limits ⏰",
      description: "Control how long your child can play each day and set bedtime schedules.",
      icon: Clock,
      color: "from-orange-500 to-red-500",
      tips: ["Daily time limits", "Weekend settings", "Bedtime restrictions"]
    },
    {
      id: "safety",
      title: "Safety Controls 🛡️",
      description: "Block specific games and monitor all activities for peace of mind.",
      icon: Shield,
      color: "from-purple-500 to-pink-500",
      tips: ["Block inappropriate games", "Review chat history", "Approve friend requests"]
    },
    {
      id: "education",
      title: "Education Hub 📚",
      description: "Join discussions with other parents and educators in our community.",
      icon: MessageSquare,
      color: "from-cyan-500 to-blue-500",
      tips: ["Parent forums", "Tips from educators", "Share experiences"]
    }
  ],
  developer: [
    {
      id: "welcome",
      title: "Welcome, Developer! 💻",
      description: "Upload games, earn rewards, and help kids learn while having fun!",
      icon: Upload,
      color: "from-violet-500 to-purple-500",
      tips: ["Upload HTML5 games", "Earn 500K CAMLY per upload", "Join our community"]
    },
    {
      id: "upload",
      title: "Upload Your Games 📤",
      description: "Share your kid-friendly HTML5 games with millions of children.",
      icon: Upload,
      color: "from-blue-500 to-cyan-500",
      tips: ["ZIP format upload", "Auto safety scan", "Quick review process"]
    },
    {
      id: "rewards",
      title: "Earn Big Rewards 💎",
      description: "Get 500K CAMLY for each approved game + ongoing revenue share!",
      icon: Wallet,
      color: "from-yellow-500 to-orange-500",
      tips: ["70% revenue share", "Daily earnings", "Bonus for popular games"]
    },
    {
      id: "nft",
      title: "Game NFT Minting 🎨",
      description: "Your uploaded games become NFTs on the blockchain!",
      icon: Globe,
      color: "from-pink-500 to-rose-500",
      tips: ["Soulbound game NFTs", "Proof of creation", "Trade on OpenSea"]
    },
    {
      id: "community",
      title: "Developer Community 🤝",
      description: "Connect with other developers, share tips, and collaborate!",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      tips: ["Developer forums", "Code sharing", "Collaboration tools"]
    }
  ]
};

const ROLE_THEMES = {
  kid: {
    gradient: "from-pink-500 via-purple-500 to-blue-500",
    emoji: "🌟",
    title: "Little Explorer"
  },
  parent: {
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    emoji: "👨‍👩‍👧",
    title: "Super Parent"
  },
  developer: {
    gradient: "from-violet-500 via-purple-500 to-pink-500",
    emoji: "💻",
    title: "Game Creator"
  }
};

export function OnboardingTour({ role, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const steps = ROLE_STEPS[role] || ROLE_STEPS.kid;
  const theme = ROLE_THEMES[role] || ROLE_THEMES.kid;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handlePrev = () => {
    if (isAnimating || currentStep === 0) return;
    setIsAnimating(true);
    setCurrentStep(prev => prev - 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg bg-card rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header with gradient */}
        <div className={`h-40 bg-gradient-to-br ${step.color} relative overflow-hidden`}>
          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: [null, "-20%"],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
          
          {/* Icon */}
          <motion.div
            key={step.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Role badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">
              {theme.emoji} {theme.title}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold font-fredoka mb-3">{step.title}</h2>
              <p className="text-muted-foreground mb-6">{step.description}</p>

              {/* Tips */}
              <div className="space-y-2 mb-6">
                {step.tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{tip}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0 || isAnimating}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {/* Step indicators */}
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep 
                      ? "w-6 bg-primary" 
                      : index < currentStep 
                        ? "w-1.5 bg-primary/50" 
                        : "w-1.5 bg-muted"
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={isAnimating}
              className={`gap-1 bg-gradient-to-r ${step.color} hover:opacity-90`}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start!
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
