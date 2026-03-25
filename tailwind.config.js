/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#e11d48',
          600: '#be123c',
          900: '#881337',
        },
      },
      boxShadow: {
        premium: '0 10px 30px rgba(15, 23, 42, 0.15)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        hero: 'linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.55)), url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6")',
      },
    },
  },
  plugins: [],
};
