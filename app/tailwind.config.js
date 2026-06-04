/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        clinical: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
        }
      },
      boxShadow: {
        'clinical': '0 8px 30px rgb(0,0,0,0.04)',
        'clinical-lg': '0 20px 50px -12px rgb(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
  rtl: true,
}
