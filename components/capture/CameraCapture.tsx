import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppButton } from '../ui/AppButton';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

// v1 simulation of Meta smart glasses capture — phone camera replaces glasses camera.
// expo-camera@17: CameraView class exposes takePictureAsync (not takePicture).

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.message}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          {permission.canAskAgain
            ? 'Camera access is needed to capture produce photos for inspection.'
            : 'Camera permission was denied. Please enable it in iPhone Settings → Privacy → Camera.'}
        </Text>
        {permission.canAskAgain && (
          <AppButton
            label="Allow Camera Access"
            variant="primary"
            onPress={requestPermission}
          />
        )}
        <AppButton label="Cancel" variant="ghost" onPress={onCancel} />
      </View>
    );
  }

  const handleCapture = async () => {
    if (isCapturing || !cameraRef.current) return;
    setIsCapturing(true);
    setCaptureError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      onCapture(photo.uri);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Capture failed. Try again.';
      console.error('[CameraCapture] takePictureAsync failed:', e);
      setCaptureError(msg);
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      </View>
      <Text style={styles.hint}>Point camera at produce, then tap Capture.</Text>
      {captureError !== null && <Text style={styles.error}>{captureError}</Text>}
      <View style={styles.controls}>
        <AppButton
          label={isCapturing ? 'Capturing…' : 'Capture Produce Photo'}
          variant="primary"
          onPress={handleCapture}
          disabled={isCapturing}
        />
        <AppButton label="Cancel" variant="ghost" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  cameraWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  camera: {
    flex: 1,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
    textAlign: 'center',
  },
  controls: {
    gap: spacing.sm,
  },
  center: {
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
});
