import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button } from '@/components/ui';
import { brandAssets } from '@/constants/brandAssets';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useT } from '@/i18n';
import { useUi } from '@/store/uiStore';
import { brand, spacing, useColors } from '@/theme';

const LOGO_WIDTH = 300;
const HALO = 230;

/** Branded welcome shown on every launch; "Entrar" continues to the app (or the safety notice). */
export default function WelcomeScreen() {
  const { t } = useT();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const setWelcomed = useUi((s) => s.setWelcomed);

  // With reduced motion everything is shown at once, without animation.
  const anim = <T,>(a: T) => (reduceMotion ? undefined : a);

  const enter = () => {
    setWelcomed(true);
    router.replace('/');
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
      ]}>
      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Animated.View entering={anim(FadeIn.duration(900))} style={styles.halo} />
          <Animated.View entering={anim(ZoomIn.duration(700).springify().damping(18))}>
            <Image
              source={brandAssets.logo}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel={t('welcome.logo')}
              accessible
            />
          </Animated.View>
        </View>
        <Animated.View entering={anim(FadeInDown.delay(450).duration(600))} style={styles.text}>
          <AppText variant="title" color={colors.brandDeep} center>
            {t('welcome.tagline')}
          </AppText>
          <AppText muted center>
            {t('app.name')} · {t('welcome.subtitle')}
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={anim(FadeInUp.delay(800).duration(600))} style={styles.bottom}>
        <Button label={t('welcome.enter')} icon="arrow-right" onPress={enter} />
        <AppText variant="caption" muted center>
          {t('welcome.footer')}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxxl + spacing.lg,
  },
  logoWrap: { width: LOGO_WIDTH, maxWidth: '100%', alignItems: 'center', justifyContent: 'center' },
  // Soft brand-blue glow behind the logo; the gap below keeps it clear of the tagline.
  halo: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    backgroundColor: brand.blue50,
  },
  logo: { width: LOGO_WIDTH, maxWidth: '100%', aspectRatio: brandAssets.logoRatio },
  text: { gap: spacing.sm, maxWidth: 360 },
  bottom: { gap: spacing.md, width: '100%', maxWidth: 480, alignSelf: 'center' },
});
