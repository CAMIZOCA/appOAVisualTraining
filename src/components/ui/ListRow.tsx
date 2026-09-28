import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, touch, useColors } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: string;
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  accessibilityHint?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  right,
  onPress,
  destructive,
  accessibilityHint,
}: ListRowProps) {
  const colors = useColors();
  const fg = destructive ? colors.danger : colors.text;
  const content = (
    <>
      {icon ? (
        <View
          style={[
            styles.icon,
            { backgroundColor: destructive ? colors.dangerTint : colors.primaryTint },
          ]}>
          <Icon name={icon} color={destructive ? colors.danger : colors.primary} size={20} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText variant="bodyStrong" color={fg}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="small" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" color={colors.textMuted} /> : null)}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touch.min + 8,
    paddingVertical: spacing.sm,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
});
