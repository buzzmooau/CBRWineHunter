/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wine-burgundy': '#722F37',
        'wine-deep-red': '#8B3A3A',
        'wine-rose': '#C77B7B',
        'wine-gold': '#D4AF37',
        'wine-cream': '#F5F5DC',
        'wine-charcoal': '#36454F',
      },
    },
  },
  plugins: [],
}
