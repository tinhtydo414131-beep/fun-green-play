import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import camlyCoin from "@/assets/camly-coin.png";

export const Hero = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/games?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden bg-white">
      {/* Animated background shapes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border-2 border-primary/30 shadow-lg">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
            <span className="font-comic text-sm sm:text-lg font-bold text-primary">Welcome to FUN Planet! 🎉</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8">
            <img 
              src={camlyCoin} 
              alt="Camly Coin" 
              className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-spin" 
              style={{ animationDuration: '10s' }}
            />
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-fredoka font-black">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-scale-in">
                FUN Planet
              </span>
            </h1>
            <img 
              src={camlyCoin} 
              alt="Camly Coin" 
              className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-spin" 
              style={{ animationDuration: '10s', animationDirection: 'reverse' }}
            />
          </div>

          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-comic max-w-3xl mx-auto leading-relaxed px-4">
            🌍 Build Your Planet – Play & Earn Joy! 🎮 Create your dream world with fun games and amazing rewards! 🌟
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4">
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search for your favorite game... 🔍"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 sm:pl-14 pr-24 sm:pr-32 py-6 sm:py-8 text-base sm:text-lg font-comic border-4 border-primary/60 focus:border-primary rounded-2xl shadow-lg hover:shadow-xl transition-all touch-manipulation"
              />
              <Button 
                type="submit"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 font-fredoka font-bold px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Search 🚀
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 pt-4 px-4">
            <Button
              onClick={() => navigate("/games")}
              size="lg"
              className="font-fredoka font-bold text-base sm:text-xl px-8 sm:px-10 py-6 sm:py-8 bg-gradient-to-r from-primary to-secondary hover:shadow-xl transform hover:scale-105 transition-all touch-manipulation w-full sm:w-auto"
            >
              Browse All Games 🎯
            </Button>
            <Button
              onClick={() => navigate("/leaderboard")}
              size="lg"
              variant="outline"
              className="font-fredoka font-bold text-base sm:text-xl px-8 sm:px-10 py-6 sm:py-8 border-4 border-accent/60 hover:border-accent hover:bg-accent/10 transform hover:scale-105 transition-all touch-manipulation w-full sm:w-auto"
            >
              View Leaderboard 🏆
            </Button>
          </div>

          <div className="flex justify-center gap-6 sm:gap-12 pt-8 text-center">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-2xl sm:text-4xl font-fredoka font-bold text-primary">14</p>
              <p className="text-xs sm:text-sm font-comic text-muted-foreground">Awesome Games 🎮</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-2xl sm:text-4xl font-fredoka font-bold text-accent">1000+</p>
              <p className="text-xs sm:text-sm font-comic text-muted-foreground">Happy Players 😊</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-2xl sm:text-4xl font-fredoka font-bold text-secondary">24/7</p>
              <p className="text-xs sm:text-sm font-comic text-muted-foreground">Fun Time! ⏰</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
