import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { AppButton } from '../ui/AppButton';
import { SpokenDiagnosisControls } from './SpokenDiagnosisControls';
import type { InspectionResult } from '../../types/index';
import { colors, fontSize, spacing, borderRadius, fontWeight } from '../../constants/theme';

interface InspectionResultCardProps {
  result: InspectionResult;
  nextAction: string | null;
  onDiagnosisSpoken?: () => void;
}

function statusAccent(status: string): 'warning' | 'danger' | 'success' {
  if (status === 'Sufficient') return 'success';
  if (status === 'Not sufficient') return 'danger';
  return 'warning';
}

function statusBadgeColor(status: string): string {
  if (status === 'Sufficient') return colors.success;
  if (status === 'Not sufficient') return colors.danger;
  return colors.warning;
}

const CONFIDENCE_LABEL: Record<string, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
};

export function InspectionResultCard({
  result,
  nextAction,
  onDiagnosisSpoken,
}: InspectionResultCardProps) {
  return (
    <AppCard title="Inspection Result" accent={statusAccent(result.produceStatus)}>
      <View style={[styles.badge, { backgroundColor: statusBadgeColor(result.produceStatus) }]}>
        <Text style={styles.badgeText}>{result.produceStatus.toUpperCase()}</Text>
      </View>

      <Row label="Issue" value={result.identifiedIssue} />
      <Row label="Suggestion" value={result.suggestedSolution} />
      <Row
        label="Confidence"
        value={CONFIDENCE_LABEL[result.confidence] ?? result.confidence}
      />

      {nextAction !== null && nextAction !== '' && (
        <>
          <Text style={styles.sectionLabel}>Recommended action</Text>
          <Text style={styles.nextAction}>{nextAction}</Text>
        </>
      )}

      <View style={styles.voiceSection}>
        <Text style={styles.sectionLabel}>Smart-glasses voice output</Text>
        <Text style={styles.voiceHint}>Diagnosis spoken to inspector</Text>
        <Text style={styles.spoken}>{result.spokenMessage}</Text>
        <SpokenDiagnosisControls
          message={result.spokenMessage}
          onSpoken={onDiagnosisSpoken}
        />
      </View>

      <AppButton
        label="Notify Bob — Phase 6"
        variant="secondary"
        onPress={() => {}}
        disabled
        accessibilityLabel="Notify Bob — coming in Phase 6"
      />

      <Text style={styles.devNote}>Dev: mock result · real AI replaces this</Text>
    </AppCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  rowLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    width: 80,
    flexShrink: 0,
  },
  rowValue: {
    fontSize: fontSize.xs,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  voiceSection: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  voiceHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  spoken: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  nextAction: {
    fontSize: fontSize.sm,
    color: colors.warning,
    lineHeight: 20,
  },
  devNote: {
    fontSize: 10,
    color: colors.textDisabled,
    textAlign: 'center',
  },
});
