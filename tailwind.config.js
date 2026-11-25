/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: { 50: "#FBF6EA", 100: "#F4E9CC", 200: "#E8D39C", 300: "#DBBD72", 400: "#CFAA5C", 500: "#C29A4A", 600: "#A47F37", 700: "#7F612A", 800: "#5A451F", 900: "#3A2D16" },
        night: { 900: "#07060A", 800: "#0D0C0F", 700: "#141317", 600: "#1C1A20", 500: "#26232B" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Inter Tight'", "Inter", "sans-serif"],
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
