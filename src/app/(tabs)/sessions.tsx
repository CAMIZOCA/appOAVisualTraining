import { StyleSheet, View } from 'react-native';

import { SessionRow } from '@/components/SessionRow';
import { AppText, Divider, Icon, Screen, Section, StatTile } from '@/components/ui';
import { localeOf, useT } from '@/i18n';
import { useSessions } from '@/store/sessionsStore';
import { radius, spacing, useColors } from '@/theme';
import {
  completedCount,
  currentStreak,
  minutesPracticed,
  sessionsThisWeek,
  sessionsToday,
  startOfWeek,
  summarize,
  weekDailyMinutes,
} from '@/utils/stats';

const RECENT_LIMIT = 20;

function WeekBars({ minutes }: { minutes: number[] }) {
  const { lang } = useT();
  const colors = useColors();
  const max = Math.max(1, ...minutes);
  const monday = startOfWeek(new Date());
  const today = (new Date().getDay() + 6) % 7;
  const label = (i: number) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString(localeOf(lang), { weekday: 'narrow' });
  };
  return (
    <View style={styles.bars}>
      {minutes.map((m, i) => (
        <View
          key={i}
          style={styles.barCol}
          accessible
          accessibilityLabel={`${new Date(monday.getTime() + i * 86_400_000).toLocaleDateString(localeOf(lang), { weekday: 'long' })}: ${m} min`}>
          <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                styles.barFill,
                {
                  height: `${(m / max) * 100}%`,
                  backgroundColor: i === today ? colors.primary : colors.textMuted,
                },
              ]}
            />
          </View>
          <AppText variant="caption" muted={i !== today}>
            {label(i)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export default function SessionsScreen() {
  const { t } = useT();
  const colors = useColors();
  const records = useSessions((s) => s.records);
  const today = summarize(sessionsToday(records));
  const week = sessionsThisWeek(records);
  const weekSummary = summarize(week);

  return (
    <Screen topInset>
      <AppText variant="display">{t('sessions.title')}</AppText>

      <View style={styles.stats}>
        <StatTile
          icon="check-decagram-outline"
          label={t('stats.completed')}
          value={String(completedCount(records))}
        />
        <StatTile
          icon="timer-outline"
          label={t('stats.minutes')}
          value={String(minutesPracticed(records))}
        />
        <StatTile
          icon="fire"
          label={t('stats.streak')}
          value={t('stats.streakDays', { n: currentStreak(records) })}
        />
      </View>

      {records.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surfaceAlt }]}>
          <Icon name="calendar-blank-outline" color={colors.textMuted} size={32} />
          <AppText muted center>
            {t('sessions.empty')}
          </AppText>
        </View>
      ) : (
        <>
          <Section title={t('sessions.today')} boxed>
            <View style={styles.summary}>
              <AppText variant="bodyStrong">
                {today.count === 1
                  ? t('sessions.countOne')
                  : t('sessions.count', { n: today.count })}
              </AppText>
              <AppText muted>
                {t('sessions.totalTime')}: {t('common.minutes', { n: today.minutes })}
              </AppText>
            </View>
          </Section>

          <Section title={t('sessions.week')} boxed>
            <View style={styles.summary}>
              <AppText variant="bodyStrong">
                {weekSummary.count === 1
                  ? t('sessions.countOne')
                  : t('sessions.count', { n: weekSummary.count })}
              </AppText>
              <AppText muted>
                {t('sessions.totalTime')}: {t('common.minutes', { n: weekSummary.minutes })}
              </AppText>
            </View>
            <WeekBars minutes={weekDailyMinutes(records)} />
          </Section>

          <Section title={t('sessions.recent')} boxed>
            {records.slice(0, RECENT_LIMIT).map((r, i) => (
              <View key={r.id}>
                {i > 0 ? <Divider /> : null}
                <SessionRow record={r} />
              </View>
            ))}
          </Section>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, borderRadius: radius.lg },
  summary: { paddingVertical: spacing.md, gap: 2 },
  bars: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.md, height: 110 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: {
    flex: 1,
    width: '70%',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 4, minHeight: 2 },
});
