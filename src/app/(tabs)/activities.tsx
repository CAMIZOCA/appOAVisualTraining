import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { activities } from '@/activities';
import { CATEGORIES } from '@/activities/core/registry';
import type { ActivityCategory } from '@/activities/core/types';
import { ActivityCard } from '@/components/ActivityCard';
import { AppText, Card, Chip, Icon, Screen } from '@/components/ui';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settingsStore';
import { radius, spacing, useColors } from '@/theme';

export default function ActivitiesScreen() {
  const { t } = useT();
  const colors = useColors();
  const devMode = useSettings((s) => s.devMode);
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all');
  const categories = CATEGORIES.filter((c) => activities.byCategory(c).length > 0);
  const list = filter === 'all' ? activities.visible : activities.byCategory(filter);

  return (
    <Screen topInset>
      <View style={styles.header}>
        <AppText variant="display">{t('activities.title')}</AppText>
        <AppText muted>{t('activities.subtitle')}</AppText>
      </View>

      {devMode ? (
        <Card
          tone="accent"
          onPress={() => router.push('/lab')}
          accessibilityLabel={`${t('activities.labCardTitle')}. ${t('activities.labCardDesc')}`}>
          <View style={styles.labRow}>
            <View style={[styles.labIcon, { backgroundColor: colors.primary }]}>
              <Icon name="flask-outline" color={colors.onPrimary} size={26} />
            </View>
            <View style={styles.flex}>
              <AppText variant="heading">{t('activities.labCardTitle')}</AppText>
              <AppText variant="small" muted>
                {t('activities.labCardDesc')}
              </AppText>
            </View>
            <Icon name="chevron-right" color={colors.primary} />
          </View>
        </Card>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={t('activities.filter')}
        contentContainerStyle={styles.chips}>
        <Chip
          label={t('category.all')}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        {categories.map((c) => (
          <Chip
            key={c}
            label={t(`category.${c}`)}
            selected={filter === c}
            onPress={() => setFilter(c)}
          />
        ))}
      </ScrollView>

      <View style={styles.list}>
        {list.map((def) => (
          <ActivityCard key={def.id} definition={def} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: spacing.xs },
  labRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  labIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { gap: spacing.sm, paddingVertical: 2 },
  list: { gap: spacing.md },
});
