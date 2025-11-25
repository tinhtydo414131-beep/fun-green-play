import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-light to-accent">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-light/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <Sparkles className="absolute top-20 right-20 w-8 h-8 text-primary-foreground/30 animate-pulse" />
        <Sparkles className="absolute bottom-32 left-32 w-6 h-6 text-primary-foreground/20 animate-pulse delay-500" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-primary-foreground tracking-tight">
            FUN GAME
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto font-medium">
            Khám phá thế giới game đa dạng với hàng trăm trò chơi giải trí, trí tuệ và phiêu lưu
          </p>
          
          <div className="pt-4 animate-scale-in">
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-lg px-12 py-6 rounded-full shadow-2xl hover:shadow-primary-foreground/50 transition-all duration-300 hover:scale-105"
            >
              Bắt đầu chơi ngay
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};
