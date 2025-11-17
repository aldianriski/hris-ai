import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Talixa Brand Colors */
        'talixa-indigo': {
          DEFAULT: '#0047AB',
          light: '#9AC7F7',
          50: '#EBF4FF',
          100: '#D6E9FF',
          200: '#9AC7F7',
          300: '#5EA5EF',
          400: '#2283E7',
          500: '#0047AB',
          600: '#003A8A',
          700: '#002D68',
          800: '#002047',
          900: '#001325',
        },
        'talixa-amber': {
          DEFAULT: '#FFA500',
          light: '#FFBF69',
          50: '#FFF8EB',
          100: '#FFF0D6',
          200: '#FFBF69',
          300: '#FFAD33',
          400: '#FFA500',
          500: '#CC8400',
          600: '#996300',
          700: '#664200',
          800: '#332100',
          900: '#1A1100',
        },
        'talixa-navy-dark': '#002366',
        'talixa-text-dark': '#1F2537',
        'talixa-text-light': '#6B7280',
        /* Status Colors */
        'talixa-status': {
          active: '#4CAF50',
          pending: '#FFA500',
          inactive: '#6B7280',
          alert: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'talixa-sm': '0 2px 4px rgba(0,0,0,0.05)',
        'talixa': '0 4px 12px rgba(0,0,0,0.08)',
        'talixa-lg': '0 8px 24px rgba(0,0,0,0.12)',
        'talixa-xl': '0 12px 32px rgba(0,0,0,0.15)',
      },
      fontSize: {
        'page-title': ['32px', { lineHeight: '40px', fontWeight: '700' }],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0047AB 0%, #2283E7 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FFA500 0%, #FFBF69 100%)',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#0047AB',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#FFA500',
              foreground: '#FFFFFF',
            },
            success: {
              DEFAULT: '#4CAF50',
              foreground: '#FFFFFF',
            },
            warning: {
              DEFAULT: '#FFA500',
              foreground: '#FFFFFF',
            },
            danger: {
              DEFAULT: '#EF4444',
              foreground: '#FFFFFF',
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#9AC7F7',
              foreground: '#002366',
            },
            secondary: {
              DEFAULT: '#FFBF69',
              foreground: '#332100',
            },
          },
        },
      },
    }),
  ],
};

export default config;
