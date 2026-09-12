/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc2fd',
          400: '#36a2fa',
          500: '#0c84eb',
          600: '#0267c9',
          700: '#0352a3',
          800: '#074686',
          900: '#0c3b70',
          950: '#082549',
        }
      }
    },
  },
  plugins: [],
}
