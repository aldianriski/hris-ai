/**
 * Talixa HRIS - Design Tokens
 *
 * Brand identity design tokens following the Branding PRD.
 * Use these tokens consistently across all marketing and application interfaces.
 *
 * @see docs/BRANDING_PRD.md
 */

// =============================================================================
// PRIMARY BRAND COLORS
// =============================================================================

export const colors = {
  primary: {
    // Talixa Blue - Trust, professionalism
    blue: {
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
    // Talixa Green - Growth, success
    green: {
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
    // Talixa Purple - Innovation, AI
    purple: {
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
  },

  // ===========================================================================
  // SECONDARY COLORS
  // ===========================================================================

  secondary: {
    // Dark Gray - Text, backgrounds
    dark: {
      DEFAULT: '#1A1A1A',
      900: '#1A1A1A',
      800: '#2D2D2D',
      700: '#404040',
      600: '#525252',
    },
    // Medium Gray - Secondary text
    medium: {
      DEFAULT: '#666666',
      600: '#666666',
      500: '#808080',
      400: '#999999',
    },
    // Light Gray - Backgrounds, cards
    light: {
      DEFAULT: '#F5F5F5',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
    },
    // White - Clean spaces
    white: '#FFFFFF',
  },

  // ===========================================================================
  // SEMANTIC COLORS
  // ===========================================================================

  semantic: {
    success: {
      DEFAULT: '#4CAF50',
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    warning: {
      DEFAULT: '#FF9800',
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: '#FF9800',
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: '#E65100',
    },
    error: {
      DEFAULT: '#F44336',
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#F44336',
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
    info: {
      DEFAULT: '#2196F3',
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
  },

  // ===========================================================================
  // INDONESIAN ACCENT COLORS
  // ===========================================================================

  accent: {
    // Garuda Gold - National pride
    gold: {
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
    // Batik Brown - Cultural heritage
    brown: {
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
  },
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fonts: {
    // Headings - Inter (clean, modern, readable)
    heading: 'Inter, system-ui, -apple-system, sans-serif',
    // Body - Open Sans (professional, accessible)
    body: 'Open Sans, system-ui, -apple-system, sans-serif',
    // Code/Data - JetBrains Mono (technical elements)
    mono: 'JetBrains Mono, Consolas, Monaco, monospace',
  },

  sizes: {
    // Display (Marketing headlines)
    display: {
      xl: '4rem',      // 64px
      lg: '3.5rem',    // 56px
      md: '3rem',      // 48px
      sm: '2.5rem',    // 40px
    },
    // Headings (Content hierarchy)
    heading: {
      h1: '2.25rem',   // 36px
      h2: '1.875rem',  // 30px
      h3: '1.5rem',    // 24px
      h4: '1.25rem',   // 20px
      h5: '1.125rem',  // 18px
      h6: '1rem',      // 16px
    },
    // Body text
    body: {
      xl: '1.25rem',   // 20px
      lg: '1.125rem',  // 18px
      base: '1rem',    // 16px
      sm: '0.875rem',  // 14px
      xs: '0.75rem',   // 12px
    },
  },

  weights: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  // 8px grid system
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px (buttons)
  DEFAULT: '0.5rem', // 8px (cards)
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',  // Pills/circles
};

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  // Subtle elevation (2-4px blur)
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easings: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a color value by path
 * @example getColor('primary.blue.500') // '#0066FF'
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${path}" not found`);
      return '';
    }
  }

  return value;
}

/**
 * Get font family by type
 * @example getFont('heading') // 'Inter, system-ui, sans-serif'
 */
export function getFont(type: 'heading' | 'body' | 'mono'): string {
  return typography.fonts[type];
}

/**
 * Get spacing value
 * @example getSpacing(4) // '1rem' (16px)
 */
export function getSpacing(value: number): string {
  return spacing[value as keyof typeof spacing] || `${value * 0.25}rem`;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  animation,
  getColor,
  getFont,
  getSpacing,
};
