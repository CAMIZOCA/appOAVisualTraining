import { useDev } from '@/store/devStore';
import { useLab } from '@/store/labStore';
import { useSessions } from '@/store/sessionsStore';
import { useSettings } from '@/store/settingsStore';

import { clearPersistedData } from './storage';

/**
 * Wipes all local data. Keeps safety acceptance and language so the user isn't thrown
 * back to onboarding in a different language.
 */
export async function resetLocalData(): Promise<void> {
  const { safetyAcceptedAt, language } = useSettings.getState();
  await clearPersistedData();
  useSessions.getState().clear();
  useLab.getState().reset();
  useDev.getState().resetAll();
  useSettings.getState().reset();
  useSettings.getState().update({ safetyAcceptedAt, language });
}
