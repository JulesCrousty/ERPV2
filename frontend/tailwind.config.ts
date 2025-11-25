import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F7FA",
        sidebar: "#2F3A4A",
        accent: "#4A6572",
        primary: "#4C8BF5",
        text: "#1E293B"
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.06)"
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans]
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
