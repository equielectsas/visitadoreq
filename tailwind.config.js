/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 AGREGA ESTO

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
        primary: "#FFCD00",
        secondary: "#1C355E",
        grayBrand: "#98989A",
        /** Superficies modo oscuro (opcional en JSX) */
        eqDark: {
          page: "#070b14",
          surface: "#152238",
          surface2: "#1a2d44",
          border: "rgba(255, 205, 0, 0.14)",
          borderMuted: "rgba(124, 154, 188, 0.22)",
        },
      },
    },
  },

  plugins: [],
};