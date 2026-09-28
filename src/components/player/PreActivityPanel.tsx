import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { visibleFields } from '@/activities/core/config';
import { promptOverrideKey, resolvePrompt } from '@/activities/core/prompts';
import type { RunOptions } from '@/activities/core/runOptions';
import type { AnyActivityDefinition, Difficulty, ParamValues } from '@/activities/core/types';
import { ParamForm } from '@/components/params/ParamForm';
import { RunOptionsForm } from '@/components/params/RunOptionsForm';
import { AppText, Button, Chip, Divider, Icon, Screen, Section, ToggleRow } from '@/components/ui';
import { useT } from '@/i18n';
import { useDev } from '@/store/devStore';
import { radius, spacing, touch, useColors } from '@/theme';
import { formatDuration } from '@/utils/format';

interface PreActivityPanelProps {
  definition: AnyActivityDefinition;
  params: ParamValues;
  onParamsChange: (params: ParamValues) => void;
  run: RunOptions;
  onRunChange: (patch: Partial<RunOptions>) => void;
  devMode: boolean;
  estimatedMs: number;
  difficulty: Difficulty;
  onStart: () => void;
}

export function PreActivityPanel({
  definition,
  params,
  onParamsChange,
  run,
  onRunChange,
  devMode,
  estimatedMs,
  difficulty,
  onStart,
}: PreActivityPanelProps) {
  const { t, l, lang } = useT();
  const colors = useColors();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const userFields = visibleFields(definition, params, false);
  const devFields = visibleFields(definition, params, true).filter((f) => f.dev);
  const promptOverrides = useDev((s) => s.promptOverrides[definition.id]);
  const setPrompt = useDev((s) => s.setPrompt);
  const resetActivity = useDev((s) => s.resetActivity);

  return (
    <Screen
      topInset
      footer={
        <Button
          label={t('player.start')}
          icon="play"
          onPress={onStart}
          accessibilityHint={t('player.safetyReminder')}
        />
      }>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/activities'))}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={8}
          style={[styles.back, { backgroundColor: colors.surfaceAlt }]}>
          <Icon name="arrow-left" color={colors.text} />
        </Pressable>
        {devMode ? <Chip label={t('dev.banner')} icon="flask-outline" /> : null}
      </View>

      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: colors.primaryTint }]}>
          <Icon name={definition.icon} color={colors.primary} size={30} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="title">{l(definition.name)}</AppText>
          <AppText variant="small" muted>
            {t(`category.${definition.category}`)}
          </AppText>
        </View>
      </View>

      <View style={styles.meta}>
        <Chip
          label={`${t('player.duration')}: ${formatDuration(estimatedMs)}`}
          icon="timer-outline"
        />
        <Chip
          label={`${t('player.difficulty')}: ${t(`difficulty.${difficulty}`)}`}
          icon="signal-cellular-2"
        />
      </View>

      <Section title={t('player.purpose')}>
        <AppText>{l(definition.purpose)}</AppText>
      </Section>

      <Section title={t('player.instructions')}>
        {definition.instructions.map((ins, i) => (
          <View key={i} style={styles.step}>
            <View style={[styles.stepNum, { borderColor: colors.primary }]}>
              <AppText variant="caption" color={colors.primary}>
                {i + 1}
              </AppText>
            </View>
            <AppText style={styles.stepText}>{l(ins)}</AppText>
          </View>
        ))}
      </Section>

      <Section title={t('player.options')} boxed>
        <ParamForm fields={userFields} values={params} onChange={onParamsChange} />
        {userFields.length > 0 ? <Divider /> : null}
        <ToggleRow
          label={t('player.voice')}
          value={run.voice}
          onValueChange={(v) => onRunChange({ voice: v })}
        />
      </Section>

      {devMode ? (
        <View style={[styles.devBox, { borderColor: colors.warning }]}>
          <Pressable
            onPress={() => setAdvancedOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: advancedOpen }}
            style={styles.devHeader}>
            <Icon name="flask-outline" color={colors.warning} />
            <AppText variant="bodyStrong" style={styles.flex}>
              {t('player.advanced')}
            </AppText>
            <Icon name={advancedOpen ? 'chevron-up' : 'chevron-down'} color={colors.text} />
          </Pressable>
          {advancedOpen ? (
            <View style={styles.devBody}>
              <AppText variant="small" muted>
                {t('player.advancedHint')}
              </AppText>
              <ParamForm fields={devFields} values={params} onChange={onParamsChange} />
              <Divider />
              <AppText variant="heading" style={styles.subhead}>
                {t('player.runOptions')}
              </AppText>
              <RunOptionsForm value={run} onChange={onRunChange} dev showVoice={false} />
              <Divider />
              <AppText variant="heading" style={styles.subhead}>
                {t('player.voiceTexts')}
              </AppText>
              {Object.keys(definition.prompts).map((key) => (
                <View key={key} style={styles.promptField}>
                  <AppText variant="caption" muted>
                    {key}
                  </AppText>
                  <TextInput
                    multiline
                    accessibilityLabel={key}
                    value={resolvePrompt(definition, key, lang, promptOverrides)}
                    onChangeText={(text) => {
                      const original = resolvePrompt(definition, key, lang);
                      setPrompt(
                        definition.id,
                        promptOverrideKey(lang, key),
                        text === original ? null : text,
                      );
                    }}
                    style={[
                      styles.input,
                      {
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  />
                </View>
              ))}
              <Button
                label={t('player.resetOverrides')}
                variant="secondary"
                icon="restore"
                size="md"
                onPress={() => {
                  resetActivity(definition.id);
                  onParamsChange({ ...definition.defaultParams });
                }}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.notice, { backgroundColor: colors.surfaceAlt }]}>
        <Icon name="information-outline" color={colors.textMuted} size={20} />
        <AppText variant="small" muted style={styles.flex}>
          {t('player.safetyReminder')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: {
    width: touch.min,
    height: touch.min,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  headerText: { flex: 1, gap: 2 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepText: { flex: 1 },
  devBox: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.lg, padding: spacing.md },
  devHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: touch.min },
  devBody: { gap: spacing.sm },
  subhead: { marginTop: spacing.md },
  promptField: { gap: 4, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    minHeight: touch.min,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  notice: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
});
