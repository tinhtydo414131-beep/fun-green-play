import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        fredoka: ["Fredoka", "sans-serif"],
        comic: ["Comic Neue", "cursive"],
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          glow: "hsl(var(--primary-glow))",
        },
        magic: {
          purple: "#8B46FF",
          cyan: "#00F2FF",
          gold: "#FFD700",
          pink: "#FF6B9D",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "hsl(var(--success))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-up": {
          from: {
            opacity: "0",
            transform: "translateY(40px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.9)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--glow) / 0.4)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--glow) / 0.6)",
          },
        },
        "breathing": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
            filter: "brightness(1) saturate(1)",
          },
          "50%": {
            backgroundPosition: "100% 50%",
            filter: "brightness(1.1) saturate(1.2)",
          },
        },
        "aurora": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
            opacity: "0.8",
          },
          "50%": {
            backgroundPosition: "100% 50%",
            opacity: "1",
          },
        },
        "float-up": {
          "0%": {
            transform: "translateY(100vh) scale(0)",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
          },
          "90%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-100vh) scale(1)",
            opacity: "0",
          },
        },
        "sparkle": {
          "0%, 100%": {
            opacity: "0",
            transform: "scale(0) rotate(0deg)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1) rotate(180deg)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(280 100% 60% / 0.6), 0 0 40px hsl(190 100% 60% / 0.4), inset 0 0 20px hsl(280 100% 70% / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(280 100% 60% / 0.8), 0 0 80px hsl(190 100% 60% / 0.6), inset 0 0 30px hsl(280 100% 70% / 0.3)",
          },
        },
        "neon-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 10px hsl(280 100% 60% / 0.8), 0 0 20px hsl(190 100% 60% / 0.6)",
            borderColor: "hsl(280 100% 60%)",
          },
          "50%": {
            boxShadow: "0 0 20px hsl(280 100% 60% / 1), 0 0 40px hsl(190 100% 60% / 0.8)",
            borderColor: "hsl(190 100% 60%)",
          },
        },
        "golden-shimmer": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.8s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "glow": "glow 2s ease-in-out infinite",
        "breathing": "breathing 6s ease-in-out infinite",
        "aurora": "aurora 8s ease-in-out infinite",
        "float-up": "float-up 15s linear infinite",
        "sparkle": "sparkle 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "golden-shimmer": "golden-shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
