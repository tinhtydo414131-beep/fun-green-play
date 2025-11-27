import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary via-secondary to-primary text-primary-foreground shadow-[0_4px_12px_hsla(262,100%,64%,0.4),0_8px_24px_hsla(186,100%,50%,0.3),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-3px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_hsla(262,100%,64%,0.6),0_12px_36px_hsla(186,100%,50%,0.5),inset_0_2px_6px_rgba(255,255,255,0.6)] hover:brightness-125 hover:animate-[golden-shimmer_12s_ease-in-out_infinite,diamond-light_15s_ease-in-out_infinite] bg-[length:200%_200%] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-[8000ms] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(255,255,255,0.3),transparent_120deg,rgba(255,255,255,0.4),transparent_240deg,rgba(255,255,255,0.3),transparent)] after:opacity-0 hover:after:opacity-50 hover:after:animate-[spin_20s_linear_infinite] after:transition-opacity after:duration-500",
        destructive: "bg-gradient-to-br from-destructive via-red-500 to-destructive text-destructive-foreground shadow-[0_4px_12px_hsla(0,84%,60%,0.4),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-3px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_hsla(0,84%,60%,0.6),inset_0_2px_6px_rgba(255,255,255,0.6)] hover:brightness-125 hover:animate-[golden-shimmer_12s_ease-in-out_infinite,diamond-light_15s_ease-in-out_infinite] bg-[length:200%_200%] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-[8000ms] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(255,255,255,0.3),transparent_120deg,rgba(255,255,255,0.4),transparent_240deg,rgba(255,255,255,0.3),transparent)] after:opacity-0 hover:after:opacity-50 hover:after:animate-[spin_20s_linear_infinite] after:transition-opacity after:duration-500",
        outline: "border-4 border-primary-light bg-gradient-to-br from-card via-muted/30 to-card text-foreground shadow-[0_2px_8px_hsla(262,100%,64%,0.2),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_8px_rgba(0,0,0,0.15)] hover:border-primary hover:shadow-[0_6px_16px_hsla(262,100%,64%,0.4),inset_0_2px_6px_rgba(255,255,255,0.7)] hover:brightness-110 hover:animate-[golden-shimmer_12s_ease-in-out_infinite,diamond-light_15s_ease-in-out_infinite] bg-[length:200%_200%] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-[8000ms] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(255,255,255,0.2),transparent_120deg,rgba(255,255,255,0.3),transparent_240deg,rgba(255,255,255,0.2),transparent)] after:opacity-0 hover:after:opacity-40 hover:after:animate-[spin_20s_linear_infinite] after:transition-opacity after:duration-500",
        secondary: "bg-gradient-to-br from-secondary via-accent to-secondary text-secondary-foreground shadow-[0_4px_12px_hsla(186,100%,50%,0.4),0_8px_24px_hsla(262,100%,64%,0.3),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-3px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_hsla(186,100%,50%,0.6),0_12px_36px_hsla(262,100%,64%,0.5),inset_0_2px_6px_rgba(255,255,255,0.6)] hover:brightness-125 hover:animate-[golden-shimmer_12s_ease-in-out_infinite,diamond-light_15s_ease-in-out_infinite] bg-[length:200%_200%] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-[8000ms] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(255,255,255,0.3),transparent_120deg,rgba(255,255,255,0.4),transparent_240deg,rgba(255,255,255,0.3),transparent)] after:opacity-0 hover:after:opacity-50 hover:after:animate-[spin_20s_linear_infinite] after:transition-opacity after:duration-500",
        ghost: "hover:bg-gradient-to-br hover:from-muted/80 hover:via-muted hover:to-muted/60 hover:text-foreground hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] hover:animate-diamond-light bg-[length:200%_200%] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-[8000ms] after:absolute after:inset-0 after:bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(255,255,255,0.15),transparent_120deg,rgba(255,255,255,0.2),transparent_240deg,rgba(255,255,255,0.15),transparent)] after:opacity-0 hover:after:opacity-30 hover:after:animate-[spin_20s_linear_infinite] after:transition-opacity after:duration-500",
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
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
