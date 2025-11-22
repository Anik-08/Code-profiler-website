import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#050816",
          soft: "#0b1120",
          card: "#111827",
          sidebar: "#0d1625",
        },
        accent: {
          DEFAULT: "#7c3aed",   // primary purple
          soft: "#4c1d95",
        },
        outline: "#1f2933",
        success: "#22c55e",
        warn: "#eab308",
        danger: "#ef4444",
      },
      boxShadow: {
        "soft-card": "0 18px 45px rgba(15, 23, 42, 0.9)",
        glass: "0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px -2px rgba(0,0,0,0.6), 0 12px 48px -4px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;