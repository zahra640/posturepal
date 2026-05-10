/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fffbeb',
          100: '#fef3c7',
          400: '#f59e0b',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        posture: {
          good:    '#22c55e',
          warning: '#f59e0b',
          bad:     '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
