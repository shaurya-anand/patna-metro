/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        metro: {
          blue: '#1a56db',
          red: '#e02424',
          orange: '#ff6b00',
        },
      },
    },
  },
  plugins: [],
}

