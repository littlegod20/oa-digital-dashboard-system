import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body:    ['var(--font-body)', 'DM Sans', 'sans-serif'],
        display: ['var(--font-display)', 'Syne', 'sans-serif'],
      },
      colors: {
        navy:  { DEFAULT: '#0B1F3B', deep: '#071426' },
        blue:  { DEFAULT: '#1D5FD1' },
        cyan:  { DEFAULT: '#22B8F0' },
        ink:   { DEFAULT: '#152238' },
        slate: { DEFAULT: '#5A6B85' },
        oa: {
          green: '#0E9F6E',
          red:   '#D64545',
          amber: '#C77E12',
          bg:    '#F2F5FA',
          card:  '#FFFFFF',
          line:  '#DCE4F0',
        },
      },
      borderRadius: {
        '2xl': '14px',
      },
      boxShadow: {
        card: '0 4px 18px rgba(11,31,59,.08)',
      },
    },
  },
  plugins: [],
}

export default config
