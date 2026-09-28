import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage, STORAGE_KEYS } from '@/services/storage';
import type { Comfort, SessionRecord } from '@/types/session';

/** Keep local history bounded. */
export const MAX_RECORDS = 1000;

interface SessionsState {
  /** Newest first. */
  records: SessionRecord[];
  add: (record: SessionRecord) => void;
  setComfort: (id: string, comfort: Comfort) => void;
  clear: () => void;
}

export const useSessions = create<SessionsState>()(
  persist(
    (set) => ({
      records: [],
      add: (record) =>
        set((s) => ({
          records: [record, ...s.records.filter((r) => r.id !== record.id)].slice(0, MAX_RECORDS),
        })),
      setComfort: (id, comfort) =>
        set((s) => ({ records: s.records.map((r) => (r.id === id ? { ...r, comfort } : r)) })),
      clear: () => set({ records: [] }),
    }),
    { name: STORAGE_KEYS.sessions, storage: persistStorage, version: 1 },
  ),
);

export function createSessionId(now = Date.now()): string {
  return `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
