import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { colors, fontSize } from '../../constants/theme';

export function BobPlaceholder() {
  return (
    <AppCard title="Coming in Phase 7" accent="info">
      <Text style={styles.body}>
        Bob, the warehouse supervisor, will receive the produce issue report in his preferred language.
      </Text>
      <Text style={styles.body}>
        Demo flow:{'\n'}
        1. Bob selects <Text style={styles.highlight}>Spanish</Text>.{'\n'}
        2. App generates the report in Spanish.{'\n'}
        3. Bob responds in Spanish.{'\n'}
        4. App translates Bob&apos;s response to English.
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
  highlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});
