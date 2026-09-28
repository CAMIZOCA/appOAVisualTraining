import { StyleSheet, View } from 'react-native';

import { radius, spacing, useColors } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface StatTileProps {
  label: string;
  value: string;
  icon: string;
}

export function StatTile({ label, value, icon }: StatTileProps) {
  const colors = useColors();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon name={icon} color={colors.primary} size={20} />
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" muted numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: 2,
    minWidth: 96,
  },
});
