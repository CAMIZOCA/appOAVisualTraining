import {
  difficultyForPace,
  difficultyForSpeed,
  durationForDistance,
  effectivePace,
  effectiveSpeed,
  PACE_MS,
  SPEED_FACTORS,
  SPEED_LEVELS,
  speedPxPerSec,
} from './speed';

describe('speed system', () => {
  it('levels are strictly increasing', () => {
    const factors = SPEED_LEVELS.map((l) => SPEED_FACTORS[l]);
    expect([...factors].sort((a, b) => a - b)).toEqual(factors);
    expect(new Set(factors).size).toBe(factors.length);
    expect(PACE_MS.slow).toBeGreaterThan(PACE_MS.medium);
    expect(PACE_MS.medium).toBeGreaterThan(PACE_MS.fast);
  });

  it('scales with the canvas short side so devices behave alike', () => {
    expect(speedPxPerSec('slow', { width: 400, height: 800 })).toBeCloseTo(100);
    expect(speedPxPerSec('slow', { width: 800, height: 1600 })).toBeCloseTo(200);
    // Time to cross the band is therefore device independent.
    const small = durationForDistance(
      400 * 0.8,
      speedPxPerSec('medium', { width: 400, height: 800 }),
    );
    const big = durationForDistance(
      800 * 0.8,
      speedPxPerSec('medium', { width: 800, height: 1600 }),
    );
    expect(small).toBeCloseTo(big);
  });

  it('reduce motion caps speed and pace', () => {
    expect(effectiveSpeed('fast', true)).toBe('slow');
    expect(effectiveSpeed('medium', true)).toBe('slow');
    expect(effectiveSpeed('verySlow', true)).toBe('verySlow');
    expect(effectiveSpeed('fast', false)).toBe('fast');
    expect(effectivePace('fast', true)).toBe('slow');
    expect(speedPxPerSec('fast', { width: 400, height: 800 }, true)).toBeCloseTo(100);
  });

  it('durations are positive and at least one frame', () => {
    expect(durationForDistance(0, 100)).toBe(16);
    expect(durationForDistance(100, 0)).toBe(16);
    expect(durationForDistance(300, 100)).toBe(3000);
  });

  it('maps speed/pace to difficulty', () => {
    expect(difficultyForSpeed('verySlow')).toBe('easy');
    expect(difficultyForSpeed('medium')).toBe('medium');
    expect(difficultyForSpeed('fast')).toBe('hard');
    expect(difficultyForPace('fast')).toBe('hard');
  });
});
