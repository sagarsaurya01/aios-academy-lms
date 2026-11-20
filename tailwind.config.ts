import type { Config } from "tailwindcss";

// AI OS brand (from the aikigai.ai brand sheet): navy sidebar, cream canvas,
// electric-blue accent with an orange secondary, Chillax + Satoshi type.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F4EB",        // cream
        surface: "#FFFDFA",   // paper
        sunk: "#efece1",
        ink: "#141A3D",       // navy
        muted: "#6f6a5c",
        line: "#e6e1d2",
        brand: { DEFAULT: "#0F3DFF", dark: "#0b2fd6", soft: "#e2e6ff" }, // blue
        orange: { DEFAULT: "#FF8A22", soft: "#ffe8d4" },
        purple: "#7655E8",
        sidebar: { DEFAULT: "#0e1430", bar: "#141A3D", hover: "#20264d", text: "#9aa0c4" },
        good: "#1f9d63",
        warn: "#FF8A22",
        bad: "#e0493c",
      },
      fontFamily: {
        sans: ['"Satoshi"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ['"Chillax"', '"Satoshi"', "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "0.85rem" },
    },
  },
  plugins: [],
};
export default config;
