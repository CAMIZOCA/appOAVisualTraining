import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, touch, useColors } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface StepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  accessibilityLabel: string;
}

function roundToStep(value: number, step: number) {
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number(value.toFixed(decimals));
}

/** Precise numeric input with large −/+ buttons (preferred over sliders for clinical tuning). */
export function Stepper({
  value,
  min,
  max,
  step,
  onChange,
  format,
  accessibilityLabel,
}: StepperProps) {
  const colors = useColors();
  const set = (next: number) => onChange(roundToStep(Math.min(max, Math.max(min, next)), step));
  const label = format ? format(value) : String(value);

  const button = (dir: -1 | 1) => {
    const disabled = dir < 0 ? value <= min : value >= max;
    return (
      <Pressable
        onPress={() => set(value + dir * step)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} ${dir < 0 ? '−' : '+'}`}
        accessibilityState={{ disabled }}
        hitSlop={4}
        style={({ pressed }) => [
          styles.btn,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: disabled ? 0.35 : pressed ? 0.7 : 1,
          },
        ]}>
        <Icon name={dir < 0 ? 'minus' : 'plus'} color={colors.text} />
      </Pressable>
    );
  };

  return (
    <View
      style={styles.row}
      accessible={false}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: label }}>
      {button(-1)}
      <AppText variant="bodyStrong" style={styles.value} center>
        {label}
      </AppText>
      {button(1)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btn: {
    width: touch.min,
    height: touch.min,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 72 },
});
