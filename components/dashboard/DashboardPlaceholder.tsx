import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { colors, fontSize } from '../../constants/theme';

export function DashboardPlaceholder() {
  return (
    <AppCard title="Coming in Phase 8" accent="success">
      <Text style={styles.body}>
        After a full inspection session completes, this screen will display the timeline:
      </Text>
      <Text style={styles.body}>
        {'  '}• Image captured{'\n'}
        {'  '}• Inspection result + diagnosis{'\n'}
        {'  '}• Bob notified (language selected){'\n'}
        {'  '}• Bob&apos;s response (translated to English){'\n'}
        {'  '}• Session resolution
      </Text>
      <Text style={styles.body}>
        Session state persists via{' '}
        <Text style={styles.highlight}>AsyncStorage</Text> — survives app restarts.
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
    color: colors.success,
    fontWeight: '600',
  },
});
