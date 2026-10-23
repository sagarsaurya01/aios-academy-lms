import type { Config } from "tailwindcss";

// Edmingle-style identity (our own hues): dark navy sidebar + top bar,
// indigo/purple accent, cool light content, white cards.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f5f6fb",
        surface: "#ffffff",
        sunk: "#eef0f8",
        ink: "#1c1f3b",
        muted: "#6b6f8d",
        line: "#e6e7f2",
        brand: { DEFAULT: "#6354e0", dark: "#4f42c7", soft: "#ece9fd" }, // indigo/purple
        sidebar: { DEFAULT: "#17183a", bar: "#1f2150", hover: "#2a2c5e", text: "#a7a9d0" },
        good: "#1d9d5c",
        warn: "#9a6a00",
        bad: "#c23a57",
      },
      borderRadius: { xl: "0.85rem" },
    },
  },
  plugins: [],
};
export default config;
