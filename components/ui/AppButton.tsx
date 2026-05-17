import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, fontSize, borderRadius, fontWeight } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const bgMap: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.surface,
  ghost: 'transparent',
};

const textColorMap: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.text,
  ghost: colors.primary,
};

const borderMap: Record<Variant, string | undefined> = {
  primary: undefined,
  secondary: colors.border,
  ghost: undefined,
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = true,
  accessibilityLabel,
}: AppButtonProps) {
  const borderColor = borderMap[variant];
  const containerStyle: ViewStyle = {
    backgroundColor: disabled ? colors.surface : bgMap[variant],
    borderWidth: borderColor ? 1 : 0,
    borderColor: borderColor ?? undefined,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        containerStyle,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.label,
          { color: disabled ? colors.textDisabled : textColorMap[variant] },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
