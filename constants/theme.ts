export const colors = {
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  border: '#334155',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textDisabled: '#475569',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
