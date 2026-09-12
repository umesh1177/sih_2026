/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fc',
          100: '#e1ebfa',
          200: '#c7daf7',
          300: '#9ec1f2',
          400: '#6ea0eb',
          500: '#477ee3',
          600: '#2f60d6',
          700: '#234abc',
          800: '#1e3d99',
          900: '#0a2558', // Main Brand Navy from reference screenshot
          950: '#06173a',
        },
        moes: {
          blue: '#0a2558',
          accent: '#0284c7',
          gold: '#d97706',
          teal: '#0d9488'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
