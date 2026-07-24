/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10141B",
        surface: "#1A2129",
        surface2: "#212A34",
        line: "#2B3542",
        mist: "#ECEFF4",
        slate: "#94A0B2",
        ember: {
          DEFAULT: "#E8873A",
          dark: "#C96A28",
          light: "#F4A868",
        },
        teal: {
          DEFAULT: "#45D6C6",
          dark: "#2AA99B",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "ember-glow": "radial-gradient(circle at 30% 20%, rgba(232,135,58,0.18), transparent 60%)",
      },
      boxShadow: {
        ember: "0 0 0 1px rgba(232,135,58,0.25), 0 8px 24px -8px rgba(232,135,58,0.35)",
      },
      keyframes: {
        spark: {
          "0%": { left: "0%" },
          "100%": { left: "100%" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 0.4, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.3)" },
        },
      },
      animation: {
        spark: "spark 3.2s linear infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
