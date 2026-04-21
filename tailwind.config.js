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
      },
    },
  },
  theme: {
  extend: {
    colors: {
      primary: "#FFCD00",     // amarillo
      secondary: "#1C355E",   // azul
      grayBrand: "#98989A",   // gris
    },
  },
},

  plugins: [],
};