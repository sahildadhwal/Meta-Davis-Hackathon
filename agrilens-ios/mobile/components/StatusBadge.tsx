import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { CallStatusType } from '../types';
import { COLORS, RADIUS, FONT_SIZE } from '../constants/theme';

interface StatusBadgeProps {
  status: CallStatusType;
  message?: string;
}

export default function StatusBadge({ status, message }: StatusBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'dialing' || status === 'ringing' || status === 'connected') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const getColors = (): { bg: string; text: string; dot: string } => {
    switch (status) {
      case 'dialing':
      case 'ringing':
        return { bg: `${COLORS.yellow}22`, text: COLORS.yellow, dot: COLORS.yellow };
      case 'connected':
        return { bg: `${COLORS.green}22`, text: COLORS.green, dot: COLORS.green };
      case 'ended':
        return { bg: `${COLORS.blue}22`, text: COLORS.blue, dot: COLORS.blue };
      default:
        return { bg: `${COLORS.textDim}22`, text: COLORS.textMuted, dot: COLORS.textDim };
    }
  };

  const getLabel = (): string => {
    if (message) return message;
    switch (status) {
      case 'idle': return 'Idle';
      case 'dialing': return 'Dialing...';
      case 'ringing': return 'Ringing';
      case 'connected': return '● Live';
      case 'ended': return 'Completed';
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: colors.dot },
          (status === 'dialing' || status === 'ringing' || status === 'connected') && { opacity: pulseAnim },
        ]}
      />
      <Text style={[styles.label, { color: colors.text }]}>{getLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
