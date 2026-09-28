import { StyleSheet, Text, type TextProps } from 'react-native';

import { typography, useColors, type TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  muted?: boolean;
  center?: boolean;
}

export function AppText({ variant = 'body', color, muted, center, style, ...rest }: AppTextProps) {
  const colors = useColors();
  const isHeading = variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      style={[
        typography[variant],
        { color: color ?? (muted ? colors.textMuted : colors.text) },
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({ center: { textAlign: 'center' } });
