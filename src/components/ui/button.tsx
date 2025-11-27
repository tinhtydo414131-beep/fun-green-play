import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-poppins font-black text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-2xl bg-gradient-to-br from-[#6B46C1] via-[#9F7AEA] via-[#00D4FF] via-[#4FD1C7] via-[#3B82F6] to-[#00D4FF] shadow-[0_12px_40px_rgba(0,212,255,0.4),0_0_60px_rgba(107,70,193,0.3),inset_0_4px_12px_rgba(255,255,255,0.3)] border-[3px] border-[rgba(0,212,255,0.8)] text-shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:scale-[1.08] hover:shadow-[0_20px_60px_rgba(0,212,255,0.6),0_0_80px_rgba(107,70,193,0.5),0_0_40px_rgba(255,255,255,0.8)]",
        destructive: "rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-pink-500 shadow-[0_12px_40px_rgba(239,68,68,0.4),0_0_60px_rgba(239,68,68,0.3),inset_0_4px_12px_rgba(255,255,255,0.3)] border-[3px] border-red-400/80 hover:scale-[1.08]",
        outline: "rounded-2xl border-[3px] border-[rgba(0,212,255,0.6)] bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:scale-[1.05]",
        secondary: "rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 shadow-[0_12px_40px_rgba(168,85,247,0.4),0_0_60px_rgba(168,85,247,0.3),inset_0_4px_12px_rgba(255,255,255,0.3)] border-[3px] border-purple-400/80 hover:scale-[1.08]",
        ghost: "rounded-2xl hover:bg-white/20 hover:scale-[1.05]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[68px] px-8 text-lg",
        sm: "h-12 px-6 text-base",
        lg: "h-20 px-12 text-xl",
        icon: "h-[68px] w-[68px]",
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
