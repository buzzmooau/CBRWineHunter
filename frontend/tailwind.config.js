/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          burgundy: '#722F37',
          'deep-red': '#8B3A3A',
          rose: '#C77B7B',
          gold: '#D4AF37',
          cream: '#F5F5DC',
          charcoal: '#36454F',
        },
        // Variety-specific colors
        variety: {
          red: {
            light: '#C77B7B',
            DEFAULT: '#722F37',
            dark: '#5A2529',
          },
          white: {
            light: '#FDFBF3',
            DEFAULT: '#F5F5DC',
            dark: '#E8E4CC',
          },
          rose: {
            light: '#FFC0CB',
            DEFAULT: '#FFB6C1',
            dark: '#FF69B4',
          },
          sparkling: {
            light: '#FFFACD',
            DEFAULT: '#F5F5DC',
            dark: '#D4AF37',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'wine': '0 10px 30px rgba(114, 47, 55, 0.3)',
        'wine-lg': '0 20px 40px rgba(114, 47, 55, 0.4)',
        'gold': '0 10px 30px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 20px 40px rgba(212, 175, 55, 0.4)',
      },
      animation: {
        'bubble-rise': 'bubble-rise 4s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'bubble-rise': {
          '0%': {
            transform: 'translateY(0) scale(1)',
            opacity: '0',
          },
          '10%': {
            opacity: '0.5',
          },
          '50%': {
            opacity: '0.8',
          },
          '100%': {
            transform: 'translateY(-500px) scale(0.5)',
            opacity: '0',
          },
        },
        'shimmer': {
          '0%': {
            transform: 'translateX(-100%) translateY(-100%) rotate(45deg)',
          },
          '100%': {
            transform: 'translateX(100%) translateY(100%) rotate(45deg)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'wine-gradient': 'linear-gradient(135deg, #722F37 0%, #8B3A3A 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5F5DC 100%)',
      },
    },
  },
  plugins: [],
}
