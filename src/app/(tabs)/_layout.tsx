import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon } from '@/components/ui';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settingsStore';
import { useColors } from '@/theme';

export default function TabLayout() {
  const accepted = useSettings((s) => s.safetyAcceptedAt);
  const colors = useColors();
  const { t } = useT();

  if (!accepted) return <Redirect href="/safety" />;

  const icon = (name: string) => {
    function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
      return <Icon name={focused ? name : `${name}-outline`} color={color as string} size={24} />;
    }
    return TabIcon;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home') }} />
      <Tabs.Screen
        name="activities"
        options={{ title: t('tabs.activities'), tabBarIcon: icon('eye') }}
      />
      <Tabs.Screen
        name="sessions"
        options={{ title: t('tabs.sessions'), tabBarIcon: icon('calendar-check') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t('tabs.settings'), tabBarIcon: icon('cog') }}
      />
    </Tabs>
  );
}
