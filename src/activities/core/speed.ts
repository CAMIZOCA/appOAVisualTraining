/**
 * Normalized speed system. Users pick a level; internally speed is a fraction of the
 * canvas's short side per second, so an activity feels the same on any screen.
 */
import type { Difficulty, Pace, Size, SpeedLevel } from './types';

export const SPEED_LEVELS: SpeedLevel[] = ['verySlow', 'slow', 'medium', 'fast'];
export const PACES: Pace[] = ['slow', 'medium', 'fast'];

/** Canvas short-side lengths per second. */
export const SPEED_FACTORS: Record<SpeedLevel, number> = {
  verySlow: 0.15,
  slow: 0.25,
  medium: 0.4,
  fast: 0.6,
};

/** Fixation time per saccade target (ms). */
export const PACE_MS: Record<Pace, number> = { slow: 1500, medium: 1000, fast: 700 };

export function isSpeedLevel(value: unknown): value is SpeedLevel {
  return typeof value === 'string' && value in SPEED_FACTORS;
}

/** Reduce motion caps the speed at "slow". */
export function effectiveSpeed(level: SpeedLevel, reduceMotion: boolean): SpeedLevel {
  if (!reduceMotion) return level;
  return SPEED_LEVELS.indexOf(level) > SPEED_LEVELS.indexOf('slow') ? 'slow' : level;
}

export function effectivePace(pace: Pace, reduceMotion: boolean): Pace {
  return reduceMotion ? 'slow' : pace;
}

export function speedPxPerSec(level: SpeedLevel, canvas: Size, reduceMotion = false): number {
  const factor = SPEED_FACTORS[effectiveSpeed(level, reduceMotion)];
  return factor * Math.max(1, Math.min(canvas.width, canvas.height));
}

/** Time (ms) to travel `distancePx` at `pxPerSec`; never below one frame. */
export function durationForDistance(distancePx: number, pxPerSec: number): number {
  if (pxPerSec <= 0) return 16;
  return Math.max(16, (distancePx / pxPerSec) * 1000);
}

export function difficultyForSpeed(level: SpeedLevel): Difficulty {
  return level === 'fast' ? 'hard' : level === 'medium' ? 'medium' : 'easy';
}

export function difficultyForPace(pace: Pace): Difficulty {
  return pace === 'fast' ? 'hard' : pace === 'medium' ? 'medium' : 'easy';
}
