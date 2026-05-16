import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import TranscriptBubble from '../components/TranscriptBubble';
import AITypingIndicator from '../components/AITypingIndicator';
import WaveAnimation from '../components/WaveAnimation';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';

// ─── Waiting Dots ─────────────────────────────────────────────────────────────

function WaitingDots() {
  const dot1 = useRef(new Animated.Value(0.2)).current;
  const dot2 = useRef(new Animated.Value(0.2)).current;
  const dot3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.2, duration: 350, useNativeDriver: true }),
          Animated.delay(Math.max(0, 700 - delay)),
        ]),
      );

    const a1 = animateDot(dot1, 0);
    const a2 = animateDot(dot2, 200);
    const a3 = animateDot(dot3, 400);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={dotStyles.container}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[dotStyles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textDim,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CallScreen() {
  const router = useRouter();
  const { state, dispatch, callBob } = useApp();
  const { callStatus, transcripts, callLanguage } = state;

  const scrollRef = useRef<ScrollView>(null);
  const langBadgeAnim = useRef(new Animated.Value(0)).current;
  const avatarGlow = useRef(new Animated.Value(0.4)).current;
  const [showTyping, setShowTyping] = useState(false);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timeout);
  }, [transcripts.length, showTyping]);

  // Show typing indicator after Bob speaks
  useEffect(() => {
    if (callStatus.status === 'connected' && transcripts.length > 0) {
      const last = transcripts[transcripts.length - 1];
      if (last.speaker === 'Bob') {
        setShowTyping(true);
        const t = setTimeout(() => setShowTyping(false), 3500);
        return () => clearTimeout(t);
      }
    }
    return undefined;
  }, [transcripts.length, callStatus.status]);

  // Language badge animation
  useEffect(() => {
    if (callLanguage === 'es') {
      Animated.spring(langBadgeAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      langBadgeAnim.setValue(0);
    }
  }, [callLanguage, langBadgeAnim]);

  // Avatar glow when connected
  useEffect(() => {
    if (callStatus.status === 'connected') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(avatarGlow, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(avatarGlow, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      avatarGlow.setValue(0.4);
      return undefined;
    }
  }, [callStatus.status, avatarGlow]);

  const handleStartCall = async () => {
    dispatch({ type: 'CLEAR_TRANSCRIPTS' });
    try {
      await callBob();
    } catch (_err) {
      // handled inside callBob
    }
  };

  const handleEndCall = () => {
    dispatch({
      type: 'SET_CALL_STATUS',
      payload: { status: 'ended', message: 'Call ended by user' },
    });
  };

  const isActive =
    callStatus.status === 'dialing' ||
    callStatus.status === 'ringing' ||
    callStatus.status === 'connected';

  const showBobCard = isActive || callStatus.status === 'ended';

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live AI Conversation</Text>
        <StatusBadge status={callStatus.status} message={callStatus.message} />
      </View>

      {/* ── Main Scroll ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Bob's Card */}
        {showBobCard && (
          <View style={styles.bobCard}>
            <View style={styles.avatarSection}>
              <Animated.View
                style={[
                  styles.avatarGlowRing,
                  {
                    opacity: avatarGlow,
                    borderColor:
                      callStatus.status === 'connected' ? COLORS.green : COLORS.cardBorder,
                  },
                ]}
              />
              <View
                style={[
                  styles.avatar,
                  callStatus.status === 'connected' && styles.avatarConnected,
                ]}
              >
                <Text style={styles.avatarEmoji}>👨‍🌾</Text>
              </View>
            </View>
            <View style={styles.bobInfo}>
              <Text style={styles.bobName}>Bob — Field Worker</Text>
              <Text style={styles.bobStatus}>{callStatus.message}</Text>
            </View>
            <WaveAnimation active={callStatus.status === 'connected'} />
          </View>
        )}

        {/* Language Badge */}
        {callLanguage === 'es' && (
          <Animated.View
            style={[
              styles.langBadge,
              {
                opacity: langBadgeAnim,
                transform: [
                  {
                    translateY: langBadgeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.langBadgeText}>🇲🇽 Switched to Spanish</Text>
          </Animated.View>
        )}

        {/* Transcript Feed */}
        <View style={styles.transcriptSection}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptTitle}>Conversation</Text>
            <Text style={styles.transcriptSub}>
              {callLanguage === 'es' ? 'Spanish | English Translation' : 'English'}
            </Text>
          </View>

          <View style={styles.messagesList}>
            {transcripts.length === 0 ? (
              <View style={styles.emptyTranscript}>
                <WaitingDots />
                <Text style={styles.waitingText}>Waiting for conversation to begin...</Text>
              </View>
            ) : (
              transcripts.map((t) => <TranscriptBubble key={t.id} transcript={t} />)
            )}
            {showTyping && <AITypingIndicator />}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Controls ── */}
      <View style={styles.controls}>
        {callStatus.status === 'idle' || callStatus.status === 'ended' ? (
          <TouchableOpacity
            onPress={handleStartCall}
            activeOpacity={0.85}
            style={styles.startCallWrapper}
          >
            <LinearGradient
              colors={['#00ff88', '#00cc6a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startCallBtn}
            >
              <Ionicons name="call" size={20} color="#0a0a0f" />
              <Text style={styles.startCallText}>
                {callStatus.status === 'ended' ? 'Call Again' : 'Start Call'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEndCall}
            activeOpacity={0.85}
            style={styles.endCallWrapper}
          >
            <View style={styles.endCallBtn}>
              <Ionicons
                name="call"
                size={20}
                color={COLORS.red}
                style={{ transform: [{ rotate: '135deg' }] }}
              />
              <Text style={styles.endCallText}>End Call</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLink}
          activeOpacity={0.7}
        >
          <Text style={styles.backLinkText}>← Back to Diagnosis</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },

  // Bob's Card
  bobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
  },
  avatarSection: {
    position: 'relative',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlowRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarConnected: {
    borderColor: COLORS.green,
    backgroundColor: '#0a1a10',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  bobInfo: {
    flex: 1,
    gap: 2,
  },
  bobName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  bobStatus: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },

  // Language Badge
  langBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.green}18`,
    borderWidth: 1,
    borderColor: `${COLORS.green}44`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  langBadgeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.green,
    fontWeight: '600',
  },

  // Transcript
  transcriptSection: {
    gap: SPACING.sm,
  },
  transcriptHeader: {
    gap: 2,
  },
  transcriptTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  transcriptSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
  },
  messagesList: {
    gap: 2,
    minHeight: 180,
  },
  emptyTranscript: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  waitingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDim,
    fontStyle: 'italic',
  },

  // Controls
  controls: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    gap: SPACING.sm,
  },
  startCallWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  startCallText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#0a0a0f',
  },
  endCallWrapper: {
    borderRadius: RADIUS.lg,
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: SPACING.sm,
    backgroundColor: `${COLORS.red}18`,
    borderWidth: 1,
    borderColor: `${COLORS.red}44`,
    borderRadius: RADIUS.lg,
  },
  endCallText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.red,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backLinkText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  bottomPad: {
    height: SPACING.lg,
  },
});
