/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002854",
        secondary: "#ffffff",
        text: "#D0D0CE",

        danger:{
          DEFAULT: "#FCEECC",
          border: "#F2A900",
        },

        info:{
          DEFAULT: "#E1F0FA",
          border: "#69B3E7",
        },


        // Semantic shades for UI elements
        surface: {
          DEFAULT: "#335377",  // Cards, panels
          muted: "#667E99",    // Subtle backgrounds
        },
        muted: {
          DEFAULT: "#99A9BB",  // Disabled text, placeholders
          foreground: "#CCD4DD", // Borders, dividers
        },
      },
    },
  },
  plugins: [],
}
