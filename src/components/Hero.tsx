import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Sparkles, Diamond } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import camlyCoin from "@/assets/camly-coin.png";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "./AudioControls";
import { HeroStats } from "./HeroStats";
import { HeroActionButtons } from "./HeroActionButtons";
import { motion } from "framer-motion";
import { MEDIA_URLS } from "@/config/media";

export const Hero = () => {
  const [search, setSearch] = useState("");
  const [backgroundVideo, setBackgroundVideo] = useState<string>(MEDIA_URLS.videos.heroBackgroundLatest);
  const navigate = useNavigate();
  const {
    playClick,
    playPop,
    isSoundEnabled,
    isMusicEnabled,
    toggleSound,
    toggleMusic
  } = useGameAudio();

  useEffect(() => {
    const savedVideo = localStorage.getItem("funplanet-background-video");
    if (savedVideo) {
      setBackgroundVideo(savedVideo);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/games?search=${encodeURIComponent(search)}`);
    }
  };
  const scrollToFeaturedGames = () => {
    document.getElementById('featured-games')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background video */}
      <video 
        key={backgroundVideo}
        autoPlay 
        loop 
        muted 
        playsInline 
        poster="/images/games/dream-world.jpg" 
        className="absolute inset-0 w-full h-full object-cover contrast-110 brightness-105 saturate-110 z-0 opacity-5" 
        style={{ minHeight: "100%" }}
      >
        <source src={backgroundVideo} type="video/mp4" />
        {/* Local fallback so the background always works even if CDN is slow */}
        <source src="/videos/hero-background-latest.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Audio controls */}
          <div className="flex justify-end mb-2">
            <AudioControls isMusicEnabled={isMusicEnabled} isSoundEnabled={isSoundEnabled} onToggleMusic={toggleMusic} onToggleSound={toggleSound} />
          </div>
          
          {/* Badge */}
          <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-cyan-600/90 backdrop-blur-md rounded-full border-2 border-white/50 shadow-xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse" />
            <span className="font-space text-sm sm:text-lg font-black text-white">🌟 The Ultimate Kids Gaming Universe!</span>
          </motion.div>

          {/* Logo with diamonds */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.2
        }} className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8">
            <motion.div animate={{
            rotate: 360
          }} transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}>
              
            </motion.div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-orbitron font-black tracking-wider drop-shadow-[0_0_40px_rgba(139,70,255,1)]">
              <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
                FUN PLANET
              </span>
            </h1>
            
            
          </motion.div>

          {/* Slogan */}
          <motion.p initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.3
        }} className="text-base sm:text-xl md:text-2xl text-white font-rajdhani font-black max-w-3xl mx-auto leading-relaxed px-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-cyan-600/80 backdrop-blur-lg rounded-3xl py-4 sm:py-6 border-2 border-white/30 shadow-2xl">
            🚀 Build Your Planet – Play & Earn Joy! 💎✨
          </motion.p>

          {/* Search bar */}
          <motion.form initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }} onSubmit={handleSearch} className="max-w-2xl mx-auto px-4">
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-purple-400 group-hover:text-cyan-400 transition-colors" />
              <Input type="text" placeholder="Search for games... 🔍" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 sm:pl-14 pr-24 sm:pr-32 py-5 sm:py-7 text-base sm:text-lg font-rajdhani font-medium bg-white/10 backdrop-blur-md border-2 border-primary/40 focus:border-cyan-400 rounded-2xl shadow-lg text-white placeholder:text-white/60 focus:ring-4 focus:ring-cyan-400/20" />
              <Button type="submit" onMouseEnter={() => playPop()} onClick={() => playClick()} className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 font-space font-bold px-4 sm:px-8 py-4 sm:py-5 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg">
                Search 🚀
              </Button>
            </div>
          </motion.form>

          {/* Real-time Stats */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.5
        }}>
            <HeroStats />
          </motion.div>

          {/* 4 Large Action Buttons */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6
        }} className="pt-6">
            <HeroActionButtons onScrollToGames={scrollToFeaturedGames} />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1,
          y: [0, 10, 0]
        }} transition={{
          delay: 1,
          y: {
            duration: 1.5,
            repeat: Infinity
          }
        }} className="pt-8">
            <button onClick={scrollToFeaturedGames} className="text-white/60 hover:text-white transition-colors">
              <span className="block text-sm mb-2">Scroll to Play</span>
              <span className="text-3xl">↓</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>;
};