import defaultTheme from 'tailwindcss/defaultTheme';
import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8f2',
          100: '#ffe9d2',
          200: '#ffd0a3',
          300: '#ffb06e',
          400: '#ff8f3c',
          500: '#f97316',
          600: '#dd5d0d',
          700: '#b6450c',
          800: '#8f3610',
          900: '#733011',
        },
        slate: {
          950: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        glow: '0 20px 45px rgba(249, 115, 22, 0.25)',
      },
      backgroundImage: {
        'grid-orange': 'linear-gradient(rgba(249,115,22,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.15) 1px, transparent 1px)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

