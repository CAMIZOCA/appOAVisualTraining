import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  CanvasTheme,
  Lang,
  SpeedLevel,
  TargetSize,
  TargetType,
} from '@/activities/core/types';
import { persistStorage, STORAGE_KEYS } from '@/services/storage';

export interface SettingsValues {
  voiceEnabled: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  language: Lang;
  /** expo-speech rate (1 = normal). */
  speechRate: number;
  defaultSpeed: SpeedLevel;
  targetType: TargetType;
  targetSize: TargetSize;
  canvasTheme: CanvasTheme;
  highContrast: boolean;
  reduceMotion: boolean;
  /** ISO date of safety notice acceptance. */
  safetyAcceptedAt: string | null;
  devMode: boolean;
  debugOverlay: boolean;
  /** Normalized safe band margin for target positions (developer setting). */
  safeMargin: number;
}

interface SettingsState extends SettingsValues {
  update: (patch: Partial<SettingsValues>) => void;
  reset: () => void;
}

export const DEFAULT_SETTINGS: SettingsValues = {
  voiceEnabled: true,
  hapticsEnabled: true,
  soundEnabled: true,
  language: 'es',
  speechRate: 0.95,
  defaultSpeed: 'slow',
  targetType: 'dotCenter',
  targetSize: 'medium',
  canvasTheme: 'light',
  highContrast: false,
  reduceMotion: false,
  safetyAcceptedAt: null,
  devMode: false,
  debugOverlay: false,
  safeMargin: 0.1,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set(patch),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: STORAGE_KEYS.settings, storage: persistStorage, version: 1 },
  ),
);
