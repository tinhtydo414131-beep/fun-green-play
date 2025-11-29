import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface FeaturedGameProps {
  gameId?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  difficulty?: string;
  genre?: string;
  likes?: number;
  plays?: number;
}

export const FeaturedGame = ({
  gameId = "gold-miner",
  title = "Thợ Đào Vàng",
  description = "Đào vàng, kim cương và kho báu quý giá! Mỗi lần đào có thể tìm thấy điều bất ngờ!",
  imageUrl = "/images/games/gold-miner.jpg",
  difficulty = "easy",
  genre = "casual",
  likes = 0,
  plays = 0
}: FeaturedGameProps) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 space-y-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-5xl md:text-6xl font-fredoka font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent inline-flex items-center gap-3">
            <span className="text-4xl">✨</span>
            Featured Game
            <span className="text-4xl">✨</span>
          </h2>
          <p className="text-2xl font-comic font-bold text-secondary">
            New and exciting!
          </p>
        </motion.div>

        {/* Featured Game Card */}
        <motion.div
          className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: 'white',
            position: 'relative',
          }}
        >
          {/* Animated Gradient Border */}
          <div 
            className="absolute inset-0 rounded-[2rem] p-[4px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, hsl(262, 100%, 64%), hsl(280, 100%, 70%), hsl(186, 100%, 50%), hsl(200, 100%, 60%))',
              backgroundSize: '300% 300%',
              animation: 'gradient-shift 4s ease infinite',
            }}
          >
            <div className="w-full h-full bg-white rounded-[2rem]" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 grid md:grid-cols-2 gap-6 p-6 md:p-8">
            {/* Game Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <img 
                src={imageUrl}
                alt={title}
                className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* NEW Badge */}
              <div className="absolute top-4 right-4">
                <Badge 
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-fredoka font-bold px-4 py-2 shadow-lg border-2 border-white"
                  style={{
                    animation: 'pulse-subtle 2s ease-in-out infinite'
                  }}
                >
                  ✨ NEW ✨
                </Badge>
              </div>
            </div>

            {/* Game Info */}
            <div className="flex flex-col justify-between space-y-6">
              {/* Title & Description */}
              <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl font-fredoka font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {title}
                </h3>
                <p className="text-lg md:text-xl font-comic text-foreground/90 font-bold leading-relaxed">
                  {description}
                </p>

                {/* Difficulty & Genre Badges */}
                <div className="flex gap-3 flex-wrap">
                  <Badge 
                    variant="secondary"
                    className="text-base font-comic font-bold px-4 py-2 bg-purple-100 text-primary border-2 border-primary/30"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    {genre}
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className="text-base font-comic font-bold px-4 py-2 bg-cyan-100 text-accent border-2 border-accent/30"
                  >
                    <span className="mr-1">⭐</span>
                    {difficulty}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex gap-6 items-center text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    <span className="font-comic font-bold text-lg">{plays} plays</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart 
                      className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-primary'}`}
                    />
                    <span className="font-comic font-bold text-lg">{likes} likes</span>
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <Button
                onClick={() => navigate(`/games/${gameId}`)}
                size="lg"
                className="w-full text-2xl font-fredoka font-bold py-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, hsl(262, 100%, 64%) 0%, hsl(186, 100%, 50%) 100%)',
                  color: 'white',
                }}
              >
                Play Now! 🔨
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Tip */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-3 rounded-full border-2 border-primary/20">
            <span className="text-2xl">💪</span>
            <p className="font-comic font-bold text-foreground/80 text-lg">
              Mỗi game đều có level riêng, thách bạn hơn với mỗi màn chơi!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Helper component (already imported from lucide-react, but defining for clarity)
const Users = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
