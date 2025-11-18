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
        /* Talixa Brand Colors - Primary */
        'talixa-blue': {
          DEFAULT: '#0066FF',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433',
        },
        'talixa-green': {
          DEFAULT: '#00C853',
          50: '#E6F9ED',
          100: '#CCF2DB',
          200: '#99E6B7',
          300: '#66D993',
          400: '#33CD6F',
          500: '#00C853',
          600: '#00A042',
          700: '#007832',
          800: '#005021',
          900: '#002811',
        },
        'talixa-purple': {
          DEFAULT: '#7B1FA2',
          50: '#F3E5F5',
          100: '#E1BEE7',
          200: '#CE93D8',
          300: '#BA68C8',
          400: '#AB47BC',
          500: '#7B1FA2',
          600: '#6A1B9A',
          700: '#4A148C',
          800: '#38006B',
          900: '#1A0033',
        },
        /* Secondary Colors */
        'talixa-gray': {
          DEFAULT: '#666666',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#404040',
          800: '#2D2D2D',
          900: '#1A1A1A',
        },
        /* Indonesian Accent Colors */
        'talixa-gold': {
          DEFAULT: '#FFD700',
          50: '#FFFBF0',
          100: '#FFF7DC',
          200: '#FFEFB9',
          300: '#FFE796',
          400: '#FFDF73',
          500: '#FFD700',
          600: '#E6C200',
          700: '#B39700',
          800: '#806C00',
          900: '#4D4100',
        },
        'talixa-brown': {
          DEFAULT: '#8B4513',
          50: '#F5EDE5',
          100: '#E8D5C4',
          200: '#D4B59F',
          300: '#BF947A',
          400: '#AA7455',
          500: '#8B4513',
          600: '#73390F',
          700: '#5B2D0C',
          800: '#432108',
          900: '#2B1505',
        },
        /* Semantic Colors */
        success: {
          DEFAULT: '#4CAF50',
          50: '#E8F5E9',
          500: '#4CAF50',
          900: '#1B5E20',
        },
        warning: {
          DEFAULT: '#FF9800',
          50: '#FFF3E0',
          500: '#FF9800',
          900: '#E65100',
        },
        error: {
          DEFAULT: '#F44336',
          50: '#FFEBEE',
          500: '#F44336',
          900: '#B71C1C',
        },
        info: {
          DEFAULT: '#2196F3',
          50: '#E3F2FD',
          500: '#2196F3',
          900: '#0D47A1',
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
              DEFAULT: '#0066FF', // Talixa Blue
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#00C853', // Talixa Green
              foreground: '#FFFFFF',
            },
            success: {
              DEFAULT: '#4CAF50',
              foreground: '#FFFFFF',
            },
            warning: {
              DEFAULT: '#FF9800',
              foreground: '#FFFFFF',
            },
            danger: {
              DEFAULT: '#F44336',
              foreground: '#FFFFFF',
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#66A3FF', // Lighter Talixa Blue
              foreground: '#001433',
            },
            secondary: {
              DEFAULT: '#66D993', // Lighter Talixa Green
              foreground: '#002811',
            },
          },
        },
      },
    }),
  ],
};

export default config;
