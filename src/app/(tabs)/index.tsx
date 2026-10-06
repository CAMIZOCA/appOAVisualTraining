import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { activities } from '@/activities';
import { ActivityCard } from '@/components/ActivityCard';
import { SessionRow } from '@/components/SessionRow';
import { AppText, Button, Card, Divider, Icon, Screen, Section, StatTile } from '@/components/ui';
import { brandAssets } from '@/constants/brandAssets';
import { useT } from '@/i18n';
import { useSessions } from '@/store/sessionsStore';
import { useSettings } from '@/store/settingsStore';
import { spacing, useColors } from '@/theme';
import { recommendedActivity } from '@/utils/recommend';
import { completedCount, currentStreak, minutesPracticed } from '@/utils/stats';

const QUICK_ACTIVITY = 'visual-break';

export default function HomeScreen() {
  const { t, l } = useT();
  const colors = useColors();
  const records = useSessions((s) => s.records);
  const devMode = useSettings((s) => s.devMode);
  const last = records[0];
  const lastDef = last ? activities.get(last.activityId) : undefined;
  const quick = activities.get(QUICK_ACTIVITY);
  const recommended = recommendedActivity(records);

  return (
    <Screen topInset>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image
            source={brandAssets.isotipo}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel={t('about.logo')}
            accessible
          />
          <View style={styles.flex}>
            <AppText variant="title">{t('app.name')}</AppText>
            <AppText variant="caption" color={colors.brandDeep}>
              {t('app.byBrand')}
            </AppText>
          </View>
          {devMode ? (
            <AppText variant="caption" color={colors.warning}>
              {t('dev.banner')}
            </AppText>
          ) : null}
        </View>
        <AppText muted>{t('app.tagline')}</AppText>
      </View>

      <Card tone="accent">
        <View style={styles.continue}>
          <AppText variant="heading">{t('home.continue')}</AppText>
          {last && lastDef ? (
            <>
              <AppText muted>
                {last.completed ? t('home.repeatLast') : t('home.resumeIncomplete')}:{' '}
                {l(lastDef.name)}
              </AppText>
              <Button
                label={l(lastDef.name)}
                icon={last.completed ? 'replay' : 'play'}
                onPress={() =>
                  router.push({ pathname: '/activity/[id]', params: { id: lastDef.id } })
                }
              />
            </>
          ) : (
            <>
              <AppText muted>{t('home.continueEmpty')}</AppText>
              {quick ? (
                <Button
                  label={l(quick.name)}
                  icon="play"
                  onPress={() =>
                    router.push({ pathname: '/activity/[id]', params: { id: quick.id } })
                  }
                />
              ) : null}
            </>
          )}
        </View>
      </Card>

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

      {quick ? (
        <Section title={t('home.quick')}>
          <ActivityCard definition={quick} compact />
        </Section>
      ) : null}

      {recommended ? (
        <Section title={t('home.recommended')}>
          <ActivityCard definition={recommended} />
        </Section>
      ) : null}

      {devMode ? (
        <Card
          onPress={() => router.push('/lab')}
          accessibilityLabel={`${t('home.lab')}. ${t('home.labDesc')}`}>
          <View style={styles.labRow}>
            <Icon name="flask-outline" color={colors.primary} size={26} />
            <View style={styles.flex}>
              <AppText variant="heading">{t('home.lab')}</AppText>
              <AppText variant="small" muted>
                {t('home.labDesc')}
              </AppText>
            </View>
            <Icon name="chevron-right" color={colors.textMuted} />
          </View>
        </Card>
      ) : null}

      {records.length > 0 ? (
        <Section title={t('home.recent')} boxed>
          {records.slice(0, 3).map((r, i) => (
            <View key={r.id}>
              {i > 0 ? <Divider /> : null}
              <SessionRow record={r} />
            </View>
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 44, height: 44 },
  continue: { gap: spacing.sm },
  stats: { flexDirection: 'row', gap: spacing.sm },
  labRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
