import {
  bandRect,
  clampToBand,
  isInsideBand,
  maxRadius,
  safePx,
  sanitizeMargin,
  toArcPolyline,
  toNorm,
  toPx,
} from './geometry';
import {
  circlePoints,
  diagonalLine,
  gridPoint,
  hPatternPoints,
  horizontalLine,
  infinityExtents,
  infinityPoints,
  SACCADE_GRID,
  starTip,
  STAR_DIRECTIONS,
  verticalLine,
} from './paths';

const PHONE = { width: 390, height: 600 };
const TALL = { width: 360, height: 700 };
const TABLET = { width: 800, height: 900 };
const SIZES = [PHONE, TALL, TABLET];
const M = 0.1;

describe('normalized coordinates', () => {
  it('maps between normalized and px', () => {
    expect(toPx({ x: 0.5, y: 0.25 }, PHONE)).toEqual({ x: 195, y: 150 });
    expect(toNorm({ x: 195, y: 150 }, PHONE)).toEqual({ x: 0.5, y: 0.25 });
    expect(toNorm({ x: 1, y: 1 }, { width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('clamps into the safe band', () => {
    expect(clampToBand(0, M)).toBe(0.1);
    expect(clampToBand(1, M)).toBe(0.9);
    expect(clampToBand(0.42, M)).toBe(0.42);
    expect(safePx({ x: -1, y: 2 }, PHONE, M)).toEqual({ x: 39, y: 540 });
  });

  it('sanitizes developer margins', () => {
    expect(sanitizeMargin(0)).toBeGreaterThan(0);
    expect(sanitizeMargin(0.9)).toBeLessThanOrEqual(0.3);
    expect(sanitizeMargin(Number.NaN)).toBe(0.1);
  });

  it('band rect and max radius', () => {
    expect(bandRect(PHONE, M)).toEqual({ left: 39, top: 60, right: 351, bottom: 540 });
    expect(maxRadius(PHONE, M)).toBeCloseTo(156);
  });

  it('builds arc polylines and handles degenerate input', () => {
    const p = toArcPolyline([
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 3, y: 4 },
    ]);
    expect(p.length).toBe(5);
    expect(p.xs.length).toBe(2);
    const single = toArcPolyline([{ x: 1, y: 1 }]);
    expect(single.xs).toEqual([1, 1]);
  });
});

describe('path generators stay inside the safe band', () => {
  it.each(SIZES)('lines on %o', (c) => {
    for (const [a, b] of [
      horizontalLine(c, M),
      verticalLine(c, M),
      diagonalLine(c, M),
      diagonalLine(c, M, 1, true),
    ]) {
      expect(isInsideBand(a, c, M)).toBe(true);
      expect(isInsideBand(b, c, M)).toBe(true);
    }
    // Horizontal tracking spans ~80% of the width.
    const [a, b] = horizontalLine(c, M);
    expect((b.x - a.x) / c.width).toBeCloseTo(0.8);
  });

  it.each(SIZES)('circle on %o is round and inside', (c) => {
    const r = maxRadius(c, M);
    const pts = circlePoints({ x: c.width / 2, y: c.height / 2 }, r, 2, 'cw');
    expect(pts.every((p) => isInsideBand(p, c, M))).toBe(true);
    pts.forEach((p) => expect(Math.hypot(p.x - c.width / 2, p.y - c.height / 2)).toBeCloseTo(r, 6));
  });

  it('circle direction: clockwise moves right from the top on screen', () => {
    const c = { x: 100, y: 100 };
    const cw = circlePoints(c, 50, 1, 'cw');
    const ccw = circlePoints(c, 50, 1, 'ccw');
    expect(cw[0].y).toBeCloseTo(50);
    expect(cw[1].x).toBeGreaterThan(100);
    expect(ccw[1].x).toBeLessThan(100);
  });

  it.each(SIZES)('infinity on %o', (c) => {
    for (const o of ['horizontal', 'vertical'] as const) {
      const { ax, ay } = infinityExtents(c, M, o);
      const pts = infinityPoints({ x: c.width / 2, y: c.height / 2 }, ax, ay, o);
      expect(pts.every((p) => isInsideBand(p, c, M))).toBe(true);
      expect(pts[0].x).toBeCloseTo(pts[pts.length - 1].x, 6);
      expect(pts[0].y).toBeCloseTo(pts[pts.length - 1].y, 6);
    }
  });

  it.each(SIZES)('star tips and H pattern on %o', (c) => {
    for (const d of STAR_DIRECTIONS) {
      expect(isInsideBand(starTip(c, M, d.id), c, M)).toBe(true);
      expect(isInsideBand(starTip(c, M, d.id, 1, true), c, M)).toBe(true);
    }
    expect(hPatternPoints(c, M).every((p) => isInsideBand(p, c, M))).toBe(true);
  });

  it.each(SIZES)('saccade grid on %o', (c) => {
    for (const cell of SACCADE_GRID) {
      expect(isInsideBand(gridPoint(cell, c, M), c, M)).toBe(true);
    }
    expect(gridPoint({ x: 0, y: 0 }, c, M)).toEqual({ x: c.width * M, y: c.height * M });
    expect(gridPoint({ x: 0.5, y: 0.5 }, c, M)).toEqual({ x: c.width / 2, y: c.height / 2 });
  });
});
