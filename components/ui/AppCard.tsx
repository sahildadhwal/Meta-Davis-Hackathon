import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';

interface AppCardProps {
  children: React.ReactNode;
  title?: string;
  accent?: 'default' | 'warning' | 'danger' | 'success' | 'info';
}

const accentBorderMap = {
  default: colors.border,
  warning: colors.warning,
  danger: colors.danger,
  success: colors.success,
  info: colors.primary,
};

export function AppCard({ children, title, accent = 'default' }: AppCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: accentBorderMap[accent] }]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
