/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./hobby/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        primary: "#FF5757",
        primaryDark: '#A83B3B',
        white: "#F6F6F6",
        black: "#000000",
        gray: "#8C8C8C",
        darkGray: '#424242'
      },
      fontFamily: {
        pblack: ["Poppins-Black", "sans-serif"]
      }
    },
  },
  plugins: [],
}