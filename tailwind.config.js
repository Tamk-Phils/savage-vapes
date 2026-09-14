/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdfa',
          100: '#d0f8f1',
          200: '#a6efe3',
          300: '#6ee1d0',
          400: '#45cab4',
          500: '#22ad99',
          600: '#188b7d',
          700: '#176f65',
          800: '#175953',
          900: '#174945',
          DEFAULT: '#45cab4',
          dark: '#369e8d',
        },
        dark: {
          bg: '#0a0914',
          card: '#121124',
          border: '#1f1e36',
          hover: '#191830',
          muted: '#8e8d9f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

