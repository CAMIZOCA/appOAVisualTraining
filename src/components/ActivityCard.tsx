import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { estimateDurationMs } from '@/activities/core/program';
import type { AnyActivityDefinition } from '@/activities/core/types';
import { AppText, Card, Icon } from '@/components/ui';
import { useT } from '@/i18n';
import { radius, spacing, useColors } from '@/theme';
import { formatDuration } from '@/utils/format';

interface ActivityCardProps {
  definition: AnyActivityDefinition;
  compact?: boolean;
}

function Meta({ icon, label }: { icon: string; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} color={colors.textMuted} size={16} />
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

export function ActivityCard({ definition, compact }: ActivityCardProps) {
  const { t, l } = useT();
  const colors = useColors();
  const duration = formatDuration(estimateDurationMs(definition, definition.defaultParams));
  const name = l(definition.name);
  const difficulty = t(`difficulty.${definition.difficulty}`);
  const category = t(`category.${definition.category}`);

  return (
    <Card
      onPress={() => router.push({ pathname: '/activity/[id]', params: { id: definition.id } })}
      accessibilityLabel={`${name}. ${l(definition.description)}. ${t('activities.duration')}: ${duration}. ${t('activities.difficulty')}: ${difficulty}. ${category}`}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.primaryTint }]}>
          <Icon name={definition.icon} color={colors.primary} size={26} />
        </View>
        <View style={styles.body}>
          <AppText variant="heading">{name}</AppText>
          {!compact ? (
            <AppText variant="small" muted numberOfLines={2}>
              {l(definition.description)}
            </AppText>
          ) : null}
          <View style={styles.meta}>
            <Meta icon="timer-outline" label={duration} />
            <Meta icon="signal-cellular-2" label={difficulty} />
            <Meta icon="tag-outline" label={category} />
          </View>
        </View>
        <Icon name="chevron-right" color={colors.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: 2, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
