import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import camlyCoin from "@/assets/camly-coin.png";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "./AudioControls";
import { HeroUploadBanner } from "./HeroUploadBanner";

export const Hero = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { playClick, playPop, isSoundEnabled, isMusicEnabled, toggleSound, toggleMusic } = useGameAudio();


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/games?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden">
      {/* Background video with robust fallbacks */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/games/dream-world.jpg"
        className="absolute inset-0 w-full h-full object-cover contrast-110 brightness-105 saturate-110 z-0"
        style={{ minHeight: "100%" }}
      >
        {/* Primary CDN source */}
        <source
          src="https://media.funplanet.life/videos/hero-background-latest.mp4"
          type="video/mp4"
        />
        {/* Local fallback in case CDN fails or is offline */}
        <source src="/videos/hero-background-latest.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/15 to-white/25 backdrop-blur-[2px]" />
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
          <div className="flex justify-end mb-4">
            <AudioControls 
              isMusicEnabled={isMusicEnabled}
              isSoundEnabled={isSoundEnabled}
              onToggleMusic={toggleMusic}
              onToggleSound={toggleSound}
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-cyan-600/90 backdrop-blur-md rounded-full border-2 border-white/50 shadow-xl hover:scale-105 transition-transform animate-fade-in">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse" />
            <span className="font-space text-sm sm:text-lg font-black text-white">🌟 The Ultimate Kids Gaming Universe!</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8">
            <img 
              src={camlyCoin} 
              alt="Camly Coin" 
              loading="lazy"
              decoding="async"
              className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-spin drop-shadow-[0_0_20px_rgba(139,70,255,0.8)]" 
              style={{ animationDuration: '10s' }}
            />
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-orbitron font-black tracking-wider drop-shadow-[0_0_40px_rgba(139,70,255,1)]">
              <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
                FUN PLANET
              </span>
            </h1>
            <img 
              src={camlyCoin} 
              alt="Camly Coin" 
              loading="lazy"
              decoding="async"
              className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-spin drop-shadow-[0_0_20px_rgba(0,242,255,0.8)]" 
              style={{ animationDuration: '10s', animationDirection: 'reverse' }}
            />
          </div>

          <p className="text-base sm:text-xl md:text-2xl text-white font-rajdhani font-black max-w-3xl mx-auto leading-relaxed px-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-cyan-600/80 backdrop-blur-lg rounded-3xl py-6 border-2 border-white/30 shadow-2xl hover:scale-105 transition-transform">
            🚀 Where Adventure Meets Rewards! Play Epic Games, Make Amazing Friends & Collect Awesome Crypto Prizes! 💎✨
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4">
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-purple-400 group-hover:text-cyan-400 transition-colors" />
              <Input
                type="text"
                placeholder="Search for your favorite game... 🔍"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 sm:pl-14 pr-24 sm:pr-32 py-6 sm:py-8 text-base sm:text-lg font-rajdhani font-medium bg-white/10 backdrop-blur-md border-4 border-primary/40 focus:border-cyan-400 rounded-2xl shadow-lg hover:shadow-cyan-500/50 transition-all touch-manipulation text-white placeholder:text-white/60 focus:ring-4 focus:ring-cyan-400/20"
              />
              <Button 
                type="submit"
                onMouseEnter={() => playPop()}
                onClick={() => playClick()}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 font-space font-bold px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-500/50 hover:shadow-cyan-500/50 transform hover:scale-105 transition-all border border-white/20"
              >
                Search 🚀
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 pt-4 px-4">
            <Button
              onClick={() => { playClick(); navigate("/games"); }}
              onMouseEnter={() => playPop()}
              size="lg"
              className="font-space font-bold text-base sm:text-xl px-8 sm:px-10 py-6 sm:py-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/50 hover:shadow-pink-500/50 transform hover:scale-105 transition-all border border-white/20 backdrop-blur-sm touch-manipulation w-full sm:w-auto"
            >
              Browse All Games 🎯
            </Button>
            <Button
              onClick={() => { playClick(); navigate("/leaderboard"); }}
              onMouseEnter={() => playPop()}
              size="lg"
              variant="outline"
              className="font-space font-bold text-base sm:text-xl px-8 sm:px-10 py-6 sm:py-8 bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/20 text-white hover:text-cyan-400 hover:border-cyan-400 shadow-lg transform hover:scale-105 transition-all touch-manipulation w-full sm:w-auto"
            >
              View Leaderboard 🏆
            </Button>
          </div>

          <div className="flex justify-center gap-6 sm:gap-12 pt-8 text-center">
            <div className="space-y-1 sm:space-y-2 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-110">
              <p className="text-2xl sm:text-4xl font-space font-bold text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,1)]">50+</p>
              <p className="text-xs sm:text-sm font-rajdhani text-white font-bold">Epic Games 🎮</p>
            </div>
            <div className="space-y-1 sm:space-y-2 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-110">
              <p className="text-2xl sm:text-4xl font-space font-bold text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">5K+</p>
              <p className="text-xs sm:text-sm font-rajdhani text-white font-bold">Active Players 🌟</p>
            </div>
            <div className="space-y-1 sm:space-y-2 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-110">
              <p className="text-2xl sm:text-4xl font-space font-bold text-pink-300 drop-shadow-[0_0_15px_rgba(244,114,182,1)]">∞</p>
              <p className="text-xs sm:text-sm font-rajdhani text-white font-bold">Fun Forever! 🚀</p>
            </div>
          </div>

          {/* Creator Upload Banner */}
          <HeroUploadBanner />
        </div>
      </div>
    </section>
  );
};
