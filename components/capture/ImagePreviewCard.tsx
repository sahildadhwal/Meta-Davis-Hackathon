import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { AppButton } from '../ui/AppButton';
import { colors, spacing, fontSize, borderRadius, fontWeight } from '../../constants/theme';

interface ImagePreviewCardProps {
  imageUri: string;
  onRetake: () => void;
  onClear: () => void;
}

export function ImagePreviewCard({ imageUri, onRetake, onClear }: ImagePreviewCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <AppCard title="Captured Photo" accent="success">
      {imageError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Photo file unavailable — temporary camera URIs don't persist after a full
            app restart. Tap Retake Photo to capture a new photo.
          </Text>
        </View>
      ) : (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>
      )}

      <View style={styles.badge}>
        <Text style={styles.badgeText}>✓ Image captured</Text>
      </View>

      <View style={styles.buttons}>
        <AppButton
          label="Retake Photo"
          variant="secondary"
          onPress={onRetake}
          fullWidth={false}
        />
        <AppButton
          label="Clear Photo"
          variant="ghost"
          onPress={onClear}
          fullWidth={false}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    flex: 1,
  },
  errorBox: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
