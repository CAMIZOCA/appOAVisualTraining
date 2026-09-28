import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import type { Lang } from '@/activities/core/types';
import { localeOf } from '@/i18n';

export interface VoiceConfig {
  enabled: boolean;
  language: Lang;
  /** 1 = normal speed. */
  rate: number;
}

/**
 * Voice guidance via the device text-to-speech engine (expo-speech).
 * Speaks only on explicit cues — never continuously. Every new instruction interrupts the
 * previous one so voice never lags behind the activity.
 */
class VoiceInstructionService {
  private config: VoiceConfig = { enabled: true, language: 'es', rate: 0.95 };
  private paused = false;

  configure(patch: Partial<VoiceConfig>) {
    this.config = { ...this.config, ...patch };
    if (!this.config.enabled) this.stop();
  }

  get enabled() {
    return this.config.enabled;
  }

  speak(text: string, opts: { interrupt?: boolean } = {}) {
    if (!this.config.enabled || !text.trim()) return;
    if (opts.interrupt !== false) Speech.stop();
    this.paused = false;
    Speech.speak(text, {
      language: localeOf(this.config.language),
      rate: this.config.rate,
      pitch: 1,
    });
  }

  stop() {
    this.paused = false;
    Speech.stop();
  }

  /** Native pause exists on iOS only; elsewhere pausing stops the current utterance. */
  pause() {
    if (Platform.OS === 'ios') {
      this.paused = true;
      Speech.pause().catch(() => {});
    } else {
      this.stop();
    }
  }

  resume() {
    if (Platform.OS === 'ios' && this.paused) {
      this.paused = false;
      Speech.resume().catch(() => {});
    }
  }
}

export const voice = new VoiceInstructionService();
