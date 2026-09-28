import { useEffect, useState } from 'react';

import { useDev } from '@/store/devStore';
import { useLab } from '@/store/labStore';
import { useSessions } from '@/store/sessionsStore';
import { useSettings } from '@/store/settingsStore';

const stores = [useSettings, useSessions, useLab, useDev];

function allHydrated() {
  return stores.every((s) => s.persist.hasHydrated());
}

/** True once every persisted store has been read from AsyncStorage. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(allHydrated);
  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (allHydrated()) setHydrated(true);
    };
    const unsubs = stores.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u());
  }, [hydrated]);
  return hydrated;
}
