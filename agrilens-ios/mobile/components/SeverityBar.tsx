import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS } from '../constants/theme';

interface SeverityBarProps {
  score: number; // 0–10
  label: string;
}

export default function SeverityBar({ score, label }: SeverityBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: score / 10,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [score, widthAnim]);

  const getSeverityColor = () => {
    if (score <= 3) return COLORS.green;
    if (score <= 6) return COLORS.yellow;
    return COLORS.red;
  };

  const getSeverityLabel = () => {
    if (score <= 3) return 'LOW';
    if (score <= 5) return 'MEDIUM';
    if (score <= 7) return 'HIGH';
    return 'CRITICAL';
  };

  const color = getSeverityColor();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.labelText}>{label}</Text>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
          <Text style={styles.scoreDivider}> / 10</Text>
          <View style={[styles.severityPill, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
            <Text style={[styles.severityLabel, { color }]}>{getSeverityLabel()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.track}>
        {/* Gradient segments behind */}
        <View style={[styles.segment, { left: 0, width: '30%', backgroundColor: `${COLORS.green}33` }]} />
        <View style={[styles.segment, { left: '30%', width: '30%', backgroundColor: `${COLORS.yellow}33` }]} />
        <View style={[styles.segment, { left: '60%', width: '40%', backgroundColor: `${COLORS.red}33` }]} />

        {/* Animated fill */}
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleText}>0</Text>
        <Text style={styles.scaleText}>Low</Text>
        <Text style={styles.scaleText}>Medium</Text>
        <Text style={styles.scaleText}>High</Text>
        <Text style={styles.scaleText}>10</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  scoreDivider: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textDim,
    fontWeight: '400',
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  severityLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  track: {
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
    position: 'relative',
  },
  segment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: RADIUS.full,
    opacity: 0.85,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleText: {
    fontSize: FONT_SIZE.xs - 1,
    color: COLORS.textDim,
  },
});
