/**
 * Timeline helpers. The `'worklet'` functions run inside the engine's UI-thread frame callback;
 * they are plain functions in tests.
 */
import type { Easing, Point, Segment } from './types';

/** Cumulative end time (ms) of every segment. */
export function segmentEnds(segments: readonly { durationMs: number }[]): number[] {
  const ends: number[] = [];
  let t = 0;
  for (const s of segments) {
    t += s.durationMs;
    ends.push(t);
  }
  return ends;
}

/** Index of the segment active at time `t` (binary search). Clamped to the valid range. */
export function locateSegment(ends: readonly number[], t: number): number {
  'worklet';
  const n = ends.length;
  if (n === 0) return -1;
  if (t < 0) return 0;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (t < ends[mid]) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

export function segmentStartAt(ends: readonly number[], index: number): number {
  'worklet';
  return index <= 0 ? 0 : ends[index - 1];
}

export function applyEasing(easing: Easing, t: number): number {
  'worklet';
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  if (easing === 'inOutSine') return -(Math.cos(Math.PI * x) - 1) / 2;
  if (easing === 'inOutQuad') return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  return x;
}

/** Point at `fraction` (0–1) of the polyline's arc length. */
export function samplePolyline(
  xs: readonly number[],
  ys: readonly number[],
  lens: readonly number[],
  fraction: number,
): Point {
  'worklet';
  const n = xs.length;
  const total = lens[n - 1];
  if (n < 2 || total <= 0) return { x: xs[0], y: ys[0] };
  const f = fraction < 0 ? 0 : fraction > 1 ? 1 : fraction;
  const target = f * total;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lens[mid] <= target) lo = mid;
    else hi = mid;
  }
  const segLen = lens[hi] - lens[lo];
  const k = segLen > 0 ? (target - lens[lo]) / segLen : 0;
  return { x: xs[lo] + (xs[hi] - xs[lo]) * k, y: ys[lo] + (ys[hi] - ys[lo]) * k };
}

/** Target position during a segment at local progress `local` (0–1), or null if hidden. */
export function positionInSegment(seg: Segment, local: number): Point | null {
  'worklet';
  if (seg.kind === 'motion') {
    return samplePolyline(seg.xs, seg.ys, seg.lens, applyEasing(seg.easing, local));
  }
  if (seg.kind === 'hold' || seg.kind === 'fixation') return seg.at;
  return null;
}

/** Target position at absolute program time `t` (JS helper for tests / previews). */
export function positionAt(
  segments: readonly Segment[],
  ends: readonly number[],
  t: number,
): Point | null {
  const i = locateSegment(ends, t);
  if (i < 0) return null;
  const start = segmentStartAt(ends, i);
  const d = segments[i].durationMs;
  return positionInSegment(segments[i], d > 0 ? (t - start) / d : 1);
}
