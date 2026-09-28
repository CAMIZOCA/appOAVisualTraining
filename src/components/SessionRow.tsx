import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { activities } from '@/activities';
import { AppText, Icon } from '@/components/ui';
import { useT } from '@/i18n';
import { spacing, touch, useColors } from '@/theme';
import { COMFORT_ICONS, type SessionRecord } from '@/types/session';
import { formatDateTime, formatDuration } from '@/utils/format';

export function SessionRow({ record }: { record: SessionRecord }) {
  const { t, l, lang } = useT();
  const colors = useColors();
  const def = activities.get(record.activityId);
  const name = def ? l(def.name) : record.activityName;
  const status = record.completed ? t('sessions.completed') : t('sessions.incomplete');
  const comfort = record.comfort ? t(`comfort.${record.comfort}`) : null;
  const when = formatDateTime(record.startedAt, lang);
  const duration = formatDuration(record.durationMs);

  return (
    <Pressable
      disabled={!def}
      onPress={() => router.push({ pathname: '/activity/[id]', params: { id: record.activityId } })}
      accessibilityRole="button"
      accessibilityLabel={[name, when, duration, status, comfort].filter(Boolean).join('. ')}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Icon
        name={record.completed ? 'check-circle-outline' : 'progress-clock'}
        color={record.completed ? colors.primary : colors.textMuted}
      />
      <View style={styles.body}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="small" muted>
          {when} · {duration} · {status}
        </AppText>
      </View>
      {record.comfort ? (
        <View style={styles.comfort}>
          <Icon name={COMFORT_ICONS[record.comfort]} color={colors.textMuted} size={20} />
          <AppText variant="caption" muted numberOfLines={1}>
            {comfort}
          </AppText>
        </View>
      ) : null}
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
  body: { flex: 1, gap: 2 },
  comfort: { alignItems: 'center', maxWidth: 88 },
});
