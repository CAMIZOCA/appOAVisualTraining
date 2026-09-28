/**
 * Shared builder for back-and-forth tracking along a straight line
 * (horizontal, vertical, diagonal). One repetition = one round trip.
 */
import {
  amplitudeField,
  dwellField,
  durationField,
  easingField,
  endModeField,
  num,
  repetitionsField,
  showPathField,
  speedField,
} from '../core/fields';
import { L } from '../core/localize';
import {
  finalizeProgram,
  guideFrom,
  hold,
  motion,
  repeatCycles,
  type EndMode,
} from '../core/program';
import { difficultyForSpeed, speedPxPerSec } from '../core/speed';
import type {
  ActivityProgram,
  BuildContext,
  Easing,
  ParamField,
  Point,
  Segment,
  SpeedLevel,
} from '../core/types';

export type LineTrackingParams = {
  speed: SpeedLevel;
  endMode: EndMode;
  durationSec: number;
  repetitions: number;
  amplitude: number;
  dwellMs: number;
  easing: Easing;
  showPath: boolean;
};

export const LINE_TRACKING_DEFAULTS: LineTrackingParams = {
  speed: 'slow',
  endMode: 'time',
  durationSec: 30,
  repetitions: 6,
  amplitude: 100,
  dwellMs: 0,
  easing: 'inOutSine',
  showPath: false,
};

export const lineTrackingFields = (): ParamField[] => [
  speedField(),
  { ...endModeField(), dev: false },
  durationField(10, 180, 5),
  repetitionsField(L('Repeticiones (ida y vuelta)', 'Repetitions (round trips)')),
  showPathField(true),
  amplitudeField(),
  dwellField(),
  easingField(),
];

export const lineTrackingDifficulty = (p: LineTrackingParams) => difficultyForSpeed(p.speed);

/**
 * Build a back-and-forth program between two endpoints produced by `endpoints(span)`,
 * where span is the fraction of the safe band (amplitude %).
 */
export function buildLineTracking(
  params: LineTrackingParams,
  ctx: BuildContext,
  endpoints: (span: number) => [Point, Point],
  labels: { forward: string; back: string },
): ActivityProgram {
  const [a, b] = endpoints(num(params, 'amplitude', 100) / 100);
  const pxps = speedPxPerSec(params.speed, ctx.canvas, ctx.reduceMotion);
  const dwell = num(params, 'dwellMs', 0);

  const cycle = (): Segment[] => {
    const segs: Segment[] = [
      motion([a, b], pxps, { phase: labels.forward, easing: params.easing }),
    ];
    if (dwell > 0) segs.push(hold(b, dwell, { phase: 'hold' }));
    segs.push(motion([b, a], pxps, { phase: labels.back, easing: params.easing }));
    if (dwell > 0) segs.push(hold(a, dwell, { phase: 'hold' }));
    return segs;
  };

  const { segments, cycles } = repeatCycles(cycle, {
    endMode: params.endMode,
    repetitions: params.repetitions,
    durationMs: params.durationSec * 1000,
  });

  return finalizeProgram({
    segments,
    guides: params.showPath ? [guideFrom([a, b])] : [],
    meta: { pxPerSec: pxps, cycles },
  });
}
