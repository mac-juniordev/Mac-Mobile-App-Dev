export const colors = {
  primary: {
    DEFAULT: '#3A86FF',
    light: '#6BA5FF',
    dark: '#1E5FC9',
    subtle: '#E8F1FF',
  },
  accent: {
    DEFAULT: '#FF8C42',
    light: '#FFA76B',
    subtle: '#FFF0E6',
  },
  surface: {
    DEFAULT: '#FFFFFF',
    off: '#FAFAF8',
    subtle: '#F5F5F3',
  },
  text: {
    primary: '#1F1F1F',
    secondary: '#8A8A8A',
    tertiary: '#B8B8B8',
    inverse: '#FFFFFF',
  },
  success: {
    DEFAULT: '#10B981',
    subtle: '#E6F7F1',
  },
  warning: {
    DEFAULT: '#F59E0B',
    subtle: '#FEF3E2',
  },
  error: {
    DEFAULT: '#EF4444',
    subtle: '#FDE8E8',
  },
  border: {
    DEFAULT: '#E5E5E3',
    subtle: '#F0F0EE',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const typography = {
  fontFamily: {
    regular: 'Inter',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;