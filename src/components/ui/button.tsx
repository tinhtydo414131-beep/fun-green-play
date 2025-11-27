import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-poppins font-black text-white relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-[18px] bg-[linear-gradient(145deg,#667eea_0%,#764ba2_25%,#00d4ff_50%,#4facfe_75%,#00f2fe_100%)] shadow-[0_15px_35px_rgba(0,212,255,0.5),0_0_0_1px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,212,255,0.3),0_0_50px_rgba(102,126,234,0.4),0_0_80px_rgba(0,212,255,0.3)] border-[3px] border-[rgba(0,212,255,0.8)] [transform:perspective(1000px)_rotateX(10deg)] transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.25,0.8,0.25,1)] hover:[transform:perspective(1000px)_rotateX(0deg)_scale(1.1)] hover:shadow-[0_25px_50px_rgba(0,212,255,0.7),0_0_100px_rgba(102,126,234,0.6),0_0_150px_rgba(0,212,255,0.4)]",
        destructive: "rounded-[18px] bg-[linear-gradient(145deg,#dc2626_0%,#b91c1c_25%,#f43f5e_50%,#fb7185_75%,#fda4af_100%)] shadow-[0_15px_35px_rgba(239,68,68,0.5),0_0_0_1px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(239,68,68,0.3),0_0_50px_rgba(239,68,68,0.4),0_0_80px_rgba(239,68,68,0.3)] border-[3px] border-[rgba(239,68,68,0.8)] [transform:perspective(1000px)_rotateX(10deg)] transition-all duration-[400ms] hover:[transform:perspective(1000px)_rotateX(0deg)_scale(1.1)] hover:shadow-[0_25px_50px_rgba(239,68,68,0.7),0_0_100px_rgba(239,68,68,0.6),0_0_150px_rgba(239,68,68,0.4)]",
        outline: "rounded-[18px] border-[3px] border-[rgba(0,212,255,0.6)] bg-white/10 backdrop-blur-sm text-white shadow-[0_10px_25px_rgba(0,212,255,0.3),0_0_40px_rgba(102,126,234,0.2)] [transform:perspective(1000px)_rotateX(10deg)] transition-all duration-[400ms] hover:[transform:perspective(1000px)_rotateX(0deg)_scale(1.1)] hover:bg-white/20 hover:shadow-[0_20px_40px_rgba(0,212,255,0.5),0_0_80px_rgba(102,126,234,0.4)]",
        secondary: "rounded-[18px] bg-[linear-gradient(145deg,#9333ea_0%,#a855f7_25%,#ec4899_50%,#f472b6_75%,#fbcfe8_100%)] shadow-[0_15px_35px_rgba(168,85,247,0.5),0_0_0_1px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(168,85,247,0.3),0_0_50px_rgba(168,85,247,0.4),0_0_80px_rgba(168,85,247,0.3)] border-[3px] border-[rgba(168,85,247,0.8)] [transform:perspective(1000px)_rotateX(10deg)] transition-all duration-[400ms] hover:[transform:perspective(1000px)_rotateX(0deg)_scale(1.1)] hover:shadow-[0_25px_50px_rgba(168,85,247,0.7),0_0_100px_rgba(168,85,247,0.6),0_0_150px_rgba(168,85,247,0.4)]",
        ghost: "rounded-[18px] hover:bg-white/20 shadow-[0_8px_20px_rgba(0,212,255,0.2)] [transform:perspective(1000px)_rotateX(10deg)] transition-all duration-[400ms] hover:[transform:perspective(1000px)_rotateX(0deg)_scale(1.05)] hover:shadow-[0_15px_30px_rgba(0,212,255,0.4)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[68px] w-[160px] text-lg",
        sm: "h-12 w-[140px] text-base",
        lg: "h-20 w-[180px] text-xl",
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
