import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
        game: {
          primary: "hsl(var(--game-primary))",
          "primary-dark": "hsl(var(--game-primary-dark))",
          gold: "hsl(var(--game-gold))",
          "gold-dark": "hsl(var(--game-gold-dark))",
          silver: "hsl(var(--game-silver))",
          red: "hsl(var(--game-red))",
          green: "hsl(var(--game-green))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
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
        "flip": {
          "0%": { 
            transform: "rotateY(0deg)",
            "background-color": "hsl(var(--game-primary))"
          },
          "50%": { 
            transform: "rotateY(90deg)",
            "background-color": "hsl(var(--game-primary))"
          },
          "100%": { 
            transform: "rotateY(0deg)",
            "background-color": "hsl(var(--game-gold))"
          },
        },
        "bounce-in": {
          "0%": { 
            transform: "scale(0.3) rotate(-5deg)",
            opacity: "0"
          },
          "50%": { 
            transform: "scale(1.1) rotate(2deg)",
            opacity: "1"
          },
          "100%": { 
            transform: "scale(1) rotate(0deg)",
            opacity: "1"
          },
        },
        "glow": {
          "0%, 100%": { 
            "box-shadow": "0 0 20px hsl(var(--game-gold), 0.5)"
          },
          "50%": { 
            "box-shadow": "0 0 40px hsl(var(--game-gold), 0.8)"
          },
        },
        "strike": {
          "0%": { 
            transform: "scale(1) rotate(0deg)",
            "background-color": "hsl(var(--game-red))"
          },
          "25%": { 
            transform: "scale(1.1) rotate(-2deg)"
          },
          "75%": { 
            transform: "scale(1.1) rotate(2deg)"
          },
          "100%": { 
            transform: "scale(1) rotate(0deg)",
            "background-color": "hsl(var(--game-red))"
          },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flip": "flip 0.8s ease-in-out",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "glow": "glow 2s ease-in-out infinite",
        "strike": "strike 0.6s ease-in-out",
      },
      backgroundImage: {
        "gradient-game": "var(--gradient-game)",
        "gradient-gold": "var(--gradient-gold)",
        "gradient-card": "var(--gradient-card)",
      },
      boxShadow: {
        "glow": "var(--shadow-glow)",
        "gold": "var(--shadow-gold)",
        "card": "var(--shadow-card)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
