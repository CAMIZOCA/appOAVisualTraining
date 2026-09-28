import { StyleSheet, Switch, View } from 'react-native';

import { spacing, touch, useColors } from '@/theme';

import { AppText } from './AppText';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ label, description, value, onValueChange }: ToggleRowProps) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {description ? (
          <AppText variant="small" muted>
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        accessibilityHint={description}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.border}
      />
    </View>
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
  text: { flex: 1, gap: 2 },
});
