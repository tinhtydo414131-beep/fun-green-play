import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Gamepad2, Shield, Code, Sparkles } from "lucide-react";

interface OnboardingRoleSelectorProps {
  onSelectRole: (role: "kid" | "parent" | "developer") => void;
  onSkip: () => void;
}

const ROLES = [
  {
    id: "kid" as const,
    title: "I'm a Kid",
    description: "Play games, make friends, and earn rewards!",
    icon: Gamepad2,
    gradient: "from-pink-500 to-purple-500",
    emoji: "🎮"
  },
  {
    id: "parent" as const,
    title: "I'm a Parent",
    description: "Monitor activity, set limits, and keep kids safe.",
    icon: Shield,
    gradient: "from-blue-500 to-indigo-500",
    emoji: "👨‍👩‍👧"
  },
  {
    id: "developer" as const,
    title: "I'm a Developer",
    description: "Upload games, earn rewards, and build for kids!",
    icon: Code,
    gradient: "from-violet-500 to-purple-500",
    emoji: "💻"
  }
];

export function OnboardingRoleSelector({ onSelectRole, onSkip }: OnboardingRoleSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-card rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="h-32 bg-gradient-to-br from-primary via-purple-500 to-pink-500 relative overflow-hidden">
          {/* Floating particles */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%"
              }}
              animate={{ 
                y: [null, "-30%"],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-center"
            >
              <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-white font-fredoka">Welcome to Fun Planet!</h2>
            </motion.div>
          </div>

          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-center text-muted-foreground mb-6">
            Tell us who you are so we can personalize your experience!
          </p>

          {/* Role cards */}
          <div className="space-y-3">
            {ROLES.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  onClick={() => onSelectRole(role.id)}
                  className="w-full p-4 rounded-2xl border-2 border-muted/50 hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all duration-300 group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{role.title}</h3>
                        <span className="text-xl">{role.emoji}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
              Skip for now
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
