import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { activities } from '@/activities';
import { MAX_SAFE_MARGIN, MIN_SAFE_MARGIN } from '@/activities/core/geometry';
import {
  AppText,
  Button,
  Divider,
  ListRow,
  Screen,
  Section,
  Stepper,
  ToggleRow,
} from '@/components/ui';
import { useT } from '@/i18n';
import { useDev } from '@/store/devStore';
import { useSettings } from '@/store/settingsStore';
import { radius, spacing, useColors } from '@/theme';

export default function DeveloperScreen() {
  const { t, l } = useT();
  const colors = useColors();
  const devMode = useSettings((s) => s.devMode);
  const debugOverlay = useSettings((s) => s.debugOverlay);
  const safeMargin = useSettings((s) => s.safeMargin);
  const update = useSettings((s) => s.update);
  const paramOverrides = useDev((s) => s.paramOverrides);
  const promptOverrides = useDev((s) => s.promptOverrides);
  const resetActivity = useDev((s) => s.resetActivity);
  const resetAll = useDev((s) => s.resetAll);

  const overridden = activities.all.filter(
    (d) => paramOverrides[d.id] || Object.keys(promptOverrides[d.id] ?? {}).length > 0,
  );

  return (
    <Screen>
      <View style={[styles.banner, { borderColor: colors.warning }]}>
        <AppText variant="bodyStrong" color={colors.warning}>
          {t('dev.banner')}
        </AppText>
        <AppText variant="small">{t('dev.howTo')}</AppText>
      </View>

      <Section boxed>
        <ToggleRow
          label={t('dev.enabled')}
          value={devMode}
          onValueChange={(v) => update({ devMode: v })}
        />
        <Divider />
        <ToggleRow
          label={t('dev.debugOverlay')}
          description={t('dev.debugOverlayDesc')}
          value={debugOverlay}
          onValueChange={(v) => update({ debugOverlay: v })}
        />
        <Divider />
        <View style={styles.field}>
          <AppText variant="bodyStrong">{t('dev.safeMargin')}</AppText>
          <AppText variant="small" muted>
            {t('dev.safeMarginDesc')}
          </AppText>
          <Stepper
            accessibilityLabel={t('dev.safeMargin')}
            value={safeMargin}
            min={MIN_SAFE_MARGIN}
            max={MAX_SAFE_MARGIN}
            step={0.01}
            onChange={(v) => update({ safeMargin: v })}
            format={(v) => v.toFixed(2)}
          />
        </View>
      </Section>

      <Section title={t('dev.overrides')} boxed>
        {overridden.length === 0 ? (
          <AppText muted style={styles.empty}>
            {t('dev.noOverrides')}
          </AppText>
        ) : (
          overridden.map((d, i) => (
            <View key={d.id}>
              {i > 0 ? <Divider /> : null}
              <ListRow
                icon={d.icon}
                title={l(d.name)}
                subtitle={Object.keys(paramOverrides[d.id] ?? {}).length ? 'params' : 'voice'}
                onPress={() => router.push({ pathname: '/activity/[id]', params: { id: d.id } })}
                right={
                  <Button
                    label={t('common.reset')}
                    variant="secondary"
                    size="md"
                    onPress={() => resetActivity(d.id)}
                  />
                }
              />
            </View>
          ))
        )}
      </Section>

      <Button label={t('dev.resetAll')} icon="restore" variant="danger" onPress={resetAll} />
      <Button
        label={t('home.lab')}
        icon="flask-outline"
        variant="secondary"
        onPress={() => router.push('/lab')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  field: { gap: spacing.sm, paddingVertical: spacing.md },
  empty: { paddingVertical: spacing.md },
});
