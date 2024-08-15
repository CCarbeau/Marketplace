/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./hobby/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        primary: "#FF5757",
        white: "#F6F6F6",
        black: "#000000"
      },
      fontFamily: {
        pblack: ["Poppins-Black", "sans-serif"]
      }
    },
  },
  plugins: [],
}

