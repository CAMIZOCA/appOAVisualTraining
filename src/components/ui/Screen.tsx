import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useColors } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Apply the top safe-area inset (screens without a native header). */
  topInset?: boolean;
  footer?: ReactNode;
  contentStyle?: ViewStyle;
}

export function Screen({
  children,
  scroll = true,
  topInset = false,
  footer,
  contentStyle,
}: ScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const padTop = (topInset ? insets.top : 0) + spacing.lg;
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: padTop }, contentStyle]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, { paddingTop: padTop }, contentStyle]}>
      {children}
    </View>
  );
  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {body}
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + spacing.md,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
});
