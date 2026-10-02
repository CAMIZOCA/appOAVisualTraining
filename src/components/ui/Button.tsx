import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { fonts, radius, spacing, touch, useColors } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: string;
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
  /** Override colors (used on activity canvases). */
  tint?: { background: string; foreground: string; border?: string };
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  size = 'lg',
  disabled,
  loading,
  accessibilityHint,
  style,
  tint,
}: ButtonProps) {
  const colors = useColors();
  const scheme = tint
    ? { bg: tint.background, fg: tint.foreground, border: tint.border ?? 'transparent' }
    : {
        primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
        accent: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
        secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
        ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
        danger: { bg: colors.dangerTint, fg: colors.danger, border: colors.dangerTint },
      }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: size === 'lg' ? touch.primary : touch.min,
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={scheme.fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} color={scheme.fg} size={size === 'lg' ? 22 : 20} /> : null}
          <AppText
            variant="bodyStrong"
            color={scheme.fg}
            numberOfLines={2}
            center
            style={styles.label}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontFamily: fonts.headingSemiBold },
});
