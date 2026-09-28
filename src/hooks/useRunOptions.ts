import { useMemo } from 'react';

import type { RunOptions } from '@/activities/core/runOptions';
import { useSettings, type SettingsValues } from '@/store/settingsStore';

export function defaultRunOptions(s: SettingsValues): RunOptions {
  return {
    targetType: s.targetType,
    targetSize: s.targetSize,
    targetSizePx: null,
    // High contrast upgrades the default light canvas; an explicit dark choice is respected.
    canvasTheme: s.highContrast && s.canvasTheme === 'light' ? 'contrast' : s.canvasTheme,
    voice: s.voiceEnabled,
    debug: s.devMode && s.debugOverlay,
  };
}

/** Run options derived from Settings (the starting point for every run). */
export function useDefaultRunOptions(): RunOptions {
  const targetType = useSettings((s) => s.targetType);
  const targetSize = useSettings((s) => s.targetSize);
  const canvasTheme = useSettings((s) => s.canvasTheme);
  const highContrast = useSettings((s) => s.highContrast);
  const voiceEnabled = useSettings((s) => s.voiceEnabled);
  const devMode = useSettings((s) => s.devMode);
  const debugOverlay = useSettings((s) => s.debugOverlay);
  return useMemo(
    () =>
      defaultRunOptions({
        ...useSettings.getState(),
        targetType,
        targetSize,
        canvasTheme,
        highContrast,
        voiceEnabled,
        devMode,
        debugOverlay,
      }),
    [targetType, targetSize, canvasTheme, highContrast, voiceEnabled, devMode, debugOverlay],
  );
}
