import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { InspectionPlaceholder } from '../components/inspection/InspectionPlaceholder';
import { StatusBadge } from '../components/ui/StatusBadge';
import { colors, fontSize } from '../constants/theme';

export default function InspectionScreen() {
  const router = useRouter();

  return (
    <AppScreen
      title="Inspection Result"
      subtitle="AI produce quality analysis"
    >
      <AppCard title="Preview — Final result will look like this" accent="warning">
        <StatusBadge status="Needs attention" />
        <Text style={styles.diagnosisPreview}>
          This produce shows visible bruising on the surface and early signs of
          discoloration. Immediate review is recommended before stocking.
        </Text>
      </AppCard>

      <InspectionPlaceholder />

      <AppButton
        label="Back to Capture"
        variant="secondary"
        onPress={() => router.back()}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  diagnosisPreview: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
