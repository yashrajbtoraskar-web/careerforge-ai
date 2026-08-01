/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F8F6F2",
        surface: "#FFFFFF",
        surface2: "#F1EEE7",
        line: "#E4DFD5",
        mist: "#1C1B1F",
        slate: "#6B6A72",
        ember: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          light: "#6366F1",
        },
        teal: {
          DEFAULT: "#059669",
          dark: "#047857",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "ember-glow": "radial-gradient(circle at 30% 20%, rgba(79,70,229,0.10), transparent 60%)",
      },
      boxShadow: {
        ember: "0 0 0 1px rgba(79,70,229,0.25), 0 8px 24px -8px rgba(79,70,229,0.35)",
        card: "0 1px 2px rgba(28,27,31,0.04), 0 1px 3px rgba(28,27,31,0.06)",
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
