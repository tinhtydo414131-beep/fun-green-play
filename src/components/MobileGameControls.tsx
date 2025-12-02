import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface MobileGameControlsProps {
  onDirectionPress: (direction: 'up' | 'down' | 'left' | 'right') => void;
  showJumpButton?: boolean;
  onJump?: () => void;
  className?: string;
}

export const MobileGameControls = ({ 
  onDirectionPress, 
  showJumpButton = false,
  onJump,
  className = ""
}: MobileGameControlsProps) => {
  return (
    <div className={`fixed bottom-24 left-0 right-0 flex justify-between px-4 gap-4 z-30 md:hidden ${className}`}>
      {/* Left side - Directional pad */}
      <div className="relative w-32 h-32">
        {/* Up */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary/90 hover:bg-primary text-white shadow-lg rounded-lg active:scale-95 transition-transform"
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionPress('up');
          }}
          onClick={() => onDirectionPress('up')}
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
        
        {/* Down */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary/90 hover:bg-primary text-white shadow-lg rounded-lg active:scale-95 transition-transform"
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionPress('down');
          }}
          onClick={() => onDirectionPress('down')}
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
        
        {/* Left */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/90 hover:bg-primary text-white shadow-lg rounded-lg active:scale-95 transition-transform"
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionPress('left');
          }}
          onClick={() => onDirectionPress('left')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        {/* Right */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/90 hover:bg-primary text-white shadow-lg rounded-lg active:scale-95 transition-transform"
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionPress('right');
          }}
          onClick={() => onDirectionPress('right')}
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
        
        {/* Center indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary/20 rounded-full" />
      </div>

      {/* Right side - Jump button (if needed) */}
      {showJumpButton && onJump && (
        <Button
          variant="secondary"
          size="lg"
          className="w-20 h-20 bg-secondary/90 hover:bg-secondary text-white shadow-lg rounded-full active:scale-95 transition-transform font-fredoka font-bold text-xl"
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          onClick={onJump}
        >
          JUMP
        </Button>
      )}
    </div>
  );
};
