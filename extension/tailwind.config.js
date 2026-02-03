/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Renamed to avoid bg-bg naming conflict
        'dark': {
          'primary': '#0f0f23',
          'secondary': '#1a1a2e',
          'tertiary': '#25253a',
          'card': '#16162a',
        },
        'border': {
          'custom': '#2d2d44',
        },
        'primary': {
          DEFAULT: '#6366f1',
          'dark': '#4f46e5',
          'light': '#818cf8',
        },
        'accent': {
          DEFAULT: '#10b981',
          'light': '#34d399',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}