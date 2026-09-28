/**
 * Path generators. All return px points in canvas coordinates; the engine interpolates them
 * by arc length, so sample density only affects smoothness, never speed.
 *
 * Adding a new trajectory = adding a generator here and using it from an activity or the Lab.
 */
import { bandRect, center, maxRadius, safePx } from './geometry';
import type { Point, Size } from './types';

export type Direction = 'cw' | 'ccw';
export type Orientation = 'horizontal' | 'vertical';

/** Samples used for one full revolution; keeps chord error < 0.02 px for r ≤ 300 px. */
export const SAMPLES_PER_TURN = 256;

/**
 * Circle points starting at `startAngle` (radians; screen coords, y down, so increasing
 * angle = clockwise on screen). Default start: top of the circle.
 */
export function circlePoints(
  c: Point,
  radius: number,
  turns: number,
  direction: Direction,
  startAngle = -Math.PI / 2,
): Point[] {
  const n = Math.max(8, Math.ceil(SAMPLES_PER_TURN * turns));
  const sign = direction === 'cw' ? 1 : -1;
  const total = 2 * Math.PI * turns;
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const a = startAngle + (sign * (total * i)) / n;
    pts.push({ x: c.x + radius * Math.cos(a), y: c.y + radius * Math.sin(a) });
  }
  return pts;
}

/**
 * Figure-eight (Lissajous 1:2), starting and ending at the center.
 * Horizontal ∞: lobes left/right. Vertical 8: lobes top/bottom.
 * `ax`/`ay` are the half-extents (px) along x and y.
 */
export function infinityPoints(
  c: Point,
  ax: number,
  ay: number,
  orientation: Orientation,
): Point[] {
  const n = 512;
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n;
    if (orientation === 'horizontal') {
      pts.push({ x: c.x + ax * Math.sin(t), y: c.y + ay * Math.sin(2 * t) });
    } else {
      pts.push({ x: c.x + ax * Math.sin(2 * t), y: c.y + ay * Math.sin(t) });
    }
  }
  return pts;
}

/** Half-extents for a figure eight that fits the safe band (lobes are `aspect` as tall as wide). */
export function infinityExtents(
  canvas: Size,
  margin: number,
  orientation: Orientation,
  scale = 1,
): { ax: number; ay: number } {
  const r = bandRect(canvas, margin);
  const halfW = (r.right - r.left) / 2;
  const halfH = (r.bottom - r.top) / 2;
  // With y = ay·sin(2t) each lobe is `ax` wide and `2·ay` tall → ay = ax/2 gives round lobes.
  if (orientation === 'horizontal') {
    const ax = halfW * scale;
    return { ax, ay: Math.min(halfH, ax * 0.5) };
  }
  const ay = halfH * scale;
  return { ax: Math.min(halfW, ay * 0.5), ay };
}

/** Eight compass directions (screen angles, y down), in the order used by the Star activity. */
export const STAR_DIRECTIONS = [
  { id: 'up', angle: -90 },
  { id: 'upRight', angle: -45 },
  { id: 'right', angle: 0 },
  { id: 'downRight', angle: 45 },
  { id: 'down', angle: 90 },
  { id: 'downLeft', angle: 135 },
  { id: 'left', angle: 180 },
  { id: 'upLeft', angle: -135 },
] as const;

export type StarDirectionId = (typeof STAR_DIRECTIONS)[number]['id'];

export const FOUR_DIRECTIONS: StarDirectionId[] = ['up', 'right', 'down', 'left'];
export const EIGHT_DIRECTIONS: StarDirectionId[] = STAR_DIRECTIONS.map((d) => d.id);

/**
 * Spoke tip for a direction. With `stretch`, spokes use the full safe band on each axis
 * (an ellipse, better use of tall portrait screens); otherwise all spokes share one radius.
 */
export function starTip(
  canvas: Size,
  margin: number,
  dir: StarDirectionId,
  scale = 1,
  stretch = false,
): Point {
  const c = center(canvas);
  const band = bandRect(canvas, margin);
  const angle = (STAR_DIRECTIONS.find((d) => d.id === dir)!.angle * Math.PI) / 180;
  const r = maxRadius(canvas, margin) * scale;
  const rx = stretch ? (c.x - band.left) * scale : r;
  const ry = stretch ? (c.y - band.top) * scale : r;
  return { x: c.x + rx * Math.cos(angle), y: c.y + ry * Math.sin(angle) };
}

/**
 * H-pattern waypoints (normalized): top-left → bottom-left → center-left → center-right →
 * top-right → bottom-right. `width` / `height` are the fraction of the safe band used.
 */
export function hPatternPoints(canvas: Size, margin: number, width = 1, height = 1): Point[] {
  const halfW = (0.5 - margin) * width;
  const halfH = (0.5 - margin) * height;
  const l = 0.5 - halfW;
  const r = 0.5 + halfW;
  const t = 0.5 - halfH;
  const b = 0.5 + halfH;
  return [
    { x: l, y: t },
    { x: l, y: b },
    { x: l, y: 0.5 },
    { x: r, y: 0.5 },
    { x: r, y: t },
    { x: r, y: b },
  ].map((p) => safePx(p, canvas, margin));
}

/** Predefined normalized grid positions for random saccades (row-major 3×3). */
export const SACCADE_GRID = [
  { id: 'topLeft', x: 0, y: 0 },
  { id: 'topCenter', x: 0.5, y: 0 },
  { id: 'topRight', x: 1, y: 0 },
  { id: 'centerLeft', x: 0, y: 0.5 },
  { id: 'center', x: 0.5, y: 0.5 },
  { id: 'centerRight', x: 1, y: 0.5 },
  { id: 'bottomLeft', x: 0, y: 1 },
  { id: 'bottomCenter', x: 0.5, y: 1 },
  { id: 'bottomRight', x: 1, y: 1 },
] as const;

/**
 * Map a grid cell (0/0.5/1 per axis) into the safe band, optionally shrunk by `spread`
 * (1 = edges of the band, 0.5 = halfway to center).
 */
export function gridPoint(
  cell: { x: number; y: number },
  canvas: Size,
  margin: number,
  spread = 1,
): Point {
  const halfSpan = 0.5 - margin;
  return safePx(
    {
      x: 0.5 + (cell.x - 0.5) * 2 * halfSpan * spread,
      y: 0.5 + (cell.y - 0.5) * 2 * halfSpan * spread,
    },
    canvas,
    margin,
  );
}

/** Horizontal line across `span` (0–1) of the safe band, centered, at normalized `y`. */
export function horizontalLine(canvas: Size, margin: number, span = 1, y = 0.5): [Point, Point] {
  const half = (0.5 - margin) * span;
  return [
    safePx({ x: 0.5 - half, y }, canvas, margin),
    safePx({ x: 0.5 + half, y }, canvas, margin),
  ];
}

/** Vertical line across `span` (0–1) of the safe band, centered, at normalized `x`. */
export function verticalLine(canvas: Size, margin: number, span = 1, x = 0.5): [Point, Point] {
  const half = (0.5 - margin) * span;
  return [
    safePx({ x, y: 0.5 - half }, canvas, margin),
    safePx({ x, y: 0.5 + half }, canvas, margin),
  ];
}

/** Diagonal from top-left to bottom-right (or the anti-diagonal) inside the safe band. */
export function diagonalLine(canvas: Size, margin: number, span = 1, anti = false): [Point, Point] {
  const half = (0.5 - margin) * span;
  const a = { x: 0.5 - half, y: anti ? 0.5 + half : 0.5 - half };
  const b = { x: 0.5 + half, y: anti ? 0.5 - half : 0.5 + half };
  return [safePx(a, canvas, margin), safePx(b, canvas, margin)];
}
