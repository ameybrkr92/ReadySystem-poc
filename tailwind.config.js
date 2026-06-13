/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Calm operations palette — teal + charcoal
        charcoal: {
          50: '#f4f6f7',
          100: '#e4e8eb',
          200: '#c8d0d6',
          300: '#9fadb7',
          400: '#6f8290',
          500: '#536674',
          600: '#42525e',
          700: '#37434d',
          800: '#2b343c',
          900: '#1f262c',
          950: '#141a1f',
        },
        teal: {
          50: '#eefbf9',
          100: '#d4f4ef',
          200: '#ade9e1',
          300: '#78d6cc',
          400: '#43bcb1',
          500: '#26a097',
          600: '#1c807a',
          700: '#1a6663',
          800: '#195250',
          900: '#184543',
          950: '#072827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.45)' },
          '50%': { boxShadow: '0 0 0 6px rgba(239,68,68,0)' },
        },
        'flash': {
          '0%': { backgroundColor: 'rgba(38,160,151,0.25)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.35s ease-out',
        'toast-in': 'toast-in 0.4s cubic-bezier(0.16,1,0.3,1)',
        'pulse-red': 'pulse-red 1.6s ease-in-out infinite',
        'flash': 'flash 1.2s ease-out',
      },
    },
  },
  plugins: [],
}
