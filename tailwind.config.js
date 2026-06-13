/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral ink / slate ramp (cool, refined). Class names kept as
        // `charcoal-*` so the whole app re-themes without per-file churn.
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e7ecf2',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#070c17',
        },
        // Brand accent — a confident indigo. Kept under the `teal` key so all
        // existing `teal-*` utilities adopt the new accent instantly.
        teal: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightish: '-0.011em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        cardhover: '0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
        pop: '0 12px 32px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.08)',
        focus: '0 0 0 3px rgba(99,102,241,0.18)',
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' },
          '50%': { boxShadow: '0 0 0 5px rgba(239,68,68,0)' },
        },
        flash: {
          '0%': { color: '#4f46e5' },
          '100%': { color: 'inherit' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16,1,0.3,1)',
        'pulse-ring': 'pulse-ring 1.8s ease-in-out infinite',
        flash: 'flash 1.1s ease-out',
      },
    },
  },
  plugins: [],
}
