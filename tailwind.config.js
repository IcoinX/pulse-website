/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pulse-cyan': '#00d4ff',
        'pulse-purple': '#7c3aed',
        'pulse-pink': '#ff006e',
      },
    },
  },
  plugins: [],
}
