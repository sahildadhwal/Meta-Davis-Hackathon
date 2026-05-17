import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { colors, fontSize } from '../../constants/theme';

export function InspectionPlaceholder() {
  return (
    <AppCard title="Coming in Phase 4" accent="warning">
      <Text style={styles.body}>
        After capturing a produce photo, this screen will display the AI inspection result:
        quality status, diagnosis, and a spoken audio summary.
      </Text>
      <Text style={styles.body}>
        Mock inspection service returns{' '}
        <Text style={styles.highlight}>Needs Attention</Text> by default.
        Real AI connects in Phase 10.
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
    color: colors.warning,
    fontWeight: '600',
  },
});
