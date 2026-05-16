import { TextStyle } from 'react-native';

export const COLORS = {
  bg: '#0a0a0f',
  card: '#13131a',
  cardBorder: '#1e1e2e',
  green: '#00ff88',
  purple: '#7c3aed',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#475569',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
};

export const SHADOWS = {
  green: {
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  purple: {
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  red: {
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const TEXT_STYLES: Record<string, TextStyle> = {
  heading: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: FONT_SIZE.md,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 22,
  },
  caption: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '400',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  mono: {
    fontSize: FONT_SIZE.sm,
    fontFamily: 'Courier',
    color: COLORS.textMuted,
  },
};
