/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050506",
        surface: "#0F0F12",
        surfaceElevated: "#16161B",
        accent: "#F7C948",
        accentMuted: "#E5AA17",
        accentSoft: "#fce7ad",
        foreground: "#EDEDED",
        muted: "#8A8A92",
        danger: "#F87171",
        success: "#34D399",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(247, 201, 72, 0.35)",
      },
    },
  },
  plugins: [],
};
