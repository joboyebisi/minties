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
        background: "var(--background)",
        foreground: "var(--foreground)",
        mint: {
          50: "#eafff7",
          100: "#c5ffe9",
          200: "#8cffd4",
          300: "#4af7b6",
          400: "#30f0a8",
          500: "#16d38f",
          600: "#0fa676",
          700: "#0c8460",
          800: "#0a684e",
          900: "#0a5641",
        },
        ink: {
          900: "#020303",
          800: "#050909",
          700: "#0b1112",
        },
        grayz: {
          100: "#f5f7f6",
          200: "#dbe3df",
          300: "#b5c2ba",
          400: "#8da196",
          500: "#6f857a",
          600: "#56695f",
          700: "#43524c",
          800: "#33403b",
          900: "#283430",
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(48, 240, 168, 0.25)",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;

