/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      colors: {
        ink: '#101828',
        electric: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#155EEF',
          700: '#1D4ED8',
          800: '#1E40AF',
        },
        clinical: {
          50: '#F7F8FA',
          100: '#EDF0F4',
          200: '#D9DEE7',
        }
      },
      boxShadow: {
        'clinical': '0 10px 30px rgb(16,24,40,0.07)',
        'clinical-lg': '0 24px 60px -18px rgb(16,24,40,0.22)',
      }
    },
  },
  plugins: [],
}
