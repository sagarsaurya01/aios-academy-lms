import type { Config } from "tailwindcss";

// Tokens from the aios-lms palette (teal), our own brand — not Edmingle's.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f5f7f6",
        surface: "#ffffff",
        sunk: "#eef2f1",
        ink: "#13201d",
        muted: "#59665f",
        line: "#dae2df",
        brand: { DEFAULT: "#0d6b62", dark: "#0a564f", soft: "#dfeeeb" },
        good: "#1d7438",
        warn: "#865800",
        bad: "#a12d44",
      },
      borderRadius: { xl: "0.85rem" },
    },
  },
  plugins: [],
};
export default config;
