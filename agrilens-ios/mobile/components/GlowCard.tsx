import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

interface GlowCardProps {
  children: React.ReactNode;
  glowColor?: 'green' | 'purple' | 'red' | 'none';
  style?: ViewStyle;
  onPress?: () => void;
}

export default function GlowCard({ children, glowColor = 'none', style, onPress }: GlowCardProps) {
  const glowStyle =
    glowColor === 'green'
      ? SHADOWS.green
      : glowColor === 'purple'
      ? SHADOWS.purple
      : glowColor === 'red'
      ? SHADOWS.red
      : {};

  const borderColor =
    glowColor === 'green'
      ? `${COLORS.green}33`
      : glowColor === 'purple'
      ? `${COLORS.purple}55`
      : glowColor === 'red'
      ? `${COLORS.red}44`
      : COLORS.cardBorder;

  const content = (
    <View style={[styles.card, { borderColor }, glowStyle, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 16,
  },
});
