import { AppText, Screen } from '@/components/ui';
import { useT } from '@/i18n';

export default function Tab() {
  const { t } = useT();
  return (
    <Screen topInset>
      <AppText variant="display">{t('app.name')}</AppText>
      <AppText muted>{t('app.tagline')}</AppText>
    </Screen>
  );
}
