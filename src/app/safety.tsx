import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Icon, Screen } from '@/components/ui';
import { useT, type StringKey } from '@/i18n';
import { useSettings } from '@/store/settingsStore';
import { radius, spacing, useColors } from '@/theme';

const POINTS: { key: StringKey; icon: string }[] = [
  { key: 'safety.p1', icon: 'eye-check-outline' },
  { key: 'safety.p2', icon: 'hand-back-left-outline' },
  { key: 'safety.p3', icon: 'account-heart-outline' },
  { key: 'safety.p4', icon: 'lightbulb-on-outline' },
];

export default function SafetyScreen() {
  const { t } = useT();
  const colors = useColors();
  const accepted = useSettings((s) => s.safetyAcceptedAt);
  const update = useSettings((s) => s.update);

  const onAccept = () => {
    if (!accepted) update({ safetyAcceptedAt: new Date().toISOString() });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen
      topInset
      footer={
        <Button label={accepted ? t('common.close') : t('safety.accept')} onPress={onAccept} />
      }>
      <View style={[styles.badge, { backgroundColor: colors.primaryTint }]}>
        <Icon name="shield-check-outline" color={colors.primary} size={32} />
      </View>
      <AppText variant="caption" muted>
        {t('app.name')}
      </AppText>
      <AppText variant="display">{t('safety.title')}</AppText>
      <View style={styles.list}>
        {POINTS.map((p) => (
          <View key={p.key} style={styles.point}>
            <Icon name={p.icon} color={colors.primary} size={24} />
            <AppText style={styles.pointText}>{t(p.key)}</AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  list: { gap: spacing.lg, marginTop: spacing.sm },
  point: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  pointText: { flex: 1 },
});
