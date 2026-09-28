import Constants from 'expo-constants';

import { AppText, Card, Screen } from '@/components/ui';
import { useT } from '@/i18n';

export default function AboutScreen() {
  const { t } = useT();
  return (
    <Screen>
      <AppText variant="title">{t('app.name')}</AppText>
      <AppText muted>{t('about.version', { v: Constants.expoConfig?.version ?? '0.1.0' })}</AppText>
      <AppText>{t('about.body')}</AppText>
      <Card tone="accent">
        <AppText>{t('about.disclaimer')}</AppText>
      </Card>
      <AppText variant="small" muted>
        {t('safety.p2')} {t('safety.p3')}
      </AppText>
    </Screen>
  );
}
