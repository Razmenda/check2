/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e4',
          200: '#bce4cc',
          300: '#8dd0a8',
          400: '#57b37d',
          500: '#471396', // Main brand color
          600: '#3d1082',
          700: '#330d6e',
          800: '#290a5a',
          900: '#1f0746',
        },
        accent: {
          50: '#fef9ed',
          100: '#fdf0d4',
          200: '#fae0a8',
          300: '#F3C883',
          400: '#f0b955',
          500: '#eb9d2a',
          600: '#d6841f',
          700: '#b2681c',
          800: '#90511e',
          900: '#75431c',
        },
        background: '#FAFBFC',
        card: '#FFFFFF',
        dark: {
          primary: '#1F0746',
          secondary: '#290a5a',
          surface: '#330d6e',
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      fontWeight: {
        normal: '400',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        'card': '1.5rem',
        'chat': '1.25rem',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'float': '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.33)',
          },
          '40%, 50%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(1.33)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};