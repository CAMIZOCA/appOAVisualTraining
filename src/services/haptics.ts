import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import type { HapticCue } from '@/activities/core/types';
import { useSettings } from '@/store/settingsStore';

/**
 * Subtle haptic feedback for start, completion and important transitions.
 * Activities never attach haptic cues to smooth-pursuit (motion) segments.
 */
export function haptic(cue: HapticCue) {
  if (Platform.OS === 'web' || !useSettings.getState().hapticsEnabled) return;
  const run = (): Promise<void> => {
    switch (cue) {
      case 'start':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'complete':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'transition':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'tick':
        return Haptics.selectionAsync();
    }
  };
  run().catch(() => {});
}
