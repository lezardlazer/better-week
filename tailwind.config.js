/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        base: '#EDEDF0',
        surface: '#EDEDF0',
        ink: '#141416',
        muted: '#6B6B70',
        bauhaus: {
          blue: '#3355D8',
          yellow: '#E8A93B',
          red: '#D8473B',
        },
      },
      borderRadius: {
        xl2: '24px',
      },
    },
  },
  plugins: [],
};
