import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { haptics } from "@/utils/haptics";

const diamondButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-fredoka font-bold text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "diamond-btn-gradient",
        outline: "diamond-btn-outline",
        ghost: "diamond-btn-ghost",
      },
      size: {
        default: "h-12 px-6 py-3 text-base rounded-xl",
        sm: "h-10 px-4 py-2 text-sm rounded-lg",
        lg: "h-14 px-8 py-4 text-lg rounded-2xl",
        xl: "h-16 px-10 py-5 text-xl rounded-2xl",
        icon: "h-12 w-12 rounded-xl",
        fab: "h-14 w-14 rounded-full shadow-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Audio context for bling sound
let audioContext: AudioContext | null = null;

const playBlingSound = () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 528Hz - frequency of love/healing
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Quick attack, short decay
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Add harmonics for sparkle effect
    const harmonic = audioContext.createOscillator();
    const harmonicGain = audioContext.createGain();
    harmonic.connect(harmonicGain);
    harmonicGain.connect(audioContext.destination);
    harmonic.frequency.setValueAtTime(1056, audioContext.currentTime);
    harmonic.type = 'sine';
    harmonicGain.gain.setValueAtTime(0, audioContext.currentTime);
    harmonicGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    harmonic.start(audioContext.currentTime);
    harmonic.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    // Audio not supported
  }
};

const triggerDiamondConfetti = (x: number, y: number) => {
  // Diamond colors
  const colors = ['#ff6b9d', '#c44dff', '#6b5bff', '#00d4ff', '#00ffcc', '#ffd93d', '#ff6b6b'];
  
  // Create diamond-shaped confetti burst
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: colors,
    shapes: ['circle', 'square'],
    scalar: 0.8,
    gravity: 0.8,
    drift: 0,
    ticks: 100,
  });
  
  // Secondary sparkle burst
  setTimeout(() => {
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ['#ffffff', '#ffd93d', '#00ffcc'],
      shapes: ['circle'],
      scalar: 0.5,
      gravity: 0.6,
      ticks: 60,
    });
  }, 50);
};

export interface DiamondButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof diamondButtonVariants> {
  asChild?: boolean;
  enableConfetti?: boolean;
  enableSound?: boolean;
  enableHaptic?: boolean;
}

const DiamondButton = React.forwardRef<HTMLButtonElement, DiamondButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    enableConfetti = true,
    enableSound = true,
    enableHaptic = true,
    onClick,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      if (enableConfetti) {
        triggerDiamondConfetti(x, y);
      }
      
      if (enableSound) {
        playBlingSound();
      }
      
      if (enableHaptic) {
        haptics.medium();
      }
      
      onClick?.(e);
    };
    
    return (
      <Comp
        className={cn(diamondButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {/* Diamond shimmer overlay */}
        <span className="absolute inset-0 diamond-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Sparkle particles */}
        <span className="absolute inset-0 pointer-events-none">
          <span className="diamond-sparkle diamond-sparkle-1" />
          <span className="diamond-sparkle diamond-sparkle-2" />
          <span className="diamond-sparkle diamond-sparkle-3" />
          <span className="diamond-sparkle diamond-sparkle-4" />
        </span>
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        
        {/* Glow effect */}
        <span className="absolute inset-0 rounded-inherit diamond-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Comp>
    );
  }
);
DiamondButton.displayName = "DiamondButton";

export { DiamondButton, diamondButtonVariants };
