import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import GlowCard from '../components/GlowCard';
import SeverityBar from '../components/SeverityBar';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';

export default function DiagnosisScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { diagnosis } = state;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, [fadeIn, slideUp]);

  useEffect(() => {
    if (diagnosis?.status === 'BAD_QUALITY') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [diagnosis?.status, pulseAnim]);

  const handleCallBob = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({ type: 'CLEAR_TRANSCRIPTS' });
    router.push('/call');
    // callBob is triggered from call screen on mount or by user
  };

  if (!diagnosis) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Ionicons name="leaf-outline" size={52} color={COLORS.textDim} />
          <Text style={styles.emptyTitle}>No Diagnosis Yet</Text>
          <Text style={styles.emptySub}>Scan produce to generate an AI diagnosis</Text>
          <TouchableOpacity style={styles.backBtnLarge} onPress={() => router.back()}>
            <Text style={styles.backBtnLargeText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor =
    diagnosis.status === 'BAD_QUALITY'
      ? COLORS.red
      : diagnosis.status === 'ACCEPTABLE'
      ? COLORS.yellow
      : COLORS.green;

  const statusIcon =
    diagnosis.status === 'BAD_QUALITY' ? '⚠' : diagnosis.status === 'ACCEPTABLE' ? '◉' : '✓';

  const statusLabel =
    diagnosis.status === 'BAD_QUALITY'
      ? 'BAD QUALITY'
      : diagnosis.status === 'ACCEPTABLE'
      ? 'ACCEPTABLE'
      : 'GOOD';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Diagnosis</Text>
          <View style={styles.lotPill}>
            <Text style={styles.lotPillText}>LOT #6</Text>
          </View>
        </View>

        <Animated.View
          style={[styles.bodyContainer, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
        >
          {/* ── Image Thumbnail + Status ── */}
          <View style={styles.topSection}>
            <View style={styles.statusSection}>
              <Animated.View
                style={[
                  styles.statusBadgeLarge,
                  {
                    backgroundColor: `${statusColor}18`,
                    borderColor: `${statusColor}44`,
                    opacity: diagnosis.status === 'BAD_QUALITY' ? pulseAnim : 1,
                  },
                ]}
              >
                <Text style={[styles.statusIcon, { color: statusColor }]}>{statusIcon}</Text>
                <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
              </Animated.View>
              <Text style={styles.produceType}>{diagnosis.produceType}</Text>
            </View>

            {(diagnosis.imageUrl || state.uploadedImageUri) && (
              <View style={styles.thumbContainer}>
                <Image
                  source={{ uri: diagnosis.imageUrl || state.uploadedImageUri! }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>Lot #6</Text>
                </View>
              </View>
            )}
          </View>

          {/* ── Severity Bar ── */}
          <GlowCard glowColor="none" style={styles.severityCard}>
            <SeverityBar score={diagnosis.severityScore} label="Severity Level" />
          </GlowCard>

          {/* ── Summary ── */}
          <GlowCard glowColor="none" style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{diagnosis.summary}</Text>
          </GlowCard>

          {/* ── Issues Card ── */}
          <GlowCard glowColor="red" style={styles.issuesCard}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.sectionTitle}>Issues Detected</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{diagnosis.issues.length}</Text>
              </View>
            </View>
            <View style={styles.issuesList}>
              {diagnosis.issues.map((issue, i) => (
                <View key={i} style={styles.issueRow}>
                  <Text style={styles.issueDot}>●</Text>
                  <Text style={styles.issueText}>{issue}</Text>
                </View>
              ))}
            </View>
          </GlowCard>

          {/* ── Recommendations ── */}
          <GlowCard glowColor="purple" style={styles.recsCard}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            <View style={styles.recsList}>
              {diagnosis.recommendations.map((rec, i) => (
                <View key={i} style={styles.recRow}>
                  <View style={styles.recNumberBubble}>
                    <Text style={styles.recNumber}>{i + 1}</Text>
                  </View>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>
          </GlowCard>

          {/* ── Worker Script ── */}
          <GlowCard glowColor="none" style={styles.scriptCard}>
            <View style={styles.scriptHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.scriptTitle}>Field Worker Script</Text>
            </View>
            <Text style={styles.scriptText}>"{diagnosis.workerScript}"</Text>
          </GlowCard>

          {/* ── Call Bob Button ── */}
          <View style={styles.callBobSection}>
            <TouchableOpacity
              onPress={handleCallBob}
              activeOpacity={0.85}
              style={styles.callBobWrapper}
            >
              <LinearGradient
                colors={['#00ff88', '#00cc6a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.callBobBtn}
              >
                <Text style={styles.callBobIcon}>📞</Text>
                <Text style={styles.callBobText}>Call Bob</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.callBobSub}>
              Initiate multilingual AI field worker call
            </Text>
          </View>
        </Animated.View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  backBtnLarge: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  backBtnLargeText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  lotPill: {
    backgroundColor: `${COLORS.green}18`,
    borderWidth: 1,
    borderColor: `${COLORS.green}44`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  lotPillText: {
    color: COLORS.green,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },

  bodyContainer: {
    gap: SPACING.md,
  },

  // Top Section
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusSection: {
    flex: 1,
    gap: SPACING.sm,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  produceType: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  thumbContainer: {
    position: 'relative',
    marginLeft: SPACING.md,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  thumbBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: `${COLORS.green}22`,
    borderWidth: 1,
    borderColor: `${COLORS.green}55`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  thumbBadgeText: {
    fontSize: 9,
    color: COLORS.green,
    fontWeight: '700',
  },

  // Severity
  severityCard: {
    padding: SPACING.md,
  },

  // Summary
  summaryCard: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },

  // Section Title
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  summaryText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  // Issues
  issuesCard: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    backgroundColor: `${COLORS.red}22`,
    borderWidth: 1,
    borderColor: `${COLORS.red}44`,
    borderRadius: RADIUS.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.red,
    fontWeight: '700',
  },
  issuesList: {
    gap: SPACING.sm,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  issueDot: {
    color: COLORS.red,
    fontSize: 10,
    marginTop: 4,
  },
  issueText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    lineHeight: 19,
  },

  // Recommendations
  recsCard: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  recsList: {
    gap: SPACING.md,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  recNumberBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.purple}33`,
    borderWidth: 1,
    borderColor: `${COLORS.purple}66`,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  recNumber: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.purple,
    fontWeight: '700',
  },
  recText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    lineHeight: 19,
  },

  // Worker Script
  scriptCard: {
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: '#0f0f1a',
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scriptTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  scriptText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Call Bob
  callBobSection: {
    gap: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  callBobWrapper: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.green,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  callBobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  callBobIcon: {
    fontSize: 22,
  },
  callBobText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: '#0a0a0f',
    letterSpacing: 0.5,
  },
  callBobSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
  },

  bottomPad: {
    height: SPACING.xl,
  },
});
