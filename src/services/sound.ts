import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { useSettings } from '@/store/settingsStore';

/** Short, soft tick used as an optional audio cue when a saccade target changes. */
let player: AudioPlayer | null = null;
let modeSet = false;

function getPlayer(): AudioPlayer | null {
  if (player) return player;
  try {
    if (!modeSet) {
      modeSet = true;
      // Mix with other audio and respect the silent switch: this is a UI cue, not media.
      setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(
        () => {},
      );
    }
    player = createAudioPlayer(require('@/assets/sounds/tick.wav'));
    player.volume = 0.5;
  } catch {
    player = null;
  }
  return player;
}

export function playTick() {
  if (!useSettings.getState().soundEnabled) return;
  const p = getPlayer();
  if (!p) return;
  try {
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    // Audio is a nice-to-have; never break an activity because of it.
  }
}

/** Preload so the first cue isn't delayed. */
export function preloadSounds() {
  if (useSettings.getState().soundEnabled) getPlayer();
}

export function stopSounds() {
  try {
    player?.pause();
  } catch {
    // ignore
  }
}
