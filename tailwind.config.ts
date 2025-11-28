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
        'poppins': ['Poppins', 'sans-serif'],
        'quicksand': ['Quicksand', 'sans-serif'],
        'pacifico': ['Pacifico', 'cursive'],
        'righteous': ['Righteous', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'fredoka': ['Fredoka', 'sans-serif'],
        'comic': ['Comic Neue', 'cursive'],
        'sans': ['Poppins', 'Quicksand', 'sans-serif'],
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
        golden: {
          50: "hsl(45, 100%, 98%)",
          100: "hsl(45, 100%, 95%)",
          200: "hsl(45, 100%, 85%)",
          300: "hsl(45, 100%, 75%)",
          400: "hsl(45, 100%, 65%)",
          500: "hsl(45, 100%, 51%)",
          600: "hsl(38, 100%, 55%)",
          700: "hsl(38, 100%, 45%)",
          800: "hsl(30, 100%, 40%)",
          900: "hsl(30, 100%, 30%)",
        },
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
        "diamond-light": {
          "0%": {
            backgroundPosition: "0% 50%",
            filter: "hue-rotate(0deg) brightness(1)",
          },
          "25%": {
            backgroundPosition: "50% 0%",
            filter: "hue-rotate(90deg) brightness(1.2)",
          },
          "50%": {
            backgroundPosition: "100% 50%",
            filter: "hue-rotate(180deg) brightness(1.3)",
          },
          "75%": {
            backgroundPosition: "50% 100%",
            filter: "hue-rotate(270deg) brightness(1.2)",
          },
          "100%": {
            backgroundPosition: "0% 50%",
            filter: "hue-rotate(360deg) brightness(1)",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        "holographic-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
            filter: "hue-rotate(0deg)",
          },
          "33%": {
            backgroundPosition: "50% 100%",
            filter: "hue-rotate(120deg)",
          },
          "66%": {
            backgroundPosition: "100% 50%",
            filter: "hue-rotate(240deg)",
          },
        },
        "particle-float": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
            opacity: "0.6",
          },
          "50%": {
            transform: "translate(20px, -30px) scale(1.2)",
            opacity: "1",
          },
        },
        "depth-pulse": {
          "0%, 100%": {
            boxShadow: "0 4px 6px hsla(38, 80%, 10%, 0.1), 0 4px 16px hsla(45, 100%, 51%, 0.25)",
            transform: "translateZ(0)",
          },
          "50%": {
            boxShadow: "0 20px 25px hsla(38, 80%, 10%, 0.15), 0 8px 32px hsla(45, 100%, 51%, 0.3)",
            transform: "translateZ(10px)",
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
        "golden-shimmer": "golden-shimmer 12s ease-in-out infinite",
        "diamond-light": "diamond-light 15s ease-in-out infinite",
        "gradient-shift": "gradient-shift 4s ease-in-out infinite",
        "holographic-shift": "holographic-shift 6s ease-in-out infinite",
        "particle-float": "particle-float 6s ease-in-out infinite",
        "depth-pulse": "depth-pulse 3s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-golden": "linear-gradient(135deg, hsl(45, 100%, 51%) 0%, hsl(38, 100%, 55%) 50%, hsl(30, 100%, 55%) 100%)",
        "gradient-sunrise": "linear-gradient(180deg, hsl(45, 100%, 65%) 0%, hsl(30, 100%, 60%) 50%, hsl(345, 75%, 65%) 100%)",
        "gradient-celebration": "linear-gradient(135deg, hsl(45, 100%, 60%) 0%, hsl(280, 100%, 70%) 50%, hsl(190, 100%, 60%) 100%)",
        "gradient-holographic": "linear-gradient(135deg, hsl(45, 100%, 70%), hsl(280, 100%, 75%), hsl(190, 100%, 70%), hsl(345, 75%, 70%))",
        "gradient-depth": "linear-gradient(160deg, hsl(45, 100%, 95%) 0%, hsl(45, 100%, 75%) 50%, hsl(38, 100%, 55%) 100%)",
      },
      boxShadow: {
        "glow-sm": "0 2px 8px hsla(45, 100%, 51%, 0.2)",
        "glow-md": "0 4px 16px hsla(45, 100%, 51%, 0.25), 0 2px 8px hsla(45, 100%, 51%, 0.15)",
        "glow-lg": "0 8px 32px hsla(45, 100%, 51%, 0.3), 0 4px 16px hsla(45, 100%, 51%, 0.2)",
        "glow-xl": "0 16px 48px hsla(45, 100%, 51%, 0.35), 0 8px 24px hsla(45, 100%, 51%, 0.25)",
        "depth-1": "0 1px 3px hsla(38, 80%, 10%, 0.12), 0 1px 2px hsla(38, 80%, 10%, 0.08)",
        "depth-2": "0 4px 6px hsla(38, 80%, 10%, 0.1), 0 2px 4px hsla(38, 80%, 10%, 0.06)",
        "depth-3": "0 10px 15px hsla(38, 80%, 10%, 0.12), 0 4px 6px hsla(38, 80%, 10%, 0.08)",
        "depth-4": "0 20px 25px hsla(38, 80%, 10%, 0.15), 0 10px 10px hsla(38, 80%, 10%, 0.1)",
        "depth-5": "0 25px 50px hsla(38, 80%, 10%, 0.2), 0 15px 20px hsla(38, 80%, 10%, 0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
