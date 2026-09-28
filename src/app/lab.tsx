import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sanitizeMargin } from '@/activities/core/geometry';
import type { RunOptions } from '@/activities/core/runOptions';
import type { ParamValues } from '@/activities/core/types';
import { LAB_DEFAULTS, labActivity, labParamsFrom } from '@/activities/lab/labDefinition';
import { ParamForm } from '@/components/params/ParamForm';
import { RunOptionsForm } from '@/components/params/RunOptionsForm';
import { estimateCanvas } from '@/components/player/ActivityRun';
import { ProgramPreview } from '@/components/player/ProgramPreview';
import { AppText, Button, Icon, Screen, Section } from '@/components/ui';
import { visibleFields } from '@/activities/core/config';
import { useDefaultRunOptions } from '@/hooks/useRunOptions';
import { useT } from '@/i18n';
import { useLab } from '@/store/labStore';
import { useSettings } from '@/store/settingsStore';
import { radius, spacing, useColors } from '@/theme';
import { formatDuration } from '@/utils/format';

export default function LabScreen() {
  const { t } = useT();
  const colors = useColors();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const safeMargin = sanitizeMargin(useSettings((s) => s.safeMargin));
  const defaults = useDefaultRunOptions();
  const stored = useLab();

  const [params, setParams] = useState<ParamValues>(() => labParamsFrom(stored.params));
  const [run, setRun] = useState<RunOptions>(() => ({ ...defaults, ...stored.run }));

  const canvas = useMemo(() => estimateCanvas(window, insets), [window, insets]);
  const totalMs = useMemo(
    () =>
      labActivity.build(labParamsFrom(params), { canvas, safeMargin, reduceMotion: false, seed: 1 })
        .totalMs,
    [params, canvas, safeMargin],
  );

  const onParams = (next: ParamValues) => {
    const clean = labParamsFrom(next);
    setParams(clean);
    stored.setParams(clean);
  };
  const onRun = (patch: Partial<RunOptions>) => {
    setRun((r) => ({ ...r, ...patch }));
    stored.setRun(patch);
  };

  const start = () => {
    stored.setParams(params);
    stored.setRun(run);
    router.push({ pathname: '/activity/[id]', params: { id: labActivity.id } });
  };

  const reset = () => {
    stored.reset();
    setParams({ ...LAB_DEFAULTS });
    setRun(defaults);
  };

  return (
    <Screen footer={<Button label={t('lab.startTest')} icon="play" onPress={start} />}>
      <View style={[styles.intro, { backgroundColor: colors.primaryTint }]}>
        <Icon name="flask-outline" color={colors.primary} size={24} />
        <AppText variant="small" style={styles.flex}>
          {t('lab.intro')}
        </AppText>
      </View>

      <View style={styles.previewRow}>
        <ProgramPreview
          definition={labActivity}
          params={params}
          canvas={canvas}
          width={Math.min(150, window.width * 0.36)}
          safeMargin={safeMargin}
        />
        <View style={styles.flex}>
          <AppText variant="caption" muted>
            {t('activities.duration')}
          </AppText>
          <AppText variant="title">{formatDuration(totalMs)}</AppText>
        </View>
      </View>

      <Section title={t('lab.activity')} boxed>
        <ParamForm
          fields={visibleFields(labActivity, params, true)}
          values={params}
          onChange={onParams}
        />
      </Section>

      <Section title={t('lab.presentation')} boxed>
        <RunOptionsForm value={run} onChange={onRun} dev />
      </Section>

      <Button label={t('lab.reset')} icon="restore" variant="ghost" size="md" onPress={reset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  intro: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
});
