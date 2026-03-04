import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7c3aed",
          "purple-light": "#a78bfa",
          cyan: "#06b6d4",
          "cyan-light": "#67e8f9",
          gold: "#f59e0b",
          "gold-light": "#fcd34d",
        },
        dark: {
          900: "#02020d",
          800: "#060612",
          700: "#0a0a1a",
          600: "#0f0f24",
          500: "#16163a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Orbitron", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient":
          "linear-gradient(135deg, #02020d 0%, #0a0a1a 50%, #060612 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.05) 100%)",
        "purple-cyan":
          "linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #06b6d4 100%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "spin-slow": "spin 20s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(124,58,237,0.7), 0 0 80px rgba(124,58,237,0.3)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      boxShadow: {
        "neon-purple": "0 0 20px rgba(124,58,237,0.5), 0 0 40px rgba(124,58,237,0.2)",
        "neon-cyan": "0 0 20px rgba(6,182,212,0.5), 0 0 40px rgba(6,182,212,0.2)",
        "neon-gold": "0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(245,158,11,0.2)",
        "card": "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover": "0 8px 40px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
