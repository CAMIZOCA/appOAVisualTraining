import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useHydrated } from '@/hooks/useHydrated';
import { useT } from '@/i18n';
import { useColors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrated = useHydrated();
  const colors = useColors();
  const { t } = useT();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="activity/[id]"
          options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen name="lab" options={{ title: t('lab.title') }} />
        <Stack.Screen name="developer" options={{ title: t('dev.title') }} />
        <Stack.Screen name="about" options={{ title: t('about.title') }} />
        <Stack.Screen
          name="safety"
          options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
        />
      </Stack>
    </>
  );
}
