import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Upload, Sparkles, X, Star, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const WELCOME_POPUP_KEY = "fun_planet_welcome_popup_shown";

export const WelcomeCreatorPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Check if popup was already shown
    const shown = localStorage.getItem(WELCOME_POPUP_KEY);
    if (shown) return;

    // Show popup after a short delay for new users
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = () => {
    localStorage.setItem(WELCOME_POPUP_KEY, "true");
    setIsOpen(false);
  };

  const handlePlayGame = () => {
    handleClose();
    navigate("/games");
  };

  const handleCreateGame = () => {
    handleClose();
    navigate("/upload-game");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 shadow-2xl border-2 border-white/20"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-10, 10],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random(),
                }}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Angel AI Avatar */}
          <div className="relative pt-8 pb-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative inline-block"
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-xl opacity-50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Angel avatar */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 border-4 border-white/30">
                <span className="text-5xl">👼</span>
              </div>

              {/* Sparkle decorations */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-2"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-5 h-5 text-cyan-300" />
              </motion.div>
            </motion.div>

            {/* Angel AI badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full border border-white/20"
            >
              <span className="font-bold text-white text-sm">Angel AI</span>
              <span className="text-cyan-300">✨</span>
            </motion.div>
          </div>

          {/* Message content */}
          <div className="relative z-10 px-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl font-orbitron font-black text-white leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                  FUN PLANET
                </span>
                ! 🌍
              </h2>

              <p className="text-white/90 font-rajdhani text-lg sm:text-xl">
                Do you want to{" "}
                <span className="text-cyan-300 font-bold">play a game</span>
                {" "}or{" "}
                <span className="text-yellow-300 font-bold">create your own game</span>
                {" "}to win a prize? 🏆
              </p>

              {/* Reward highlight */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full border border-yellow-400/50"
              >
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-yellow-300">Creators get 500K CAMLY!</span>
              </motion.div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Play Game Button */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handlePlayGame}
                  size="lg"
                  className="w-full h-auto py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-space font-bold text-lg shadow-lg shadow-cyan-500/30 border border-white/20 group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Gamepad2 className="w-8 h-8 group-hover:animate-bounce" />
                    <span>Play Game</span>
                    <span className="text-xs text-cyan-200">Explore 50+ games!</span>
                  </div>
                </Button>
              </motion.div>

              {/* Create Game Button */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleCreateGame}
                  size="lg"
                  className="w-full h-auto py-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-400 hover:via-pink-400 hover:to-purple-400 text-white font-space font-bold text-lg shadow-lg shadow-orange-500/30 border border-white/20 group relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  
                  <div className="relative flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 group-hover:animate-bounce" />
                    <span>Create Game → Upload</span>
                    <span className="text-xs text-yellow-200">Get 500K CAMLY! 💰</span>
                  </div>
                </Button>
              </motion.div>
            </motion.div>

            {/* Skip text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-center text-white/50 text-sm cursor-pointer hover:text-white/80 transition-colors"
              onClick={handleClose}
            >
              Skip for now
            </motion.p>
          </div>

          {/* Bottom decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
