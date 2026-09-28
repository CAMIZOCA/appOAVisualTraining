import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ParamValues } from '@/activities/core/types';
import { persistStorage, STORAGE_KEYS } from '@/services/storage';

/**
 * Developer / Test mode overrides. Lets optometrists tune activity parameters and voice
 * prompt texts on the device; overrides persist until reset.
 */
interface DevState {
  paramOverrides: Record<string, ParamValues>;
  /** activityId → promptKey → text (in the current language). */
  promptOverrides: Record<string, Record<string, string>>;
  setParams: (activityId: string, params: ParamValues) => void;
  setPrompt: (activityId: string, key: string, text: string | null) => void;
  resetActivity: (activityId: string) => void;
  resetAll: () => void;
}

export const useDev = create<DevState>()(
  persist(
    (set) => ({
      paramOverrides: {},
      promptOverrides: {},
      setParams: (activityId, params) =>
        set((s) => ({ paramOverrides: { ...s.paramOverrides, [activityId]: params } })),
      setPrompt: (activityId, key, text) =>
        set((s) => {
          const current = { ...(s.promptOverrides[activityId] ?? {}) };
          if (text === null || text.trim() === '') delete current[key];
          else current[key] = text;
          return { promptOverrides: { ...s.promptOverrides, [activityId]: current } };
        }),
      resetActivity: (activityId) =>
        set((s) => {
          const paramOverrides = { ...s.paramOverrides };
          const promptOverrides = { ...s.promptOverrides };
          delete paramOverrides[activityId];
          delete promptOverrides[activityId];
          return { paramOverrides, promptOverrides };
        }),
      resetAll: () => set({ paramOverrides: {}, promptOverrides: {} }),
    }),
    { name: STORAGE_KEYS.dev, storage: persistStorage, version: 1 },
  ),
);
