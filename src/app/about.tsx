import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Divider, Icon, ListRow, Screen, Section } from '@/components/ui';
import { BRAND } from '@/constants/brand';
import { brandAssets } from '@/constants/brandAssets';
import { useT } from '@/i18n';
import { spacing, useColors } from '@/theme';
import { contactUrls, openLink } from '@/utils/contact';

export default function AboutScreen() {
  const { t } = useT();
  const colors = useColors();
  const external = <Icon name="open-in-new" color={colors.textMuted} size={20} />;

  return (
    <Screen>
      <View style={styles.brand}>
        <Image
          source={brandAssets.logo}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel={t('about.logo')}
          accessible
        />
        <AppText muted center>
          {t('about.history')}
        </AppText>
      </View>

      <Button
        variant="accent"
        icon="whatsapp"
        label={`${t('about.whatsapp')} · ${t('about.whatsappDesc')}`}
        onPress={() => openLink(contactUrls.whatsapp(t('about.whatsappMessage')))}
      />

      <Section title={t('about.contact')} boxed>
        <ListRow
          icon="phone-outline"
          title={t('about.call')}
          subtitle={BRAND.phoneDisplay}
          onPress={() => openLink(contactUrls.phone())}
        />
        <Divider />
        <ListRow
          icon="whatsapp"
          title={t('about.whatsapp')}
          subtitle={BRAND.whatsappDisplay}
          onPress={() => openLink(contactUrls.whatsapp(t('about.whatsappMessage')))}
        />
        <Divider />
        <ListRow
          icon="email-outline"
          title={t('about.email')}
          subtitle={BRAND.email}
          onPress={() => openLink(contactUrls.email())}
        />
        <Divider />
        <ListRow
          icon="map-marker-outline"
          title={t('about.directions')}
          subtitle={t('about.address')}
          right={external}
          onPress={() => openLink(contactUrls.maps())}
        />
        <Divider />
        <ListRow icon="clock-outline" title={t('about.hours')} subtitle={t('about.hoursValue')} />
      </Section>

      <Section title={t('about.more')} boxed>
        <ListRow
          icon="newspaper-variant-outline"
          title={t('about.blog')}
          right={external}
          onPress={() => openLink(BRAND.blog)}
        />
        <Divider />
        <ListRow
          icon="web"
          title={t('about.website')}
          subtitle="opticaandina.com.ec"
          right={external}
          onPress={() => openLink(BRAND.website)}
        />
        <Divider />
        <ListRow
          icon="instagram"
          title={t('about.instagram')}
          subtitle={BRAND.instagramHandle}
          right={external}
          onPress={() => openLink(BRAND.instagram)}
        />
        <Divider />
        <ListRow
          icon="facebook"
          title={t('about.facebook')}
          right={external}
          onPress={() => openLink(BRAND.facebook)}
        />
      </Section>

      <View style={styles.app}>
        <AppText variant="heading">{t('app.name')}</AppText>
        <AppText muted>
          {t('about.version', { v: Constants.expoConfig?.version ?? '0.1.0' })}
        </AppText>
        <AppText>{t('about.body')}</AppText>
      </View>
      <Card tone="accent">
        <AppText>{t('about.disclaimer')}</AppText>
      </Card>
      <AppText variant="small" muted>
        {t('safety.p2')} {t('safety.p3')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  logo: { width: 240, maxWidth: '100%', aspectRatio: brandAssets.logoRatio },
  app: { gap: spacing.xs },
});
