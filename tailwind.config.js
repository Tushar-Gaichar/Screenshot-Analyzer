/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // This allows us to toggle via the 'dark' class
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}