import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useHydrated } from '@/hooks/useHydrated';
import { useVoiceSettings } from '@/hooks/useVoiceSettings';
import { useT } from '@/i18n';
import { fonts, useColors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrated = useHydrated();
  const [fontsLoaded, fontError] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  // A font failure falls back to system fonts rather than blocking the app.
  const ready = hydrated && (fontsLoaded || !!fontError);
  useVoiceSettings();
  const colors = useColors();
  const { t } = useT();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.headingSemiBold },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="welcome"
          options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
        />
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
