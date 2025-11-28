import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import camlyCoin from "@/assets/camly-coin.png";
import { useGameAudio } from "@/hooks/useGameAudio";
import { AudioControls } from "./AudioControls";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { playClick, playPop, isSoundEnabled, isMusicEnabled, toggleSound, toggleMusic } = useGameAudio();
  const { user } = useAuth();
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string>("/videos/hero-background.mp4");

  useEffect(() => {
    if (user) {
      fetchActiveBackgroundVideo();
    }
  }, [user]);

  const fetchActiveBackgroundVideo = async () => {
    try {
      const { data, error } = await supabase
        .from("user_background_videos")
        .select("storage_path")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        // Use default video if no active video found
        setBackgroundVideoUrl("/videos/hero-background.mp4");
        return;
      }

      // Get signed URL for the private video (valid for 1 hour)
      const { data: urlData, error: urlError } = await supabase.storage
        .from("background-videos")
        .createSignedUrl(data.storage_path, 3600);

      if (urlError || !urlData?.signedUrl) {
        console.error("Error getting signed URL:", urlError);
        setBackgroundVideoUrl("/videos/hero-background.mp4");
        return;
      }

      setBackgroundVideoUrl(urlData.signedUrl);
    } catch (error) {
      console.error("Error fetching background video:", error);
      setBackgroundVideoUrl("/videos/hero-background.mp4");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/games?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 -z-10">
        <video
          key={backgroundVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundVideoUrl} type="video/mp4" />
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-purple-900/50 to-blue-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent animate-breathing" />
        
        {/* Moving gradient orbs */}
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-float-up" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-float-up" style={{ animationDuration: '25s', animationDelay: '5s' }} />
        <div className="absolute top-40 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl animate-float-up" style={{ animationDuration: '30s', animationDelay: '10s' }} />
        
        {/* Stars/Particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
        
        {/* Larger glowing stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute rounded-full animate-sparkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: `radial-gradient(circle, ${
                ['rgba(139, 70, 255, 0.8)', 'rgba(0, 242, 255, 0.8)', 'rgba(255, 255, 255, 0.9)'][Math.floor(Math.random() * 3)]
              }, transparent)`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent animate-float-up"
            style={{
              top: `${Math.random() * 50}%`,
              left: `${-20 + Math.random() * 40}%`,
              width: `${50 + Math.random() * 100}px`,
              animationDelay: `${i * 8}s`,
              animationDuration: '3s',
              transform: 'rotate(-45deg)',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
          <div className="flex justify-end mb-4">
            <AudioControls 
              isMusicEnabled={isMusicEnabled}
              isSoundEnabled={isSoundEnabled}
              onToggleMusic={toggleMusic}
              onToggleSound={toggleSound}
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white/95 backdrop-blur-md rounded-full border-2 border-white/50 shadow-lg">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
            <span className="font-space text-sm sm:text-lg font-black text-foreground">Welcome to FUN Planet! 🎉</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8">
            <img 
              src={camlyCoin} 
              alt="Camly Coin" 
              className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-spin drop-shadow-[0_0_20px_rgba(139,70,255,0.8)]" 
              style={{ animationDuration: '10s' }}
            />
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-orbitron font-black tracking-wider drop-shadow-[0_0_30px_rgba(139,70,255,0.8)]">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
                FUN Planet
              </span>
            </h1>
            <img 
              src={camlyCoin} 
              alt="Camly Coin" 
              className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-spin drop-shadow-[0_0_20px_rgba(0,242,255,0.8)]" 
              style={{ animationDuration: '10s', animationDirection: 'reverse' }}
            />
          </div>

          <p className="text-base sm:text-xl md:text-2xl text-foreground font-rajdhani font-black max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-lg bg-white/95 rounded-2xl py-4 border-2 border-white/50">
            🌍 Build Your Planet – Play & Earn Joy! 🎮 Create your dream world with fun games and amazing rewards! 🌟
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
            <div className="space-y-1 sm:space-y-2">
              <p className="text-2xl sm:text-4xl font-space font-bold text-purple-400 drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]">14</p>
              <p className="text-xs sm:text-sm font-rajdhani text-white/80">Awesome Games 🎮</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-2xl sm:text-4xl font-space font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">1000+</p>
              <p className="text-xs sm:text-sm font-rajdhani text-white/80">Happy Players 😊</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-2xl sm:text-4xl font-space font-bold text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]">24/7</p>
              <p className="text-xs sm:text-sm font-rajdhani text-white/80">Fun Time! ⏰</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
