import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0F6E56",
          light: "#E1F5EE",
          dark: "#085041",
        },
        danger: {
          DEFAULT: "#A32D2D",
          light: "#FCEBEB",
        },
        warning: {
          DEFAULT: "#854F0B",
          light: "#FAEEDA",
        },
        success: {
          DEFAULT: "#3B6D11",
          light: "#EAF3DE",
        },
      },
    },
  },
  plugins: [],
};
export default config;

