/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {50:'#f6f5f4',100:'#eae8e7',200:'#d7d4d3',300:'#bbb8b9',400:'#959295',500:'#777278',600:'#5d595f',700:'#454149',800:'#2b292e',900:'#19181c',950:'#101013'},
        brand: {
          50: '#fbf1f3',
          100: '#f0d9df',
          200: '#e2b8c3',
          300: '#cf94a6',
          400: '#b86e85',
          500: '#963951',
          600: '#79263e',
          700: '#681d33',
          800: '#51162a',
          900: '#37101e',
          950: '#200a12',
        },
      },
      boxShadow: {
        premium: '0 14px 38px rgba(15, 12, 14, 0.18)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        hero: 'linear-gradient(120deg, rgba(136,19,55,0.72), rgba(2,6,23,0.64)), url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6")',
      },
    },
  },
  plugins: [],
};
