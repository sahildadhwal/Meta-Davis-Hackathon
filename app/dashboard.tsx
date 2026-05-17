import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { DashboardPlaceholder } from '../components/dashboard/DashboardPlaceholder';
import { colors, fontSize } from '../constants/theme';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <AppScreen
      title="Dashboard"
      subtitle="Inspection session summary and timeline"
    >
      <AppCard title="Preview — Timeline will look like this" accent="success">
        {TIMELINE_PREVIEW.map((item) => (
          <Text key={item} style={styles.timelineItem}>
            {item}
          </Text>
        ))}
      </AppCard>

      <DashboardPlaceholder />

      <AppButton
        label="Back to Capture"
        variant="secondary"
        onPress={() => router.back()}
      />
    </AppScreen>
  );
}

const TIMELINE_PREVIEW = [
  '✓  Image captured',
  '✓  Inspection: Needs Attention',
  '✓  Diagnosis spoken aloud',
  '✓  Bob notified in Spanish',
  '✓  Bob responded: Remove and reject batch',
  '✓  Session complete',
];

const styles = StyleSheet.create({
  timelineItem: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 24,
  },
});
