import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroUploadBanner = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="relative mt-8 mx-auto max-w-3xl px-4"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/90 via-pink-500/90 to-purple-600/90 backdrop-blur-md p-6 sm:p-8 border-2 border-white/30 shadow-2xl shadow-orange-500/30">
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-4">
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span className="font-bold text-white text-sm">CREATOR REWARDS</span>
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          </motion.div>

          {/* Main text */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-orbitron font-black text-white leading-tight">
            Are you ready to become a{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              CREATOR
            </span>
            ?
          </h3>
          
          <p className="text-white/90 font-rajdhani text-base sm:text-lg max-w-xl mx-auto">
            🚀 Upload your game and get{" "}
            <span className="font-bold text-yellow-300 text-xl">500K CAMLY</span>{" "}
            instantly! Start your creator journey now!
          </p>

          {/* Reward indicator */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/90 rounded-full"
          >
            <Coins className="w-5 h-5 text-orange-700" />
            <span className="font-bold text-orange-800">+500,000 CAMLY</span>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="pt-2"
          >
            <Button
              onClick={() => navigate("/upload-game")}
              size="lg"
              className="relative overflow-hidden font-space font-bold text-lg sm:text-xl px-8 sm:px-12 py-6 sm:py-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 hover:from-yellow-300 hover:via-orange-300 hover:to-pink-400 text-white shadow-lg shadow-orange-500/50 border-2 border-white/30 group"
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              
              <span className="relative flex items-center gap-2">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
                Upload Your Game Now!
                <span className="text-2xl">🎮</span>
              </span>
            </Button>
          </motion.div>

          {/* Sub text */}
          <p className="text-white/70 text-xs sm:text-sm">
            Supports HTML5 games • Link or ZIP upload • 70% revenue share
          </p>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/20 to-transparent rounded-tl-full" />
      </div>
    </motion.div>
  );
};
