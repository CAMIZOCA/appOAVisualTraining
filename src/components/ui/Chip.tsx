import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, touch, useColors } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
}

/** Selectable chip. Selection is shown with a check icon and weight, not only color. */
export function Chip({ label, selected, onPress, icon }: ChipProps) {
  const colors = useColors();
  const content = (
    <>
      {selected ? (
        <Icon name="check" size={16} color={colors.primary} />
      ) : icon ? (
        <Icon name={icon} size={16} color={colors.textMuted} />
      ) : null}
      <AppText
        variant={selected ? 'bodyStrong' : 'small'}
        color={selected ? colors.primary : colors.text}>
        {label}
      </AppText>
    </>
  );
  const style = [
    styles.chip,
    {
      backgroundColor: selected ? colors.primaryTint : colors.surface,
      borderColor: selected ? colors.primary : colors.border,
    },
  ];
  if (!onPress) return <View style={[style, styles.static]}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      hitSlop={4}
      style={({ pressed }) => [...style, pressed && { opacity: 0.8 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touch.min - 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  static: { minHeight: 28, paddingHorizontal: spacing.sm },
});
