import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface GameCategoryProps {
  title: string;
  description: string;
  image: string;
  delay?: number;
}

export const GameCategory = ({ title, description, image, delay = 0 }: GameCategoryProps) => {
  return (
    <Card 
      className="group overflow-hidden border-0 animate-slide-up cursor-pointer p-1 rounded-2xl"
      style={{ 
        animationDelay: `${delay}ms`,
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
        backgroundSize: '200% 200%',
        animation: 'gradient-flow 3s ease infinite'
      }}
    >
      <div className="bg-white rounded-xl overflow-hidden h-full">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        </div>
        
        <CardContent className="p-6 space-y-4">
          <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground">
            {description}
          </p>
          <Link to="/games">
            <Button 
              variant="ghost" 
              className="group/btn p-0 h-auto font-semibold text-primary hover:text-primary-dark hover:bg-transparent"
            >
              Khám phá
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </CardContent>
      </div>
    </Card>
  );
};
