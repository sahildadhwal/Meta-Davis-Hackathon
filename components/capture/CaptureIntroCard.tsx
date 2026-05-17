import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { colors, fontSize } from '../../constants/theme';

export function CaptureIntroCard() {
  return (
    <AppCard title="How this works" accent="info">
      <Text style={styles.body}>
        In the final version,{' '}
        <Text style={styles.emphasis}>Meta smart glasses</Text> capture the produce image.
        In this phone app demo, the{' '}
        <Text style={styles.emphasis}>phone camera simulates that capture</Text>.
      </Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  emphasis: {
    color: colors.primary,
    fontWeight: '600',
  },
});
