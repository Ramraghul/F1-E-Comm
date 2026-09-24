/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#08080B',
          900: '#0A0A0F',
          850: '#111116',
          800: '#16161D',
          700: '#1F1F28',
          600: '#2B2B36',
        },
        f1red: {
          DEFAULT: '#E10600',
          dark: '#B00500',
          light: '#FF3B30',
        },
        team: {
          DEFAULT: 'var(--team-primary, #E10600)',
          secondary: 'var(--team-secondary, #0A0A0F)',
          accent: 'var(--team-accent, #FFFFFF)',
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(180deg, rgba(225,6,0,0.12) 0%, rgba(10,10,15,0) 60%)',
        'carbon-fiber':
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 6px)',
      },
      boxShadow: {
        glow: '0 0 24px 0 rgba(225,6,0,0.35)',
        'team-glow': '0 0 24px 0 var(--team-primary-glow, rgba(225,6,0,0.35))',
      },
      keyframes: {
        'flag-wave': {
          '0%, 100%': { transform: 'skewY(0deg)' },
          '50%': { transform: 'skewY(1.5deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'flag-wave': 'flag-wave 3s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};
