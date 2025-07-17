/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // importantísimo para detectar clases
  ],
   theme: {
    extend: {
      colors: {
        dark: '#27272A',
   },
    },
  },
  plugins: [],
}
