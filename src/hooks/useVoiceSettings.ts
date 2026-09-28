import { useEffect } from 'react';

import { voice } from '@/services/voice';
import { useSettings } from '@/store/settingsStore';

/** Keeps the voice service in sync with Settings. Mounted once at the app root. */
export function useVoiceSettings() {
  const enabled = useSettings((s) => s.voiceEnabled);
  const language = useSettings((s) => s.language);
  const rate = useSettings((s) => s.speechRate);
  useEffect(() => {
    voice.configure({ enabled, language, rate });
  }, [enabled, language, rate]);
}
