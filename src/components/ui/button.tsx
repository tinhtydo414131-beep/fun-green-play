import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ButtonParticles } from "./button-particles";
import { ButtonFacets } from "./button-facets";
import { ButtonLightRays } from "./button-light-rays";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden before:absolute before:inset-[-4px] before:rounded-2xl before:bg-gradient-to-r before:from-cyan-400/25 before:via-purple-400/30 before:to-cyan-400/25 before:blur-xl before:opacity-70 before:-z-10 shadow-[0_8px_32px_rgba(224,212,255,0.4),0_2px_8px_rgba(255,255,255,0.15),0_0_60px_rgba(224,212,255,0.25)] hover:shadow-[0_12px_48px_rgba(224,212,255,0.55),0_4px_16px_rgba(255,255,255,0.25),0_0_80px_rgba(224,212,255,0.35)] active:shadow-[0_4px_16px_rgba(224,212,255,0.35),0_1px_4px_rgba(255,255,255,0.2),0_0_40px_rgba(224,212,255,0.2)]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-[hsl(280,90%,65%)] via-[hsl(190,100%,60%)] to-[hsl(280,85%,55%)] text-[#FFFFFF] [text-shadow:0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(224,212,255,0.5),0_0_45px_rgba(180,255,255,0.3)] shadow-[0_0_30px_rgba(224,212,255,0.6),0_0_50px_rgba(224,212,255,0.4),0_4px_12px_hsla(280,90%,65%,0.35),0_0_80px_rgba(180,255,255,0.2),inset_0_1px_4px_rgba(255,255,255,0.7),inset_0_-2px_8px_rgba(100,50,255,0.3)] hover:shadow-[0_0_45px_rgba(255,255,255,0.7),0_0_80px_rgba(224,212,255,0.6),0_6px_20px_hsla(280,90%,65%,0.45),0_0_100px_rgba(180,255,255,0.35),inset_0_2px_6px_rgba(255,255,255,0.8)] hover:[text-shadow:0_0_20px_rgba(255,255,255,0.9),0_0_40px_rgba(224,212,255,0.7),0_0_60px_rgba(180,255,255,0.4)] hover:brightness-115 hover:scale-[1.02] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,255,255,0.3),rgba(180,130,255,0.35)_60deg,rgba(255,100,255,0.3)_120deg,rgba(0,255,255,0.35)_180deg,rgba(180,130,255,0.3)_240deg,rgba(255,100,255,0.25)_300deg,rgba(0,255,255,0.3))] after:opacity-50 hover:after:opacity-70 after:transition-opacity after:duration-300",
        destructive: "bg-gradient-to-br from-destructive via-red-500 to-destructive text-[#FFFFFF] [text-shadow:0_0_10px_rgba(255,255,255,0.5),0_0_20px_rgba(224,212,255,0.3)] shadow-[0_0_20px_rgba(224,212,255,0.4),0_2px_8px_hsla(0,84%,60%,0.25),inset_0_1px_3px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5),0_4px_16px_hsla(0,84%,60%,0.35),inset_0_2px_4px_rgba(255,255,255,0.5)] hover:[text-shadow:0_0_15px_rgba(255,255,255,0.7),0_0_30px_rgba(224,212,255,0.5)] hover:brightness-125 hover:animate-[golden-shimmer_12s_ease-in-out_infinite,diamond-light_15s_ease-in-out_infinite] bg-[length:200%_200%] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-[8000ms] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(255,255,255,0.3),transparent_120deg,rgba(255,255,255,0.4),transparent_240deg,rgba(255,255,255,0.3),transparent)] after:opacity-0 hover:after:opacity-50 hover:after:animate-[spin_20s_linear_infinite] after:transition-opacity after:duration-500",
        outline: "border-4 border-[hsl(270,80%,60%)] bg-gradient-to-br from-[hsl(270,85%,75%)] via-[hsl(280,80%,70%)] to-[hsl(270,85%,75%)] text-[hsl(270,95%,25%)] shadow-[0_0_35px_rgba(224,212,255,0.7),0_8px_32px_rgba(224,212,255,0.45),0_4px_12px_hsla(270,80%,60%,0.35),0_6px_18px_hsla(180,85%,50%,0.3),0_0_60px_rgba(255,255,255,0.2),inset_0_1px_4px_rgba(255,255,255,0.75),inset_0_-1px_6px_rgba(180,130,255,0.3)] hover:border-[hsl(180,85%,50%)] hover:shadow-[0_0_55px_rgba(255,255,255,0.8),0_12px_48px_rgba(224,212,255,0.6),0_8px_24px_hsla(270,80%,60%,0.5),0_10px_30px_hsla(180,85%,50%,0.45),0_0_90px_rgba(180,255,255,0.35),inset_0_2px_5px_rgba(255,255,255,0.85)] hover:brightness-115 hover:scale-[1.02] active:shadow-[0_0_25px_rgba(224,212,255,0.6),0_4px_16px_rgba(224,212,255,0.35),0_2px_8px_hsla(270,80%,60%,0.3),0_0_40px_rgba(255,255,255,0.15),inset_0_1px_3px_rgba(255,255,255,0.65)] active:scale-[0.98] bg-[length:200%_200%] before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_30%,rgba(180,255,255,0.4)_50%,transparent_70%)] before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-[1200ms] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(180,255,255,0.35)_60deg,rgba(255,255,255,0.3)_120deg,transparent_180deg)] after:opacity-0 hover:after:opacity-60 hover:after:animate-[spin_15s_linear_infinite] after:transition-opacity after:duration-300",
        secondary: "bg-gradient-to-br from-[hsl(190,100%,60%)] via-[hsl(280,85%,60%)] to-[hsl(190,95%,55%)] text-[#FFFFFF] [text-shadow:0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(224,212,255,0.5),0_0_45px_rgba(0,255,255,0.3)] shadow-[0_0_30px_rgba(224,212,255,0.6),0_0_50px_rgba(224,212,255,0.4),0_4px_12px_hsla(190,100%,60%,0.35),0_0_80px_rgba(0,255,255,0.25),inset_0_1px_4px_rgba(0,255,255,0.7),inset_0_-2px_8px_rgba(180,100,255,0.3)] hover:shadow-[0_0_45px_rgba(255,255,255,0.7),0_0_80px_rgba(224,212,255,0.6),0_6px_20px_hsla(190,100%,60%,0.45),0_0_100px_rgba(0,255,255,0.4),inset_0_2px_6px_rgba(0,255,255,0.8)] hover:[text-shadow:0_0_20px_rgba(255,255,255,0.9),0_0_40px_rgba(224,212,255,0.7),0_0_60px_rgba(0,255,255,0.45)] hover:brightness-115 hover:scale-[1.02] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,rgba(180,130,255,0.3),rgba(0,255,255,0.35)_60deg,rgba(255,100,255,0.3)_120deg,rgba(180,130,255,0.35)_180deg,rgba(0,255,255,0.3)_240deg,rgba(255,100,255,0.25)_300deg,rgba(180,130,255,0.3))] after:opacity-50 hover:after:opacity-70 after:transition-opacity after:duration-300",
        ghost: "text-[#FFFFFF] hover:bg-gradient-to-br hover:from-[hsl(270,80%,60%)]/30 hover:via-[hsl(280,90%,55%)]/40 hover:to-[hsl(180,85%,50%)]/30 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.6),0_0_24px_rgba(224,212,255,0.3)] hover:shadow-[0_0_25px_rgba(224,212,255,0.5),0_0_40px_rgba(180,255,255,0.25),inset_0_1px_4px_rgba(180,255,255,0.35)] bg-[length:200%_200%] before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_30%,rgba(180,255,255,0.25)_50%,transparent_70%)] before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-[1200ms] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(180,255,255,0.25)_120deg,transparent_240deg)] after:opacity-0 hover:after:opacity-45 hover:after:animate-[spin_15s_linear_infinite] after:transition-opacity after:duration-300",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <ButtonFacets />
        <ButtonLightRays isHovered={isHovered} />
        <ButtonParticles isHovered={isHovered} />
        <span className="relative z-10">{props.children}</span>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
