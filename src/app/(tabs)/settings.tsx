import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Platform, View } from 'react-native';

import { CANVAS_THEMES, TARGET_SIZES, TARGET_TYPES } from '@/activities/core/runOptions';
import type { SpeedLevel } from '@/activities/core/types';
import {
  AppText,
  Divider,
  ListRow,
  Screen,
  Section,
  SegmentedControl,
  Stepper,
  ToggleRow,
} from '@/components/ui';
import { useT } from '@/i18n';
import { resetLocalData } from '@/services/resetData';
import { useSettings } from '@/store/settingsStore';
import { spacing } from '@/theme';
import { contactUrls, openLink } from '@/utils/contact';

const SPEEDS: SpeedLevel[] = ['verySlow', 'slow', 'medium', 'fast'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm, paddingVertical: spacing.md }}>
      <AppText variant="bodyStrong">{label}</AppText>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useT();
  const s = useSettings();
  const update = s.update;

  const confirmReset = () => {
    const run = () => {
      resetLocalData().then(() => {
        if (Platform.OS === 'web') window.alert(t('settings.resetDone'));
        else Alert.alert(t('settings.resetDone'));
      });
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`${t('settings.resetConfirmTitle')}\n\n${t('settings.resetConfirmBody')}`))
        run();
      return;
    }
    Alert.alert(t('settings.resetConfirmTitle'), t('settings.resetConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.reset'), style: 'destructive', onPress: run },
    ]);
  };

  return (
    <Screen topInset>
      <AppText variant="display">{t('settings.title')}</AppText>

      <Section title={t('settings.experience')} boxed>
        <ToggleRow
          label={t('settings.voice')}
          description={t('settings.voiceDesc')}
          value={s.voiceEnabled}
          onValueChange={(v) => update({ voiceEnabled: v })}
        />
        {s.voiceEnabled ? (
          <Field label={t('settings.speechRate')}>
            <Stepper
              value={s.speechRate}
              min={0.6}
              max={1.3}
              step={0.05}
              onChange={(v) => update({ speechRate: v })}
              format={(v) => `${v.toFixed(2)}×`}
              accessibilityLabel={t('settings.speechRate')}
            />
          </Field>
        ) : null}
        <Divider />
        <ToggleRow
          label={t('settings.haptics')}
          description={t('settings.hapticsDesc')}
          value={s.hapticsEnabled}
          onValueChange={(v) => update({ hapticsEnabled: v })}
        />
        <Divider />
        <ToggleRow
          label={t('settings.sound')}
          description={t('settings.soundDesc')}
          value={s.soundEnabled}
          onValueChange={(v) => update({ soundEnabled: v })}
        />
        <Divider />
        <Field label={t('settings.language')}>
          <SegmentedControl
            accessibilityLabel={t('settings.language')}
            value={s.language}
            onChange={(v) => update({ language: v })}
            options={[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'English' },
            ]}
          />
        </Field>
      </Section>

      <Section title={t('settings.exercise')} boxed>
        <Field label={t('settings.defaultSpeed')}>
          <SegmentedControl
            accessibilityLabel={t('settings.defaultSpeed')}
            value={s.defaultSpeed}
            onChange={(v) => update({ defaultSpeed: v })}
            options={SPEEDS.map((v) => ({ value: v, label: t(`speed.${v}`) }))}
          />
        </Field>
        <Divider />
        <Field label={t('settings.targetType')}>
          <SegmentedControl
            accessibilityLabel={t('settings.targetType')}
            value={s.targetType}
            onChange={(v) => update({ targetType: v })}
            options={TARGET_TYPES.map((v) => ({ value: v, label: t(`target.${v}`) }))}
          />
        </Field>
        <Divider />
        <Field label={t('settings.targetSize')}>
          <SegmentedControl
            accessibilityLabel={t('settings.targetSize')}
            value={s.targetSize}
            onChange={(v) => update({ targetSize: v })}
            options={TARGET_SIZES.map((v) => ({ value: v, label: t(`targetSize.${v}`) }))}
          />
        </Field>
        <Divider />
        <Field label={t('settings.canvasTheme')}>
          <SegmentedControl
            accessibilityLabel={t('settings.canvasTheme')}
            value={s.canvasTheme}
            onChange={(v) => update({ canvasTheme: v })}
            options={CANVAS_THEMES.map((v) => ({ value: v, label: t(`canvas.${v}`) }))}
          />
        </Field>
      </Section>

      <Section title={t('settings.accessibility')} boxed>
        <ToggleRow
          label={t('settings.highContrast')}
          description={t('settings.highContrastDesc')}
          value={s.highContrast}
          onValueChange={(v) => update({ highContrast: v })}
        />
        <Divider />
        <ToggleRow
          label={t('settings.reduceMotion')}
          description={t('settings.reduceMotionDesc')}
          value={s.reduceMotion}
          onValueChange={(v) => update({ reduceMotion: v })}
        />
      </Section>

      {/* Hidden from regular users; unlocked from About (tap the version 7 times). */}
      {s.devMode ? (
        <Section title={t('settings.developer')} boxed>
          <ToggleRow
            label={t('settings.developer')}
            description={t('settings.developerDesc')}
            value={s.devMode}
            onValueChange={(v) => update({ devMode: v })}
          />
          <Divider />
          <ListRow
            icon="flask-outline"
            title={t('settings.developerTools')}
            onPress={() => router.push('/developer')}
          />
        </Section>
      ) : null}

      <Section title={t('settings.info')} boxed>
        <ListRow
          icon="information-outline"
          title={t('settings.about')}
          onPress={() => router.push('/about')}
        />
        <Divider />
        <ListRow
          icon="whatsapp"
          title={t('settings.contactBrand')}
          subtitle={t('settings.contactBrandDesc')}
          onPress={() => openLink(contactUrls.whatsapp(t('about.whatsappMessage')))}
        />
        <Divider />
        <ListRow
          icon="shield-check-outline"
          title={t('settings.safety')}
          onPress={() => router.push('/safety')}
        />
      </Section>

      <Section title={t('settings.data')} boxed>
        <ListRow
          icon="delete-outline"
          title={t('settings.resetData')}
          destructive
          onPress={confirmReset}
        />
      </Section>

      <AppText variant="caption" muted center>
        {t('about.version', { v: Constants.expoConfig?.version ?? '0.1.0' })}
      </AppText>
    </Screen>
  );
}
