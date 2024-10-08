/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',  // All JS, JSX, TS, and TSX files in your `src` folder
    './components/**/*.{js,jsx,ts,tsx}',  // All component files if you have a separate folder for them
    './public/index.html',  // If you have an `index.html` file in your `public` directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

