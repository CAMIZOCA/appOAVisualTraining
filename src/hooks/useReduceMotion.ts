import { useReducedMotion } from 'react-native-reanimated';

import { useSettings } from '@/store/settingsStore';

/** Reduce motion if the user enabled it in the app *or* in the operating system. */
export function useReduceMotion(): boolean {
  const setting = useSettings((s) => s.reduceMotion);
  const system = useReducedMotion();
  return setting || system;
}
