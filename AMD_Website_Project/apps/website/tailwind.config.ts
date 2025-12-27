import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070B',
          900: '#070A12',
          800: '#0B1020',
        },
        gold: {
          500: '#D4AF37',
        },
      },
      keyframes: {
        codeStream: {
          '0%': { transform: 'translateY(0px)', opacity: '0.0' },
          '15%': { opacity: '0.25' },
          '85%': { opacity: '0.25' },
          '100%': { transform: 'translateY(-40px)', opacity: '0.0' },
        },
      },
      animation: {
        codeStream: 'codeStream 6s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
