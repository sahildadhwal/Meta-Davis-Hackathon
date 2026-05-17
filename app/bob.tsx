import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { BobPlaceholder } from '../components/bob/BobPlaceholder';
import { colors, fontSize } from '../constants/theme';

export default function BobScreen() {
  const router = useRouter();

  return (
    <AppScreen
      title="Bob Communication"
      subtitle="Multilingual warehouse supervisor notification"
    >
      <AppCard title="Preview — Spanish message will look like this" accent="info">
        <Text style={styles.spanishPreview}>
          Estimado supervisor, se ha detectado un problema de calidad en el lote
          inspeccionado. La fruta muestra signos de magulladuras y decoloración.
          Por favor confirme cómo proceder.
        </Text>
        <Text style={styles.translationPreview}>
          → &quot;Understood. Remove that batch and mark it as rejected.&quot;
        </Text>
      </AppCard>

      <BobPlaceholder />

      <AppButton
        label="Back to Capture"
        variant="secondary"
        onPress={() => router.back()}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  spanishPreview: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  translationPreview: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 4,
  },
});
