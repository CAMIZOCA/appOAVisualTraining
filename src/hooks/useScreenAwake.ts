import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';

const TAG = 'oa-activity';

/**
 * Keeps the screen on while mounted. Unlike `useKeepAwake`, failures (e.g. unsupported
 * browsers, or unmounting before activation finished) are ignored instead of throwing.
 */
export function useScreenAwake() {
  useEffect(() => {
    let active = true;
    activateKeepAwakeAsync(TAG).catch(() => {
      active = false;
    });
    return () => {
      if (active) deactivateKeepAwake(TAG).catch(() => {});
    };
  }, []);
}
