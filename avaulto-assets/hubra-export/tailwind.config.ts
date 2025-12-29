import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hubra brand colors matching hubra-app
        primary: {
          DEFAULT: "#FEAA01",
          25: "#FCFBF6",
          50: "#FFFFE7",
          100: "#FEFFC1",
          200: "#FEDF89",
          300: "#FEC84B",
          400: "#FDB122",
          500: "#FEAA01",
          600: "#DB6904",
          700: "#B64707",
          800: "#94370C",
          900: "#792E0E",
          950: "#461502",
        },
        gray: {
          1000: "#0D0E21",
          950: "#191A2C",
          900: "#262738",
          850: "#31324A",
          800: "#3D3E4D",
          700: "#565764",
          600: "#6E6E7A",
          500: "#868790",
          400: "#6E6E7A",
          300: "#B7B7BD",
          200: "#CFCFD3",
          100: "#E7E7E9",
          50: "#F3F3F4",
          30: "rgba(255, 255, 255, 0.03)",
        },
        error: {
          DEFAULT: "#C8345A",
          500: "#F63D68",
          600: "#C8345A",
        },
      },
      backgroundColor: {
        background: "#0D0E21",
        card: "#1B1C2E",
      },
      textColor: {
        foreground: "#FFFFFF",
      },
    },
  },
} satisfies Config;

