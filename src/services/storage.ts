import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** All persisted keys. Bump the version suffix when a store shape changes incompatibly. */
export const STORAGE_KEYS = {
  settings: 'oa.settings.v1',
  sessions: 'oa.sessions.v1',
  lab: 'oa.lab.v1',
  dev: 'oa.dev.v1',
} as const;

export const persistStorage = createJSONStorage(() => AsyncStorage);

export async function clearPersistedData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}
