import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 will-change-[box-shadow]",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--button-base))] text-white border border-primary hover:bg-[hsl(var(--button-hover))] hover:shadow-[0_0_10px_hsla(51,100%,50%,0.6),0_0_20px_hsla(33,100%,50%,0.4),0_0_30px_hsla(51,100%,50%,0.2)] hover:text-[hsl(var(--button-active))] active:bg-[hsl(var(--button-active))] active:scale-[0.98] hover:animate-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-secondary bg-card/50 text-foreground hover:bg-card hover:border-primary hover:shadow-[var(--shadow-inner-glow)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[var(--shadow-glow)]",
        ghost: "hover:bg-muted hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-light",
        luxury: "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:scale-105 border-2 border-primary-light",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4",
        lg: "h-14 rounded-xl px-10 text-base",
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
