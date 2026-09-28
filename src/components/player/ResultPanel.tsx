import { Pressable, StyleSheet, View } from 'react-native';

import type { Difficulty } from '@/activities/core/types';
import { AppText, Button, Icon, Screen } from '@/components/ui';
import { useT } from '@/i18n';
import { radius, spacing, touch, useColors } from '@/theme';
import { COMFORT_ICONS, COMFORT_OPTIONS, type Comfort } from '@/types/session';
import { formatDuration } from '@/utils/format';

import type { RunResult } from './ActivityRun';

interface ResultPanelProps {
  title: string;
  result: RunResult;
  difficulty: Difficulty;
  /** Lab runs skip the comfort question and are not saved. */
  mode: 'activity' | 'lab';
  comfort: Comfort | null;
  onComfort: (c: Comfort) => void;
  onRepeat: () => void;
  onDone: () => void;
}

export function ResultPanel({
  title,
  result,
  difficulty,
  mode,
  comfort,
  onComfort,
  onRepeat,
  onDone,
}: ResultPanelProps) {
  const { t } = useT();
  const colors = useColors();
  const done = result.completed;

  return (
    <Screen
      topInset
      footer={
        <>
          <Button
            label={mode === 'lab' ? t('player.backToLab') : t('player.backToActivities')}
            icon={mode === 'lab' ? 'flask-outline' : 'view-grid-outline'}
            onPress={onDone}
          />
          <Button label={t('player.repeat')} icon="replay" variant="secondary" onPress={onRepeat} />
        </>
      }>
      <View style={styles.hero} accessible accessibilityLiveRegion="polite">
        <View
          style={[
            styles.badge,
            { backgroundColor: done ? colors.primaryTint : colors.surfaceAlt },
          ]}>
          <Icon
            name={done ? 'check-circle-outline' : 'stop-circle-outline'}
            color={done ? colors.primary : colors.textMuted}
            size={48}
          />
        </View>
        <AppText variant="display" center>
          {done ? t('player.completed') : t('player.stopped')}
        </AppText>
        <AppText muted center>
          {title}
        </AppText>
      </View>

      <View style={[styles.stats, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.stat}>
          <AppText variant="caption" muted>
            {t('player.timeSpent')}
          </AppText>
          <AppText variant="heading">{formatDuration(result.elapsedMs)}</AppText>
        </View>
        <View style={[styles.sep, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <AppText variant="caption" muted>
            {t('player.difficulty')}
          </AppText>
          <AppText variant="heading">{t(`difficulty.${difficulty}`)}</AppText>
        </View>
      </View>

      {mode === 'activity' && result.startedAt ? (
        <View style={styles.feedback}>
          <AppText variant="heading">{t('player.howEyes')}</AppText>
          <View style={styles.options} accessibilityRole="radiogroup">
            {COMFORT_OPTIONS.map((c) => {
              const selected = comfort === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => onComfort(c)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={t(`comfort.${c}`)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primaryTint : colors.surface,
                      borderWidth: selected ? 2 : 1,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  <Icon
                    name={COMFORT_ICONS[c]}
                    color={selected ? colors.primary : colors.textMuted}
                    size={28}
                  />
                  <AppText variant={selected ? 'bodyStrong' : 'small'} center>
                    {t(`comfort.${c}`)}
                  </AppText>
                  {selected ? <Icon name="check" color={colors.primary} size={16} /> : null}
                </Pressable>
              );
            })}
          </View>
          {comfort ? (
            <AppText variant="small" muted accessibilityLiveRegion="polite">
              {t('player.feedbackSaved')}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {mode === 'lab' ? (
        <AppText variant="small" muted center>
          {t('player.labNotSaved')}
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  sep: { width: 1, alignSelf: 'stretch' },
  feedback: { gap: spacing.md },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: touch.primary + 24,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: spacing.sm,
  },
});
