import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from '../ui/AppButton';
import { useSpokenDiagnosis } from '../../hooks/useSpokenDiagnosis';
import { colors, fontSize, spacing } from '../../constants/theme';

const TEST_MESSAGE = 'Voice test. The produce inspection assistant is working.';

interface SpokenDiagnosisControlsProps {
  message: string;
  onSpoken?: () => void;
  compact?: boolean;
}

export function SpokenDiagnosisControls({
  message,
  onSpoken,
  compact = false,
}: SpokenDiagnosisControlsProps) {
  const { isSpeaking, status, error, speak, stop } = useSpokenDiagnosis();

  const handleSpeak = () => {
    speak(message);
    onSpoken?.();
  };

  const handleTest = () => {
    speak(TEST_MESSAGE);
  };

  const statusText = (): string => {
    if (status === 'speaking') return 'Speaking diagnosis…';
    if (status === 'stopped') return 'Speech stopped';
    if (status === 'error') return `Speech error: ${error ?? 'unknown'}`;
    return 'Voice ready';
  };

  return (
    <View style={compact ? styles.compact : styles.container}>
      <Text style={[styles.statusText, status === 'error' && styles.statusError]}>
        {statusText()}
      </Text>

      {isSpeaking ? (
        <>
          <AppButton
            label="Speaking…"
            variant="secondary"
            onPress={() => {}}
            disabled
            fullWidth={!compact}
          />
          <AppButton
            label="Stop"
            variant="ghost"
            onPress={stop}
            fullWidth={!compact}
          />
        </>
      ) : (
        <>
          {message.trim() ? (
            <AppButton
              label="Replay Diagnosis"
              variant="secondary"
              onPress={handleSpeak}
              fullWidth={!compact}
            />
          ) : (
            <AppButton
              label="Replay Diagnosis"
              variant="secondary"
              onPress={() => {}}
              disabled
              fullWidth={!compact}
            />
          )}
          <AppButton
            label="Test Voice"
            variant="ghost"
            onPress={handleTest}
            fullWidth={!compact}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  compact: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statusError: {
    color: colors.danger,
  },
});
