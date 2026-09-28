import { AppText, Screen } from '@/components/ui';
import { useT } from '@/i18n';

export default function Tab() {
  const { t } = useT();
  return (
    <Screen topInset>
      <AppText variant="display">{t('activities.title')}</AppText>
      <AppText muted>{t('activities.subtitle')}</AppText>
    </Screen>
  );
}
