/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cloudpi: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#53b1ff',
          500: '#2b91ff',
          600: '#1470f5',
          700: '#0d5ae1',
          800: '#1149b6',
          900: '#10408f',
          950: '#0f2857',
        },
      },
    },
  },
  plugins: [],
};
