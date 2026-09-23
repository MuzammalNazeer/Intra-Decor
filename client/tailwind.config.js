/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#3a1e1e',
          primary: '#4b2c2c',
          secondary: '#7a4040',
          hover: '#5e3737',
          gold: '#d4a56a',
          accent: '#c17f4a',
          light: '#f7f4f0',
          ivory: '#faf8f5',
          border: '#e8dfd8'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'sans-serif']
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(75, 44, 44, 0.15)',
        'luxury-hover': '0 20px 40px -15px rgba(75, 44, 44, 0.25)'
      }
    },
  },
  plugins: [],
}
