/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'amd-black': '#000000',
        'amd-gold': '#FFD700',
        'amd-gold-light': '#FFED4E',
        'amd-gold-dark': '#DAA520',
      },
    },
  },
  plugins: [],
}
