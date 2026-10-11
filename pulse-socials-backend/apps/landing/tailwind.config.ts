import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Monad brand palette — https://monad.xyz
        brand: {
          DEFAULT: '#6e54ff',
          soft: '#8270ff',
          deep: '#5a3fe0',
          text: '#6347ff',
        },
        gold: {
          DEFAULT: '#6e54ff',
          soft: '#8270ff',
          deep: '#5a3fe0',
        },
        lilac: {
          DEFAULT: '#b8b4fe',
          soft: '#e4dfff',
          deep: '#9a8cff',
        },
        teal: {
          DEFAULT: '#a0055d',
          soft: '#fbe9f3',
          deep: '#7a0446',
        },
        navy: {
          DEFAULT: '#0e100f',
          deep: '#05060a',
          soft: '#16161a',
        },
        cream: '#edebe8',
        ink: '#26262b',

        // Aliases kept for backwards compatibility with existing markup.
        primary: '#6e54ff',
        secondary: '#b8b4fe',
        'monad-teal': '#a0055d',
        'monad-navy': '#0e100f',
        'monad-cream': '#edebe8',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        britti: ['var(--font-britti)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: {
        container: '76rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(110, 84, 255, 0.04), 0 8px 24px -12px rgba(110, 84, 255, 0.18)',
        lift: '0 2px 4px rgba(110, 84, 255, 0.06), 0 24px 48px -16px rgba(110, 84, 255, 0.28)',
        gold: '0 8px 32px -8px rgba(110, 84, 255, 0.45)',
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(135deg, #6e54ff 0%, #8270ff 45%, #5a3fe0 100%)',
        'brand-mesh':
          'radial-gradient(60% 60% at 50% 0%, rgba(110,84,255,0.16) 0%, transparent 70%)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.75' },
        },
        shimmer: {
          from: { backgroundPosition: '0% 50%' },
          to: { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-soft': 'pulse-soft 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 8s linear infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

export default config
