/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./popup/**/*.{html,js,ts}",
    "./content/**/*.{html,js,ts}",
    "./background/**/*.{js,ts}",
    "./services/**/*.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}