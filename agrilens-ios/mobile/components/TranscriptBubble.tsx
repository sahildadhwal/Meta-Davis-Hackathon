import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Transcript } from '../types';
import { COLORS, FONT_SIZE, RADIUS } from '../constants/theme';

interface TranscriptBubbleProps {
  transcript: Transcript;
}

export default function TranscriptBubble({ transcript }: TranscriptBubbleProps) {
  const isAI = transcript.speaker === 'AI';
  const slideAnim = useRef(new Animated.Value(isAI ? 40 : -40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const time = new Date(transcript.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isSpanish = transcript.lang === 'es';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        isAI ? styles.wrapperRight : styles.wrapperLeft,
        { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
      ]}
    >
      {/* Speaker label row */}
      <View style={[styles.labelRow, isAI ? styles.labelRowRight : styles.labelRowLeft]}>
        {isSpanish && <Text style={styles.flag}>🇲🇽</Text>}
        <Text style={[styles.speakerLabel, { color: isAI ? COLORS.purple : COLORS.textMuted }]}>
          {isAI ? 'AgriLens AI' : 'Bob · Field Worker'}
        </Text>
        <Text style={styles.timestamp}>{time}</Text>
      </View>

      {/* Bubble */}
      <View
        style={[
          styles.bubble,
          isAI
            ? { backgroundColor: '#2d1b69', borderColor: `${COLORS.purple}55` }
            : { backgroundColor: '#1a1a28', borderColor: COLORS.cardBorder },
        ]}
      >
        <Text style={[styles.originalText, isAI ? styles.aiText : styles.bobText]}>
          {transcript.text}
        </Text>

        {transcript.translation && (
          <View style={styles.translationContainer}>
            <View style={styles.divider} />
            <Text style={styles.translationLabel}>EN</Text>
            <Text style={styles.translationText}>{transcript.translation}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: '85%',
    marginVertical: 6,
    gap: 4,
  },
  wrapperRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  labelRowRight: {
    justifyContent: 'flex-end',
  },
  labelRowLeft: {
    justifyContent: 'flex-start',
  },
  speakerLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  timestamp: {
    fontSize: FONT_SIZE.xs - 1,
    color: COLORS.textDim,
  },
  flag: {
    fontSize: 12,
  },
  bubble: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  originalText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 21,
    fontWeight: '400',
  },
  aiText: {
    color: '#ddd6fe',
  },
  bobText: {
    color: COLORS.text,
  },
  translationContainer: {
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#ffffff15',
  },
  translationLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
    fontWeight: '600',
    letterSpacing: 1,
  },
  translationText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
