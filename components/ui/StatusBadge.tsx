import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import type { ProduceStatus } from '../../types/inspection';

interface StatusBadgeProps {
  status: ProduceStatus;
}

const statusConfig: Record<ProduceStatus, { bg: string; text: string }> = {
  'Sufficient':      { bg: colors.success,  text: colors.white  },
  'Needs attention': { bg: colors.warning,  text: '#0F172A'     },
  'Not sufficient':  { bg: colors.danger,   text: colors.white  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
