/**
 * Activity timer. Pure functions marked as worklets: they run on the UI thread inside the
 * engine's frame callback and in Jest unchanged.
 *
 * The clock starts at -COUNTDOWN_MS: negative elapsed time is the countdown, 0 is the start
 * of the activity. Elapsed only advances while running, so pause/resume is exact.
 */

export const COUNTDOWN_MS = 3000;

/** Max time a single frame may advance the clock (avoids jumps after backgrounding). */
export const MAX_FRAME_DT = 100;

export function clampFrameDelta(dt: number): number {
  'worklet';
  if (!(dt > 0)) return 0;
  return dt > MAX_FRAME_DT ? MAX_FRAME_DT : dt;
}

/** Advance the clock by a frame delta, never past `totalMs`. */
export function advanceClock(
  elapsed: number,
  dt: number,
  totalMs: number,
  running: boolean,
): number {
  'worklet';
  if (!running) return elapsed;
  const next = elapsed + clampFrameDelta(dt);
  return next > totalMs ? totalMs : next;
}

/** Whole seconds left in the countdown (3, 2, 1), or 0 once the activity started. */
export function countdownSecondsLeft(elapsed: number): number {
  'worklet';
  return elapsed < 0 ? Math.ceil(-elapsed / 1000) : 0;
}

/** Whole seconds remaining in the activity (shown in the HUD). */
export function remainingSeconds(elapsed: number, totalMs: number): number {
  'worklet';
  const e = elapsed > 0 ? elapsed : 0;
  const left = totalMs - e;
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

/** Overall activity progress 0–1 (0 during countdown). */
export function progressOf(elapsed: number, totalMs: number): number {
  'worklet';
  if (totalMs <= 0) return 1;
  if (elapsed <= 0) return 0;
  return elapsed >= totalMs ? 1 : elapsed / totalMs;
}

/**
 * JS-side mirror of the engine's clock for tests and non-animated contexts
 * (the engine itself keeps `elapsed` in a shared value).
 */
export class ActivityClock {
  elapsed = -COUNTDOWN_MS;
  running = false;

  constructor(readonly totalMs: number) {}

  start() {
    this.running = true;
  }

  pause() {
    this.running = false;
  }

  resume() {
    if (!this.done) this.running = true;
  }

  tick(dt: number) {
    this.elapsed = advanceClock(this.elapsed, dt, this.totalMs, this.running);
    if (this.done) this.running = false;
  }

  get done() {
    return this.elapsed >= this.totalMs;
  }

  get inCountdown() {
    return this.elapsed < 0;
  }
}
