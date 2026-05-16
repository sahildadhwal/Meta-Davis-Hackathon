import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import GlowCard from '../components/GlowCard';
import { COLORS, SPACING, FONT_SIZE, RADIUS, TEXT_STYLES } from '../constants/theme';

const TECH_PILLS = [
  { label: 'Gemini Vision', icon: '✦' },
  { label: 'ElevenLabs', icon: '🎙' },
  { label: 'Deepgram', icon: '📡' },
  { label: 'Twilio', icon: '📞' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  // Rotating orb animation
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      }),
    );
    rotate.start();
    return () => rotate.stop();
  }, [rotateAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleScan = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/scan');
  };

  const statusConnected = state.isSocketConnected && !state.demoMode;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>🌿 AgriLens AI</Text>
            <Text style={styles.appSubtitle}>Agricultural Intelligence Platform</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── Status Card ── */}
        <GlowCard glowColor={statusConnected ? 'green' : 'none'} style={styles.statusCard}>
          <View style={styles.statusInner}>
            <View style={styles.statusLeft}>
              <Text style={[styles.statusDot, { color: statusConnected ? COLORS.green : COLORS.yellow }]}>
                {statusConnected ? '● CONNECTED' : '◌ SIMULATED'}
              </Text>
              <Text style={styles.statusSub}>
                {statusConnected ? 'Meta Glasses Ready' : 'Demo Mode Active'}
              </Text>
            </View>
            <Animated.View
              style={[
                styles.pulseDot,
                {
                  backgroundColor: statusConnected ? COLORS.green : COLORS.yellow,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </View>
        </GlowCard>

        {/* ── Lot Badge ── */}
        <View style={styles.lotBadgeRow}>
          <View style={styles.lotBadge}>
            <Text style={styles.lotBadgeText}>LOT #6</Text>
          </View>
          <Text style={styles.lotBadgeHint}>Active inspection batch</Text>
        </View>

        {/* ── Hero Orb ── */}
        <View style={styles.heroSection}>
          <View style={styles.orbOuter}>
            <Animated.View style={[styles.orbRing, { transform: [{ rotate: spin }] }]}>
              <LinearGradient
                colors={['#00ff8833', '#7c3aed33', '#00ff8833']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.orbGradientRing}
              />
            </Animated.View>
            <LinearGradient
              colors={[COLORS.green, COLORS.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.orb}
            >
              <Text style={styles.orbEmoji}>🌿</Text>
            </LinearGradient>
          </View>
          <Text style={styles.poweredBy}>
            Powered by Gemini · ElevenLabs · Deepgram · Twilio
          </Text>
        </View>

        {/* ── Scan Button ── */}
        <TouchableOpacity
          onPress={handleScan}
          activeOpacity={0.85}
          style={styles.scanBtnWrapper}
        >
          <LinearGradient
            colors={['#00ff88', '#00cc6a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanBtn}
          >
            <Text style={styles.scanBtnText}>📷  Scan Produce</Text>
          </LinearGradient>
        </TouchableOpacity>

        {state.diagnosis && (
          <TouchableOpacity
            onPress={() => router.push('/diagnosis')}
            style={styles.viewDiagnosisLink}
          >
            <Text style={styles.viewDiagnosisText}>View Last Diagnosis ›</Text>
          </TouchableOpacity>
        )}

        {/* ── Demo Mode Toggle ── */}
        <GlowCard glowColor="none" style={styles.demoCard}>
          <View style={styles.demoRow}>
            <View style={styles.demoTextGroup}>
              <Text style={styles.demoTitle}>Demo Mode</Text>
              <Text style={styles.demoSub}>
                Simulate full AI conversation without real calls
              </Text>
              {!state.demoMode && (
                <Text style={styles.demoWarning}>⚠ Requires live backend connection</Text>
              )}
            </View>
            <Switch
              value={state.demoMode}
              onValueChange={(v) => dispatch({ type: 'SET_DEMO_MODE', payload: v })}
              trackColor={{ false: COLORS.cardBorder, true: `${COLORS.green}88` }}
              thumbColor={state.demoMode ? COLORS.green : COLORS.textDim}
              ios_backgroundColor={COLORS.cardBorder}
            />
          </View>
        </GlowCard>

        {/* ── Recent Diagnosis ── */}
        {state.diagnosis && (
          <GlowCard
            glowColor={state.diagnosis.status === 'BAD_QUALITY' ? 'red' : 'green'}
            onPress={() => router.push('/diagnosis')}
            style={styles.recentDiagCard}
          >
            <View style={styles.recentDiagInner}>
              <View>
                <Text style={styles.recentDiagLabel}>Recent Diagnosis</Text>
                <Text style={styles.recentDiagProduce}>{state.diagnosis.produceType}</Text>
              </View>
              <View style={styles.recentDiagRight}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        state.diagnosis.status === 'BAD_QUALITY'
                          ? `${COLORS.red}22`
                          : state.diagnosis.status === 'ACCEPTABLE'
                          ? `${COLORS.yellow}22`
                          : `${COLORS.green}22`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          state.diagnosis.status === 'BAD_QUALITY'
                            ? COLORS.red
                            : state.diagnosis.status === 'ACCEPTABLE'
                            ? COLORS.yellow
                            : COLORS.green,
                      },
                    ]}
                  >
                    {state.diagnosis.status.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.tapHint}>Tap to view ›</Text>
              </View>
            </View>
          </GlowCard>
        )}

        {/* ── Tech Pills ── */}
        <View style={styles.techPillsRow}>
          {TECH_PILLS.map((pill) => (
            <View key={pill.label} style={styles.techPill}>
              <Text style={styles.techPillIcon}>{pill.icon}</Text>
              <Text style={styles.techPillLabel}>{pill.label}</Text>
            </View>
          ))}
        </View>

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

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: SPACING.sm,
  },
  appTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.green,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Status Card
  statusCard: {
    padding: SPACING.md,
  },
  statusInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    gap: 2,
  },
  statusDot: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  pulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  // Lot Badge
  lotBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lotBadge: {
    backgroundColor: `${COLORS.green}18`,
    borderWidth: 1,
    borderColor: `${COLORS.green}44`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  lotBadgeText: {
    color: COLORS.green,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  lotBadgeHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  orbOuter: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  orbGradientRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  orb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.green,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
    }),
  },
  orbEmoji: {
    fontSize: 44,
  },
  poweredBy: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
    textAlign: 'center',
  },

  // Scan Button
  scanBtnWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },
  scanBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
  },
  scanBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#0a0a0f',
    letterSpacing: 0.3,
  },
  viewDiagnosisLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewDiagnosisText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.green,
    fontWeight: '500',
  },

  // Demo Mode
  demoCard: {
    padding: SPACING.md,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  demoTextGroup: {
    flex: 1,
    gap: 3,
  },
  demoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  demoSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  demoWarning: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.yellow,
    marginTop: 2,
  },

  // Recent Diagnosis
  recentDiagCard: {
    padding: SPACING.md,
  },
  recentDiagInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentDiagLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  recentDiagProduce: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  recentDiagRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusPillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tapHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
  },

  // Tech Pills
  techPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  techPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  techPillIcon: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  techPillLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  bottomPad: {
    height: SPACING.xl,
  },
});
