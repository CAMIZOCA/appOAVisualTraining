/** Behaviour tests for specific activities. */
import { sanitizeParams } from './core/config';
import { center, maxRadius } from './core/geometry';
import { EIGHT_DIRECTIONS, FOUR_DIRECTIONS } from './core/paths';
import { positionAt, segmentEnds } from './core/timeline';
import type { BuildContext, MotionSegment } from './core/types';
import {
  cellDistance,
  JUMP_RANGES,
  randomSaccadeSequence,
  randomSaccades,
} from './saccades/randomSaccades';
import { saccadesHorizontal, saccadesVertical } from './saccades/twoPointSaccades';
import { circleClockwise, circleCounterclockwise } from './tracking/circle';
import { hPattern } from './tracking/hPattern';
import { horizontalTracking } from './tracking/horizontal';
import { star, starSequence } from './tracking/star';
import { verticalTracking } from './tracking/vertical';

const canvas = { width: 390, height: 620 };
const ctx: BuildContext = { canvas, safeMargin: 0.1, reduceMotion: false, seed: 7 };

describe('horizontal / vertical tracking', () => {
  it('sweeps ~80% of the width and reverses', () => {
    const p = horizontalTracking.build(sanitizeParams(horizontalTracking), ctx);
    const [go, back] = p.segments as MotionSegment[];
    expect(go.xs[0]).toBeCloseTo(canvas.width * 0.1);
    expect(go.xs[go.xs.length - 1]).toBeCloseTo(canvas.width * 0.9);
    expect(back.xs[0]).toBeCloseTo(canvas.width * 0.9);
    expect(go.ys.every((y) => y === canvas.height / 2)).toBe(true);
  });

  it('defaults to ~30 s (whole round trips)', () => {
    const p = horizontalTracking.build(sanitizeParams(horizontalTracking), ctx);
    expect(p.totalMs).toBeGreaterThanOrEqual(30_000);
    expect(p.totalMs).toBeLessThan(40_000);
  });

  it('repetitions mode runs exactly N round trips', () => {
    const params = sanitizeParams(horizontalTracking, {
      ...horizontalTracking.defaultParams,
      endMode: 'repetitions',
      repetitions: 6,
    });
    expect(horizontalTracking.build(params, ctx).meta.cycles).toBe(6);
  });

  it('faster speed → shorter sweeps', () => {
    const slow = horizontalTracking.build(
      sanitizeParams(horizontalTracking, { speed: 'slow' }),
      ctx,
    );
    const fast = horizontalTracking.build(
      sanitizeParams(horizontalTracking, { speed: 'fast' }),
      ctx,
    );
    expect(fast.segments[0].durationMs).toBeLessThan(slow.segments[0].durationMs);
  });

  it('vertical tracking stays in the vertical safe band', () => {
    const p = verticalTracking.build(sanitizeParams(verticalTracking), ctx);
    const go = p.segments[0] as MotionSegment;
    expect(go.ys[0]).toBeCloseTo(canvas.height * 0.1);
    expect(go.ys[go.ys.length - 1]).toBeCloseTo(canvas.height * 0.9);
  });
});

describe('circle', () => {
  it('clockwise and counterclockwise are mirror images', () => {
    const cw = circleClockwise.build(sanitizeParams(circleClockwise), ctx);
    const ccw = circleCounterclockwise.build(sanitizeParams(circleCounterclockwise), ctx);
    expect(cw.totalMs).toBe(ccw.totalMs);
    const ends = segmentEnds(cw.segments);
    const quarter = cw.segments[0].durationMs / 4;
    const a = positionAt(cw.segments, ends, quarter)!;
    const b = positionAt(ccw.segments, segmentEnds(ccw.segments), quarter)!;
    const c = center(canvas);
    // After a quarter turn from the top: CW is on the right, CCW on the left.
    expect(a.x).toBeGreaterThan(c.x);
    expect(b.x).toBeLessThan(c.x);
    expect(a.x - c.x).toBeCloseTo(c.x - b.x, 0);
  });

  it('revolutions and diameter options change the program', () => {
    const one = circleClockwise.build(sanitizeParams(circleClockwise, { turns: 1 }), ctx);
    const three = circleClockwise.build(sanitizeParams(circleClockwise, { turns: 3 }), ctx);
    expect(three.segments).toHaveLength(3);
    expect(three.totalMs).toBeCloseTo(one.totalMs * 3, -2);
    const small = circleClockwise.build(
      sanitizeParams(circleClockwise, { diameter: 'small' }),
      ctx,
    );
    expect(small.meta.radius).toBeLessThan(maxRadius(canvas, 0.1));
  });
});

describe('star', () => {
  it('uses 4 or 8 directions and returns to center by default', () => {
    expect(starSequence('4', 1, 1)).toEqual(FOUR_DIRECTIONS);
    expect(starSequence('8', 2, 1)).toEqual([...EIGHT_DIRECTIONS, ...EIGHT_DIRECTIONS]);
    const random = starSequence('random', 3, 99);
    expect(random).toHaveLength(24);
    random.forEach((d, i) => i > 0 && expect(d).not.toBe(random[i - 1]));

    expect(star.defaultParams.returnToCenter).toBe(true);
    const p = star.build(sanitizeParams(star), ctx);
    const motions = p.segments.filter((s) => s.kind === 'motion') as MotionSegment[];
    const c = center(canvas);
    // Every other move ends at the center.
    motions
      .filter((_, i) => i % 2 === 1)
      .forEach((m) => {
        expect(m.xs[m.xs.length - 1]).toBeCloseTo(c.x);
        expect(m.ys[m.ys.length - 1]).toBeCloseTo(c.y);
      });
  });

  it('without return to center moves tip to tip', () => {
    const p = star.build(
      sanitizeParams(star, { ...star.defaultParams, returnToCenter: false, rounds: 1 }),
      ctx,
    );
    const motions = p.segments.filter((s) => s.kind === 'motion');
    expect(motions).toHaveLength(8 + 1); // 8 tips + final return
  });
});

describe('saccades', () => {
  it('two-point saccades never animate travel between targets', () => {
    for (const def of [saccadesHorizontal, saccadesVertical]) {
      const p = def.build(sanitizeParams(def), ctx);
      expect(p.segments.some((s) => s.kind === 'motion')).toBe(false);
      expect(p.markers).toHaveLength(2);
      const fix = p.segments.filter((s) => s.kind === 'fixation');
      expect(fix).toHaveLength(def.defaultParams.repetitions * 2);
      fix.forEach((f) => expect(f.cue?.sound).toBe('tick'));
    }
  });

  it('pace sets the fixation time and distance the separation', () => {
    const slow = saccadesHorizontal.build(
      sanitizeParams(saccadesHorizontal, { pace: 'slow' }),
      ctx,
    );
    const fast = saccadesHorizontal.build(
      sanitizeParams(saccadesHorizontal, { pace: 'fast' }),
      ctx,
    );
    expect(slow.meta.fixationMs).toBeGreaterThan(fast.meta.fixationMs as number);
    const near = saccadesHorizontal.build(
      sanitizeParams(saccadesHorizontal, { distance: 40 }),
      ctx,
    );
    expect(near.meta.distancePx).toBeLessThan(slow.meta.distancePx as number);
  });

  it('vertical saccades place targets top and bottom', () => {
    const p = saccadesVertical.build(sanitizeParams(saccadesVertical), ctx);
    const [a, b] = p.markers;
    expect(a.x).toBe(b.x);
    expect(a.y).toBeLessThan(canvas.height / 2);
    expect(b.y).toBeGreaterThan(canvas.height / 2);
  });

  it.each(['easy', 'medium', 'hard'] as const)(
    'random saccades respect %s jump distances',
    (level) => {
      const seq = randomSaccadeSequence(200, level, 42);
      const [min, max] = JUMP_RANGES[level];
      for (let i = 1; i < seq.length; i++) {
        expect(seq[i]).not.toBe(seq[i - 1]);
        const d = cellDistance(seq[i - 1], seq[i]);
        expect(d).toBeGreaterThanOrEqual(min);
        expect(d).toBeLessThanOrEqual(max);
      }
    },
  );

  it('random saccades show one target at a time, reproducibly', () => {
    const params = sanitizeParams(randomSaccades);
    const a = randomSaccades.build(params, ctx);
    expect(a.markers).toHaveLength(0);
    expect(a.segments).toHaveLength(params.count as number);
    expect(randomSaccades.build(params, { ...ctx, seed: 8 }).segments).not.toEqual(a.segments);
  });
});

describe('H pattern', () => {
  it('follows TL → BL → CL → CR → TR → BR and shows the path only in guided mode', () => {
    const p = hPattern.build(sanitizeParams(hPattern), ctx);
    const motions = p.segments.filter((s) => s.kind === 'motion') as MotionSegment[];
    const ends = motions
      .slice(0, 5)
      .map((m) => ({ x: m.xs[m.xs.length - 1], y: m.ys[m.ys.length - 1] }));
    const l = canvas.width * 0.1;
    const r = canvas.width * 0.9;
    const t = canvas.height * 0.1;
    const b = canvas.height * 0.9;
    const mid = canvas.height / 2;
    expect(ends.map((e) => [Math.round(e.x), Math.round(e.y)])).toEqual(
      [
        [l, b],
        [l, mid],
        [r, mid],
        [r, t],
        [r, b],
      ].map(([x, y]) => [Math.round(x), Math.round(y)]),
    );
    expect(p.guides).toHaveLength(3);
    const challenge = hPattern.build(
      sanitizeParams(hPattern, { ...hPattern.defaultParams, mode: 'challenge' }),
      ctx,
    );
    expect(challenge.guides).toHaveLength(0);
  });
});
