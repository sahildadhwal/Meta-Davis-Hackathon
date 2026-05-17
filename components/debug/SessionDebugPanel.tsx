import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { AppButton } from '../ui/AppButton';
import { useInspectionSession } from '../../hooks/useInspectionSession';
import { colors, fontSize, spacing } from '../../constants/theme';

export function SessionDebugPanel() {
  const { session, isLoaded, error, loadMockNeedsAttentionSession, resetSession } =
    useInspectionSession();

  if (!isLoaded) {
    return (
      <AppCard title="Phase 2 Dev · Session State" accent="warning">
        <Text style={styles.muted}>Loading session…</Text>
      </AppCard>
    );
  }

  const produceStatus = session?.inspectionResult?.produceStatus ?? 'No inspection yet';
  const language = session?.bobCommunication.preferredLanguage ?? 'Not selected';
  const nextAction = session?.nextAction ?? 'No next action yet';
  const sessionId = session?.sessionId ? session.sessionId.slice(0, 12) + '…' : '—';
  const imageUriShort = session?.imageUri
    ? '…' + session.imageUri.slice(-20)
    : 'None';

  return (
    <AppCard title="Phase 2 Dev · Session State" accent="warning">
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <View style={styles.row}>
        <Text style={styles.label}>Session ID</Text>
        <Text style={styles.value}>{sessionId}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Image captured</Text>
        <Text style={styles.value}>{session?.imageCaptured ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Image URI</Text>
        <Text style={styles.value}>{imageUriShort}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Produce status</Text>
        <Text style={styles.value}>{produceStatus}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Bob language</Text>
        <Text style={styles.value}>{language}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Next action</Text>
        <Text style={[styles.value, styles.nextAction]} numberOfLines={2}>
          {nextAction}
        </Text>
      </View>

      <View style={styles.buttons}>
        <AppButton
          label="Load Mock Session"
          variant="secondary"
          onPress={loadMockNeedsAttentionSession}
          fullWidth={false}
        />
        <AppButton
          label="Reset Session"
          variant="ghost"
          onPress={resetSession}
          fullWidth={false}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  muted: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    flex: 1,
  },
  value: {
    fontSize: fontSize.xs,
    color: colors.text,
    flex: 2,
    textAlign: 'right',
  },
  nextAction: {
    color: colors.warning,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
});
