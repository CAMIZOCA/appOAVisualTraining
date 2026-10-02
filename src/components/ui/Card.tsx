import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { radius, shadow, spacing, useColors } from '@/theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  tone?: 'default' | 'accent' | 'brand';
}

export function Card({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
  tone = 'default',
}: CardProps) {
  const colors = useColors();
  const base = [
    styles.card,
    shadow,
    tone === 'accent'
      ? { backgroundColor: colors.primaryTint, borderColor: colors.primary }
      : tone === 'brand'
        ? { backgroundColor: colors.accentTint, borderColor: colors.accent }
        : { backgroundColor: colors.surface, borderColor: colors.border },
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [...base, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
