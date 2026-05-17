import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { CaptureIntroCard } from '../components/capture/CaptureIntroCard';
import { CameraCapture } from '../components/capture/CameraCapture';
import { ImagePreviewCard } from '../components/capture/ImagePreviewCard';
import { InspectionResultCard } from '../components/inspection/InspectionResultCard';
import { SessionDebugPanel } from '../components/debug/SessionDebugPanel';
import { useInspectionSession } from '../hooks/useInspectionSession';
import { useSpokenDiagnosis } from '../hooks/useSpokenDiagnosis';
import { mockInspectProduce, MOCK_NEXT_ACTION } from '../services/ai/mockInspectProduce';
import { colors, fontSize, spacing } from '../constants/theme';

export default function CaptureHomeScreen() {
  const router = useRouter();
  const {
    session,
    isLoaded,
    setCapturedImage,
    setInspectionResult,
    updateSession,
    markTimeline,
  } = useInspectionSession();
  const { speak } = useSpokenDiagnosis();
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async (uri: string) => {
    setShowCamera(false);
    await setCapturedImage(uri);
    setIsAnalyzing(true);
    try {
      const result = await mockInspectProduce(uri);
      await setInspectionResult(result, MOCK_NEXT_ACTION);
      // Auto-speak once immediately after result is stored.
      // Called here (not in useEffect) to guarantee exactly-once per capture.
      speak(result.spokenMessage);
      await markTimeline('diagnosis-spoken');
    } catch (e) {
      console.error('[CaptureHomeScreen] analysis or speech failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = async () => {
    await updateSession({
      imageUri: null,
      imageCaptured: false,
      inspectionResult: null,
      nextAction: null,
    });
    setShowCamera(true);
  };

  const handleClear = async () => {
    await updateSession({
      imageUri: null,
      imageCaptured: false,
      inspectionResult: null,
      nextAction: null,
    });
  };

  if (showCamera) {
    return (
      <AppScreen title="Capture Photo" scrollable={false}>
        <CameraCapture
          onCapture={handleCapture}
          onCancel={() => setShowCamera(false)}
        />
      </AppScreen>
    );
  }

  const hasImage = isLoaded && session?.imageCaptured && session.imageUri;
  const hasResult = !!session?.inspectionResult;

  return (
    <AppScreen
      title="Smart Produce Inspection"
      subtitle="Phone camera demo for Meta smart glasses workflow"
    >
      <CaptureIntroCard />

      {hasImage ? (
        <>
          <ImagePreviewCard
            imageUri={session.imageUri as string}
            onRetake={handleRetake}
            onClear={handleClear}
          />
          {isAnalyzing && (
            <View style={styles.analyzing}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.analyzingText}>Inspecting produce…</Text>
            </View>
          )}
          {!isAnalyzing && hasResult && (
            <InspectionResultCard
              result={session.inspectionResult!}
              nextAction={session.nextAction}
            />
          )}
        </>
      ) : (
        <AppButton
          label="Capture Produce Photo"
          variant="primary"
          onPress={() => setShowCamera(true)}
          disabled={!isLoaded}
          accessibilityLabel="Open camera to capture produce photo"
        />
      )}

      <View style={styles.navSection}>
        <Text style={styles.navLabel}>Explore screens</Text>
        <AppButton
          label="Go to Inspection"
          variant="secondary"
          onPress={() => router.push('/inspection')}
        />
        <AppButton
          label="Bob Simulator"
          variant="secondary"
          onPress={() => router.push('/bob')}
        />
        <AppButton
          label="Dashboard"
          variant="ghost"
          onPress={() => router.push('/dashboard')}
        />
      </View>

      <SessionDebugPanel />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  analyzing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  analyzingText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  navSection: {
    gap: spacing.sm,
  },
  navLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
});
