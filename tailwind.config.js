/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F6F7F9",
        surface: "#FFFFFF",
        surface2: "#F1F4F8",
        line: "#E1E5EB",
        mist: "#111827",
        slate: "#64748B",
        ember: {
          DEFAULT: "#2952E3",
          dark: "#1E3FB8",
          light: "#4E70EE",
        },
        teal: {
          DEFAULT: "#0D9488",
          dark: "#0B7A70",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "ember-glow": "radial-gradient(circle at 30% 20%, rgba(41,82,227,0.10), transparent 60%)",
      },
      boxShadow: {
        ember: "0 0 0 1px rgba(41,82,227,0.25), 0 8px 24px -8px rgba(41,82,227,0.35)",
        card: "0 1px 2px rgba(17,24,39,0.04), 0 1px 3px rgba(17,24,39,0.06)",
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
