/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif:   ['"Fraunces"', 'Georgia', 'serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Editorial neutrals
        ink:    '#0A0A0A',
        muted:  '#6F6F6F',
        paper:  '#FFFFFF',
        cream:  '#FBFAF7',

        // 🌿 Mint — primary accent (medical, calming)
        mint: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },

        // ☁️ Sky — secondary cool accent
        sky: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          500: '#0EA5E9',
          600: '#0284C7',
        },

        // 🍯 Amber / cream — warm highlight
        amber: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
        },

        // 🌸 Peach — for variety in cards
        peach: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          400: '#FB923C',
        },

        // Legacy primary (kept for backwards compat)
        primary: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          900: '#14532D',
        },
      },

      letterSpacing: {
        tightest: '-0.077em',
      },

      backdropBlur: {
        xs: '2px',
      },

      boxShadow: {
        'soft':       '0 2px 12px -4px rgba(10,10,10,0.06)',
        'soft-lg':    '0 8px 32px -8px rgba(10,10,10,0.12)',
        'soft-xl':    '0 20px 60px -20px rgba(10,10,10,0.18)',
        'glow-mint':  '0 0 40px -8px rgba(74, 222, 128, 0.45)',
        'glow-sky':   '0 0 40px -8px rgba(125, 211, 252, 0.45)',
        'inner-line': 'inset 0 1px 0 0 rgba(255,255,255,0.6)',
      },

      animation: {
        // Original
        'fade-rise':         'fadeRise 0.8s ease-out forwards',
        'fade-rise-delay':   'fadeRise 0.8s ease-out 0.2s forwards',
        'fade-rise-delay-2': 'fadeRise 0.8s ease-out 0.4s forwards',
        'fade-rise-delay-3': 'fadeRise 0.8s ease-out 0.6s forwards',
        'fade-in':           'fadeIn 0.6s ease-out forwards',
        // New
        'float':             'float 6s ease-in-out infinite',
        'float-slow':        'float 9s ease-in-out infinite',
        'blob':              'blob 12s ease-in-out infinite',
        'spin-slow':         'spin 18s linear infinite',
        'pulse-soft':        'pulseSoft 4s ease-in-out infinite',
        'gradient-shift':    'gradientShift 8s ease infinite',
        'marquee':           'marquee 30s linear infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%':      { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':      { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        gradientShift: {
          '0%, 100%':  { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
