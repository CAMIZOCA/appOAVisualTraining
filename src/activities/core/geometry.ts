import type { Point, Polyline, Size } from './types';

/** Default normalized safe band margin: targets live inside 0.1–0.9 of the canvas. */
export const DEFAULT_SAFE_MARGIN = 0.1;
/** Hard limits for the developer-adjustable margin. */
export const MIN_SAFE_MARGIN = 0.04;
export const MAX_SAFE_MARGIN = 0.3;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sanitizeMargin(margin: number): number {
  return clamp(
    Number.isFinite(margin) ? margin : DEFAULT_SAFE_MARGIN,
    MIN_SAFE_MARGIN,
    MAX_SAFE_MARGIN,
  );
}

/** Clamp a normalized coordinate into the safe band [margin, 1 - margin]. */
export function clampToBand(value: number, margin: number): number {
  return clamp(value, margin, 1 - margin);
}

export function clampPointToBand(p: Point, margin: number): Point {
  return { x: clampToBand(p.x, margin), y: clampToBand(p.y, margin) };
}

export function toPx(p: Point, canvas: Size): Point {
  return { x: p.x * canvas.width, y: p.y * canvas.height };
}

export function toNorm(p: Point, canvas: Size): Point {
  return {
    x: canvas.width > 0 ? p.x / canvas.width : 0,
    y: canvas.height > 0 ? p.y / canvas.height : 0,
  };
}

/** Normalized point → px, after clamping it into the safe band. */
export function safePx(p: Point, canvas: Size, margin: number): Point {
  return toPx(clampPointToBand(p, margin), canvas);
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The safe band in px. */
export function bandRect(canvas: Size, margin: number): Rect {
  return {
    left: canvas.width * margin,
    top: canvas.height * margin,
    right: canvas.width * (1 - margin),
    bottom: canvas.height * (1 - margin),
  };
}

export function center(canvas: Size): Point {
  return { x: canvas.width / 2, y: canvas.height / 2 };
}

/** Largest radius (px) of a circle centered at `c` that stays inside the safe band. */
export function maxRadius(canvas: Size, margin: number, c: Point = center(canvas)): number {
  const r = bandRect(canvas, margin);
  return Math.max(0, Math.min(c.x - r.left, r.right - c.x, c.y - r.top, r.bottom - c.y));
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function isInsideBand(p: Point, canvas: Size, margin: number, epsilonPx = 0.5): boolean {
  const r = bandRect(canvas, margin);
  return (
    p.x >= r.left - epsilonPx &&
    p.x <= r.right + epsilonPx &&
    p.y >= r.top - epsilonPx &&
    p.y <= r.bottom + epsilonPx
  );
}

export interface ArcPolyline extends Polyline {
  /** Cumulative arc length per vertex. */
  lens: number[];
  length: number;
}

/** Build an arc-length-parametrized polyline from px points (consecutive duplicates removed). */
export function toArcPolyline(points: Point[]): ArcPolyline {
  const xs: number[] = [];
  const ys: number[] = [];
  const lens: number[] = [];
  let total = 0;
  for (const p of points) {
    const n = xs.length;
    if (n > 0) {
      const d = Math.hypot(p.x - xs[n - 1], p.y - ys[n - 1]);
      if (d < 1e-6) continue;
      total += d;
    }
    xs.push(p.x);
    ys.push(p.y);
    lens.push(total);
  }
  if (xs.length === 1) {
    // Degenerate path: duplicate the single point so interpolation stays valid.
    xs.push(xs[0]);
    ys.push(ys[0]);
    lens.push(0);
  }
  return { xs, ys, lens, length: total };
}

export function polylinePoints(poly: Polyline): Point[] {
  return poly.xs.map((x, i) => ({ x, y: poly.ys[i] }));
}
