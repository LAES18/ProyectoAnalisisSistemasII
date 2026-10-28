/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#0b1635', 900: '#14244a', 800: '#1d3261' },
        coral: { 400: '#fb7c67', 500: '#f3624d' },
        cream: '#f8f7f3'
      },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Manrope', 'sans-serif'] },
      boxShadow: { soft: '0 18px 50px -20px rgba(15, 23, 42, .18)' }
    }
  },
  plugins: []
};

