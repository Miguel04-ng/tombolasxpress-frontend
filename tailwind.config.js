/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f0fe',
          100: '#c5d8fd',
          200: '#9dbdfb',
          300: '#74a1f9',
          400: '#568af7',
          500: '#3773f5',
          600: '#1d6fa4',  // brand principal
          700: '#0f3460',  // brand foncé
          800: '#0a2444',
          900: '#060f1e',
        },
        accent: {
          DEFAULT: '#e63946',
          light:   '#ff6b6b',
          dark:    '#b71c1c',
        },
        gold: {
          DEFAULT: '#f4a261',
          light:   '#ffd6a0',
          dark:    '#e07b35',
        },
        success: '#2d6a4f',
        warning: '#f9a825',
        surface: {
          DEFAULT: '#ffffff',
          dark:    '#0d1b2a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 2px 16px rgba(13,27,42,0.08)',
        hover: '0 8px 32px rgba(13,27,42,0.15)',
        glow:  '0 0 24px rgba(230,57,70,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
      },
      keyframes: {
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
