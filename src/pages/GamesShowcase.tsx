import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Rocket, Sparkles } from "lucide-react";

const games = [
  {
    id: "balloon-pop",
    gameId: "f92c6c5a-9e5b-402a-9f7e-fc18be33d599",
    title: "Bóng Bóng Nổ 🎈",
    description: "Nhấp vào bóng bay bay lên! Vui nhộn & dễ chơi!",
    thumbnail: "/images/games/balloon-pop.jpg",
    color: "from-pink-400 to-purple-500"
  },
  {
    id: "flower-field",
    gameId: "d230e575-67ba-4934-9784-942339c93bff",
    title: "Vườn Hoa 🌸",
    description: "Trồng hoa xinh đẹp! Bé yêu thiên nhiên!",
    thumbnail: "/images/games/flower-field.jpg",
    color: "from-green-400 to-cyan-500"
  },
  {
    id: "color-match",
    gameId: "a45c8f2e-3d1b-4e6a-8c9f-1234567890ab",
    title: "Ghép Màu Sắc 🎨",
    description: "Chọn màu đúng! Luyện trí nhớ & phản xạ!",
    thumbnail: "/images/games/color-match.jpg",
    color: "from-yellow-400 to-orange-500"
  }
];

export const GamesShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-magic-purple via-magic-cyan to-magic-purple opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      </div>

      {/* Floating Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          ✨
        </motion.div>
      ))}

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-poppins font-extrabold bg-gradient-to-r from-magic-purple via-magic-cyan to-magic-purple bg-clip-text text-transparent drop-shadow-lg">
            🎮 GAME SIÊU VUI! 🎮
          </h2>
          <p className="text-2xl font-poppins font-semibold text-magic-purple">
            Chọn game yêu thích & chơi ngay! 🚀
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.2,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              className="group"
            >
              <Card className="overflow-hidden border-4 border-magic-purple/30 bg-white/90 backdrop-blur-md rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-magic-cyan">
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={game.thumbnail}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-30 group-hover:opacity-10 transition-opacity`} />
                  
                  {/* Sparkle Overlay on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-3xl"
                        style={{
                          left: `${20 + i * 12}%`,
                          top: `${20 + (i % 3) * 30}%`,
                        }}
                        animate={{
                          scale: [0, 1.5, 0],
                          rotate: [0, 180, 360],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  {/* Title */}
                  <h3 className="text-3xl font-poppins font-bold bg-gradient-to-r from-magic-purple to-magic-cyan bg-clip-text text-transparent flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    {game.title}
                  </h3>

                  {/* Description */}
                  <p className="text-lg font-poppins text-gray-700 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Diamond Play Button */}
                  <motion.button
                    onClick={() => navigate(`/play/${game.id}`)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#6B46C1] via-[#9F7AEA] via-[#00D4FF] via-[#4FD1C7] via-[#3B82F6] to-[#00D4FF] shadow-[0_12px_40px_rgba(0,212,255,0.4),0_0_60px_rgba(107,70,193,0.3),inset_0_4px_12px_rgba(255,255,255,0.3)] border-[3px] border-[rgba(0,212,255,0.8)] group transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,212,255,0.6),0_0_80px_rgba(107,70,193,0.5),0_0_40px_rgba(255,255,255,0.8)]"
                  >
                    <div className="relative px-8 py-4 flex items-center justify-center gap-3">
                      <Rocket className="w-6 h-6 text-white group-hover:rotate-12 transition-transform drop-shadow-lg" />
                      <span className="text-xl font-poppins font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                        Chơi ngay!
                      </span>
                      <Sparkles className="w-6 h-6 text-white animate-pulse drop-shadow-lg" />
                    </div>
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
