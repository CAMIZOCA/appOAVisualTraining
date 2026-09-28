import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { activities } from '@/activities';
import { initialParams } from '@/activities/core/config';
import { ActivityPlayer } from '@/components/player/ActivityPlayer';
import { AppText, Button, Screen } from '@/components/ui';
import { useDefaultRunOptions } from '@/hooks/useRunOptions';
import { useT } from '@/i18n';
import { useDev } from '@/store/devStore';
import { useSettings } from '@/store/settingsStore';

export default function ActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useT();
  const defaults = useDefaultRunOptions();
  const isLab = false;
  const definition = activities.get(id ?? '');

  // Resolve the initial configuration once per mount.
  const [initial] = useState(() => {
    if (!definition) return null;
    const settings = useSettings.getState();
    return {
      params: initialParams(definition, {
        defaultSpeed: settings.defaultSpeed,
        overrides: settings.devMode ? useDev.getState().paramOverrides[definition.id] : undefined,
      }),
      run: defaults,
    };
  });

  const done = () => {
    if (router.canGoBack()) router.back();
    else router.replace(isLab ? '/lab' : '/activities');
  };

  if (!definition || !initial) {
    return (
      <Screen topInset>
        <AppText variant="title">{t('player.notFound')}</AppText>
        <Button label={t('common.back')} onPress={done} />
      </Screen>
    );
  }

  return (
    <ActivityPlayer
      definition={definition}
      mode={isLab ? 'lab' : 'activity'}
      initialParams={initial.params}
      initialRun={initial.run}
      skipSetup={isLab}
      onDone={done}
    />
  );
}
