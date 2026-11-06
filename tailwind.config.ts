import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7C2D8A",
          "purple-dark": "#581C87",
          "purple-light": "#F3E8FF",
          orange: "#FF6B00",
          "orange-dark": "#EA580C",
          "orange-light": "#FFEDD5",
        },
      },
    },
  },
  plugins: [],
};
export default config;
