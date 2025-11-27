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
    <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-white">
      {/* Animated background shapes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border-2 border-primary/30 shadow-lg">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-comic text-lg font-bold text-primary">Welcome to FUN Planet! 🎉</span>
          </div>

          <div className="flex items-center justify-center gap-6 md:gap-8">
            <img 
              src={camlyCoin} 
              alt="Camly Coin" 
              className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-spin" 
              style={{ animationDuration: '10s' }}
            />
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-fredoka font-black">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-scale-in">
                FUN Planet
              </span>
            </h1>
            <img 
              src={camlyCoin} 
              alt="Camly Coin" 
              className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-spin" 
              style={{ animationDuration: '10s', animationDirection: 'reverse' }}
            />
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground font-comic max-w-3xl mx-auto leading-relaxed">
            🌍 Build Your Planet – Play & Earn Joy! 🎮 Create your dream world with fun games and amazing rewards! 🌟
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search for your favorite game... 🔍"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-14 pr-4 py-8 text-lg font-comic border-4 border-primary/60 focus:border-primary rounded-2xl shadow-lg hover:shadow-xl transition-all"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 font-fredoka font-bold px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Search 🚀
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              onClick={() => navigate("/games")}
              size="lg"
              className="font-fredoka font-bold text-xl px-10 py-8 bg-gradient-to-r from-primary to-secondary hover:shadow-xl transform hover:scale-110 transition-all"
            >
              Browse All Games 🎯
            </Button>
            <Button
              onClick={() => navigate("/leaderboard")}
              size="lg"
              variant="outline"
              className="font-fredoka font-bold text-xl px-10 py-8 border-4 border-accent/60 hover:border-accent hover:bg-accent/10 transform hover:scale-110 transition-all"
            >
              View Leaderboard 🏆
            </Button>
          </div>

          <div className="flex justify-center gap-12 pt-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-fredoka font-bold text-primary">14</p>
              <p className="text-sm font-comic text-muted-foreground">Awesome Games 🎮</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-fredoka font-bold text-accent">1000+</p>
              <p className="text-sm font-comic text-muted-foreground">Happy Players 😊</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-fredoka font-bold text-secondary">24/7</p>
              <p className="text-sm font-comic text-muted-foreground">Fun Time! ⏰</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
