/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['"Instrument Serif"', 'Georgia', 'serif'],
        arabic:  ['"Noto Naskh Arabic"', 'Tahoma', 'sans-serif'],
      },
      colors: {
        // Editorial palette inspired by the cinematic landing
        ink:      '#000000',
        muted:    '#6F6F6F',
        paper:    '#FFFFFF',
        // Clinical brand accents
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
      letterSpacing: {
        tightest: '-0.077em',  // matches -2.46px on text-8xl
      },
      animation: {
        'fade-rise':         'fadeRise 0.8s ease-out forwards',
        'fade-rise-delay':   'fadeRise 0.8s ease-out 0.2s forwards',
        'fade-rise-delay-2': 'fadeRise 0.8s ease-out 0.4s forwards',
        'fade-in':           'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeRise: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
