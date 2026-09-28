import { toArcPolyline } from './geometry';
import { finalizeProgram, fixation, hold, motion } from './program';
import {
  applyEasing,
  locateSegment,
  positionAt,
  samplePolyline,
  segmentEnds,
  segmentStartAt,
} from './timeline';

describe('timeline', () => {
  const ends = segmentEnds([{ durationMs: 1000 }, { durationMs: 500 }, { durationMs: 250 }]);

  it('computes cumulative ends', () => {
    expect(ends).toEqual([1000, 1500, 1750]);
    expect(segmentStartAt(ends, 0)).toBe(0);
    expect(segmentStartAt(ends, 2)).toBe(1500);
  });

  it('locates the active segment at boundaries', () => {
    expect(locateSegment(ends, -10)).toBe(0);
    expect(locateSegment(ends, 0)).toBe(0);
    expect(locateSegment(ends, 999.9)).toBe(0);
    expect(locateSegment(ends, 1000)).toBe(1);
    expect(locateSegment(ends, 1499)).toBe(1);
    expect(locateSegment(ends, 1500)).toBe(2);
    expect(locateSegment(ends, 99999)).toBe(2);
    expect(locateSegment([], 10)).toBe(-1);
  });

  it('eases within [0,1] and keeps endpoints', () => {
    for (const e of ['linear', 'inOutSine', 'inOutQuad'] as const) {
      expect(applyEasing(e, 0)).toBeCloseTo(0);
      expect(applyEasing(e, 1)).toBeCloseTo(1);
      expect(applyEasing(e, 0.5)).toBeCloseTo(0.5);
      expect(applyEasing(e, -1)).toBeCloseTo(0);
      expect(applyEasing(e, 2)).toBeCloseTo(1);
    }
  });

  it('samples polylines by arc length (constant speed on uneven sampling)', () => {
    // 0→10 in one segment, 10→100 in 9 segments: the midpoint must be at x = 50.
    const pts = [
      { x: 0, y: 0 },
      ...Array.from({ length: 10 }, (_, i) => ({ x: 10 + i * 10, y: 0 })),
    ];
    const poly = toArcPolyline(pts);
    expect(poly.length).toBeCloseTo(100);
    expect(samplePolyline(poly.xs, poly.ys, poly.lens, 0.5).x).toBeCloseTo(50);
    expect(samplePolyline(poly.xs, poly.ys, poly.lens, 0.05).x).toBeCloseTo(5);
    expect(samplePolyline(poly.xs, poly.ys, poly.lens, 1).x).toBeCloseTo(100);
  });

  it('reaches the intended positions over a program', () => {
    const a = { x: 10, y: 50 };
    const b = { x: 110, y: 50 };
    const program = finalizeProgram({
      segments: [
        motion([a, b], 100, { phase: 'go' }), // 1000 ms
        hold(b, 500, { phase: 'hold' }),
        fixation({ x: 60, y: 10 }, 300, 0, { phase: 'jump' }),
      ],
    });
    const e = segmentEnds(program.segments);
    expect(program.totalMs).toBe(1800);
    expect(positionAt(program.segments, e, 0)).toEqual(a);
    expect(positionAt(program.segments, e, 500)!.x).toBeCloseTo(60);
    expect(positionAt(program.segments, e, 999)!.x).toBeCloseTo(109.9, 0);
    expect(positionAt(program.segments, e, 1200)).toEqual(b);
    expect(positionAt(program.segments, e, 1600)).toEqual({ x: 60, y: 10 });
  });
});
