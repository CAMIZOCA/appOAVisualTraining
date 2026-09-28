import {
  ActivityClock,
  advanceClock,
  clampFrameDelta,
  COUNTDOWN_MS,
  countdownSecondsLeft,
  MAX_FRAME_DT,
  progressOf,
  remainingSeconds,
} from './clock';

// 10 ms frames keep the arithmetic exact; real frames are ~16.7 ms.
const FRAME = 10;

function runFrames(clock: ActivityClock, ms: number) {
  const n = Math.round(ms / FRAME);
  for (let i = 0; i < n; i++) clock.tick(FRAME);
}

describe('activity timer (clock)', () => {
  it('starts with a 3 second countdown', () => {
    const clock = new ActivityClock(10_000);
    expect(clock.elapsed).toBe(-COUNTDOWN_MS);
    expect(countdownSecondsLeft(clock.elapsed)).toBe(3);
    clock.start();
    runFrames(clock, 1000);
    expect(countdownSecondsLeft(clock.elapsed)).toBe(2);
    runFrames(clock, 2000);
    expect(clock.inCountdown).toBe(false);
    expect(countdownSecondsLeft(clock.elapsed)).toBe(0);
  });

  it('does not advance while paused and resumes exactly where it was', () => {
    const clock = new ActivityClock(10_000);
    clock.start();
    runFrames(clock, 4000);
    const before = clock.elapsed;
    clock.pause();
    runFrames(clock, 5000);
    expect(clock.elapsed).toBe(before);
    clock.resume();
    runFrames(clock, 1000);
    expect(clock.elapsed).toBeCloseTo(before + 1000, -1);
  });

  it('stops at the total and reports completion', () => {
    const clock = new ActivityClock(2000);
    clock.start();
    runFrames(clock, 6000);
    expect(clock.elapsed).toBe(2000);
    expect(clock.done).toBe(true);
    expect(clock.running).toBe(false);
    clock.resume();
    expect(clock.running).toBe(false);
  });

  it('clamps large frame deltas (e.g. after backgrounding)', () => {
    expect(clampFrameDelta(5000)).toBe(MAX_FRAME_DT);
    expect(clampFrameDelta(-3)).toBe(0);
    expect(clampFrameDelta(Number.NaN)).toBe(0);
    expect(advanceClock(0, 5000, 10_000, true)).toBe(MAX_FRAME_DT);
    expect(advanceClock(0, 16, 10_000, false)).toBe(0);
  });

  it('computes remaining seconds and progress', () => {
    expect(remainingSeconds(-500, 30_000)).toBe(30);
    expect(remainingSeconds(0, 30_000)).toBe(30);
    expect(remainingSeconds(100, 30_000)).toBe(30);
    expect(remainingSeconds(1000, 30_000)).toBe(29);
    expect(remainingSeconds(30_000, 30_000)).toBe(0);
    expect(progressOf(-100, 1000)).toBe(0);
    expect(progressOf(250, 1000)).toBe(0.25);
    expect(progressOf(5000, 1000)).toBe(1);
  });
});
