import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        gold: '#B8860B',
        slateDark: '#0a0a0a',
        panel: '#121212'
      },
      backgroundImage: {
        blueprint:
          'radial-gradient(circle at 1px 1px, rgba(184,134,11,0.25) 1px, transparent 0), linear-gradient(rgba(184,134,11,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(184,134,11,0.08) 1px, transparent 1px)'
      },
      backgroundSize: {
        blueprint: '32px 32px, 32px 32px, 32px 32px'
      },
      keyframes: {
        pulseGrid: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.65' }
        }
      },
      animation: {
        pulseGrid: 'pulseGrid 8s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
