/**
 * Helpers to compose ActivityPrograms from segments.
 */
import { isInsideBand, toArcPolyline } from './geometry';
import { durationForDistance } from './speed';
import { positionInSegment } from './timeline';
import type {
  ActivityDefinition,
  ActivityProgram,
  Cue,
  Easing,
  FixationSegment,
  HoldSegment,
  MotionSegment,
  ParamValues,
  Point,
  Polyline,
  SceneSegment,
  Segment,
  Size,
} from './types';

/** Safety cap so misconfigured parameters can never create huge programs. */
export const MAX_SEGMENTS = 5000;
export const MAX_PROGRAM_MS = 15 * 60 * 1000;

interface SegmentOptions {
  phase: string;
  cue?: Cue;
}

/** Smooth pursuit along px points at `pxPerSec` (duration derived from arc length). */
export function motion(
  points: Point[],
  pxPerSec: number,
  opts: SegmentOptions & { easing?: Easing },
): MotionSegment {
  const poly = toArcPolyline(points);
  return {
    kind: 'motion',
    xs: poly.xs,
    ys: poly.ys,
    lens: poly.lens,
    easing: opts.easing ?? 'linear',
    durationMs: durationForDistance(poly.length, pxPerSec),
    phase: opts.phase,
    cue: opts.cue,
  };
}

/** Motion with an explicit duration instead of a speed. */
export function motionFor(
  points: Point[],
  durationMs: number,
  opts: SegmentOptions & { easing?: Easing },
): MotionSegment {
  return { ...motion(points, 1, opts), durationMs: Math.max(16, durationMs) };
}

export function hold(at: Point, durationMs: number, opts: SegmentOptions): HoldSegment {
  return {
    kind: 'hold',
    at,
    durationMs: Math.max(16, durationMs),
    phase: opts.phase,
    cue: opts.cue,
  };
}

export function fixation(
  at: Point,
  durationMs: number,
  index: number,
  opts: SegmentOptions,
): FixationSegment {
  return {
    kind: 'fixation',
    at,
    index,
    durationMs: Math.max(16, durationMs),
    phase: opts.phase,
    cue: opts.cue,
  };
}

export function scene(
  sceneKind: SceneSegment['scene'],
  durationMs: number,
  opts: SegmentOptions & Omit<Partial<SceneSegment>, 'kind' | 'scene' | 'durationMs'>,
): SceneSegment {
  return { ...opts, kind: 'scene', scene: sceneKind, durationMs: Math.max(16, durationMs) };
}

export type EndMode = 'time' | 'repetitions';

/**
 * Repeat a cycle. `repetitions` mode: exactly N cycles. `time` mode: whole cycles until the
 * target duration is covered (never cut mid-cycle, at least one cycle).
 */
export function repeatCycles(
  buildCycle: (index: number) => Segment[],
  opts: { endMode: EndMode; repetitions: number; durationMs: number },
): { segments: Segment[]; cycles: number } {
  const segments: Segment[] = [];
  let total = 0;
  let cycles = 0;
  const maxCycles =
    opts.endMode === 'repetitions' ? Math.max(1, Math.round(opts.repetitions)) : Infinity;
  while (cycles < maxCycles) {
    const cycle = buildCycle(cycles);
    const cycleMs = cycle.reduce((sum, s) => sum + s.durationMs, 0);
    if (cycleMs <= 0) break;
    if (opts.endMode === 'time' && cycles > 0 && total >= opts.durationMs) break;
    if (segments.length + cycle.length > MAX_SEGMENTS || total + cycleMs > MAX_PROGRAM_MS) break;
    segments.push(...cycle);
    total += cycleMs;
    cycles++;
  }
  return { segments, cycles };
}

/** Assemble a program: rounds durations and computes the total. */
export function finalizeProgram(input: {
  segments: Segment[];
  guides?: Polyline[];
  markers?: Point[];
  meta?: Record<string, string | number>;
}): ActivityProgram {
  const segments = input.segments.slice(0, MAX_SEGMENTS).map((s) => ({
    ...s,
    durationMs: Math.max(1, Math.round(s.durationMs)),
  }));
  const totalMs = segments.reduce((sum, s) => sum + s.durationMs, 0);
  return {
    segments,
    totalMs,
    guides: input.guides ?? [],
    markers: input.markers ?? [],
    meta: input.meta ?? {},
  };
}

export function guideFrom(points: Point[]): Polyline {
  return { xs: points.map((p) => p.x), ys: points.map((p) => p.y) };
}

/** First visible target position of a program (shown during the countdown). */
export function startPosition(program: ActivityProgram): Point | null {
  for (const seg of program.segments) {
    const p = positionInSegment(seg, 0);
    if (p) return p;
    if (seg.kind === 'scene') return null;
  }
  return null;
}

/** All px points a target may visit (vertices of motions, holds, fixations, markers, guides). */
export function programPoints(program: ActivityProgram): Point[] {
  const pts: Point[] = [];
  for (const s of program.segments) {
    if (s.kind === 'motion') s.xs.forEach((x, i) => pts.push({ x, y: s.ys[i] }));
    else if (s.kind === 'hold' || s.kind === 'fixation') pts.push(s.at);
  }
  program.markers.forEach((p) => pts.push(p));
  program.guides.forEach((g) => g.xs.forEach((x, i) => pts.push({ x, y: g.ys[i] })));
  return pts;
}

/** Returns a list of problems (empty = valid). Used by tests and the debug overlay. */
export function validateProgram(program: ActivityProgram, canvas: Size, margin: number): string[] {
  const errors: string[] = [];
  if (program.segments.length === 0) errors.push('program has no segments');
  program.segments.forEach((s, i) => {
    if (!Number.isFinite(s.durationMs) || s.durationMs <= 0)
      errors.push(`segment ${i} has invalid duration`);
    if (
      s.kind === 'motion' &&
      (s.xs.length < 2 || s.xs.length !== s.ys.length || s.xs.length !== s.lens.length)
    )
      errors.push(`segment ${i} has a malformed polyline`);
  });
  const sum = program.segments.reduce((acc, s) => acc + s.durationMs, 0);
  if (sum !== program.totalMs) errors.push('totalMs does not match segment durations');
  const outside = programPoints(program).filter((p) => !isInsideBand(p, canvas, margin));
  if (outside.length > 0) errors.push(`${outside.length} point(s) outside the safe band`);
  return errors;
}

/** Reference canvas used to estimate durations before the real canvas is measured. */
export const REFERENCE_CANVAS: Size = { width: 390, height: 620 };

export function estimateDurationMs<P extends ParamValues>(
  def: ActivityDefinition<P>,
  params: P,
  canvas: Size = REFERENCE_CANVAS,
  safeMargin = 0.1,
  reduceMotion = false,
): number {
  try {
    return def.build(params, { canvas, safeMargin, reduceMotion, seed: 1 }).totalMs;
  } catch {
    return 0;
  }
}
