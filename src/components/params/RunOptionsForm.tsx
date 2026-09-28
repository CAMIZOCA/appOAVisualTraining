import { StyleSheet, View } from 'react-native';

import {
  CANVAS_THEMES,
  resolveTargetSizePx,
  TARGET_SIZES,
  TARGET_TYPES,
  type RunOptions,
} from '@/activities/core/runOptions';
import { TargetShape } from '@/components/player/TargetShape';
import { AppText, Divider, SegmentedControl, Stepper, ToggleRow } from '@/components/ui';
import { useT } from '@/i18n';
import { canvasThemes, radius, spacing } from '@/theme';

interface RunOptionsFormProps {
  value: RunOptions;
  onChange: (patch: Partial<RunOptions>) => void;
  /** Show developer-only controls (exact px size, debug overlay). */
  dev: boolean;
  showVoice?: boolean;
}

/** Target presentation options with a live preview of the target on the chosen background. */
export function RunOptionsForm({ value, onChange, dev, showVoice = true }: RunOptionsFormProps) {
  const { t } = useT();
  const theme = canvasThemes[value.canvasTheme];
  const sizePx = resolveTargetSizePx(value);

  return (
    <View>
      <View
        style={[styles.preview, { backgroundColor: theme.background, borderColor: theme.guide }]}>
        <TargetShape
          type={value.targetType}
          size={sizePx}
          color={theme.target}
          inner={theme.targetInner}
        />
      </View>
      <View style={styles.field}>
        <AppText variant="bodyStrong">{t('run.targetType')}</AppText>
        <SegmentedControl
          accessibilityLabel={t('run.targetType')}
          value={value.targetType}
          onChange={(v) => onChange({ targetType: v })}
          options={TARGET_TYPES.map((v) => ({ value: v, label: t(`target.${v}`) }))}
        />
      </View>
      <Divider />
      <View style={styles.field}>
        <AppText variant="bodyStrong">{t('run.targetSize')}</AppText>
        <SegmentedControl
          accessibilityLabel={t('run.targetSize')}
          value={value.targetSizePx === null ? value.targetSize : ('custom' as const)}
          onChange={(v) => {
            if (v !== 'custom') onChange({ targetSize: v, targetSizePx: null });
          }}
          options={TARGET_SIZES.map((v) => ({ value: v, label: t(`targetSize.${v}`) }))}
        />
      </View>
      {dev ? (
        <View style={styles.field}>
          <AppText variant="bodyStrong">{t('run.targetSizePx')}</AppText>
          <Stepper
            accessibilityLabel={t('run.targetSizePx')}
            value={sizePx}
            min={8}
            max={96}
            step={2}
            onChange={(v) => onChange({ targetSizePx: v })}
            format={(v) => `${v} px`}
          />
        </View>
      ) : null}
      <Divider />
      <View style={styles.field}>
        <AppText variant="bodyStrong">{t('run.canvasTheme')}</AppText>
        <SegmentedControl
          accessibilityLabel={t('run.canvasTheme')}
          value={value.canvasTheme}
          onChange={(v) => onChange({ canvasTheme: v })}
          options={CANVAS_THEMES.map((v) => ({ value: v, label: t(`canvas.${v}`) }))}
        />
      </View>
      {showVoice ? (
        <>
          <Divider />
          <ToggleRow
            label={t('player.voice')}
            value={value.voice}
            onValueChange={(v) => onChange({ voice: v })}
          />
        </>
      ) : null}
      {dev ? (
        <>
          <Divider />
          <ToggleRow
            label={t('run.debug')}
            description={t('dev.debugOverlayDesc')}
            value={value.debug}
            onValueChange={(v) => onChange({ debug: v })}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm, paddingVertical: spacing.md },
  preview: {
    height: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
});
