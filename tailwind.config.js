/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./hobby/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        primary: "#FF5757",
        white: "#F6F6F6",
        black: "#000000",
        gray: "#8C8C8C"
      },
      fontFamily: {
        pblack: ["Poppins-Black", "sans-serif"]
      }
    },
  },
  plugins: [],
}

