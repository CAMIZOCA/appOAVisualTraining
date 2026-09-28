import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { RunOptions } from '@/activities/core/runOptions';
import type { ParamValues } from '@/activities/core/types';
import { persistStorage, STORAGE_KEYS } from '@/services/storage';

/** Last Activity Lab configuration. `null` params → the Lab definition's defaults. */
interface LabState {
  params: ParamValues | null;
  run: Partial<RunOptions>;
  setParams: (params: ParamValues) => void;
  setRun: (patch: Partial<RunOptions>) => void;
  reset: () => void;
}

export const useLab = create<LabState>()(
  persist(
    (set) => ({
      params: null,
      run: {},
      setParams: (params) => set({ params }),
      setRun: (patch) => set((s) => ({ run: { ...s.run, ...patch } })),
      reset: () => set({ params: null, run: {} }),
    }),
    { name: STORAGE_KEYS.lab, storage: persistStorage, version: 1 },
  ),
);
