/**
 * Saccades between two stationary targets. The target never travels: it jumps
 * (fixation segments), with a subtle pulse and an optional soft tick.
 * Horizontal and vertical variants share this factory.
 */
import { num, paceField } from '../core/fields';
import { COMMON_PROMPTS, L } from '../core/localize';
import { horizontalLine, verticalLine } from '../core/paths';
import { finalizeProgram, fixation, hold } from '../core/program';
import { difficultyForPace, effectivePace, PACE_MS } from '../core/speed';
import type {
  ActivityDefinition,
  ActivityProgram,
  BuildContext,
  HapticCue,
  Pace,
  Segment,
} from '../core/types';

export type TwoPointSaccadeParams = {
  distance: number;
  pace: Pace;
  repetitions: number;
  /** Custom fixation time (ms); 0 = use pace. Developer mode. */
  fixationMs: number;
  sound: boolean;
  hapticTick: boolean;
  showMarkers: boolean;
};

export function buildTwoPointSaccades(
  p: TwoPointSaccadeParams,
  ctx: BuildContext,
  axis: 'horizontal' | 'vertical',
): ActivityProgram {
  const span = num(p, 'distance', 80) / 100;
  const [a, b] =
    axis === 'horizontal'
      ? horizontalLine(ctx.canvas, ctx.safeMargin, span)
      : verticalLine(ctx.canvas, ctx.safeMargin, span);
  const custom = num(p, 'fixationMs', 0);
  const ms = custom > 0 ? custom : PACE_MS[effectivePace(p.pace, ctx.reduceMotion)];
  const haptic: HapticCue | undefined = p.hapticTick ? 'tick' : undefined;

  const segments: Segment[] = [hold(a, 800, { phase: 'ready' })];
  const jumps = Math.max(1, Math.round(p.repetitions)) * 2;
  for (let i = 0; i < jumps; i++) {
    const to = i % 2 === 0 ? b : a;
    segments.push(
      fixation(to, ms, i, {
        phase: `jump ${i + 1}/${jumps}`,
        cue: { sound: p.sound ? 'tick' : undefined, haptic },
      }),
    );
  }
  return finalizeProgram({
    segments,
    markers: p.showMarkers ? [a, b] : [],
    meta: { fixationMs: ms, jumps, distancePx: Math.round(Math.hypot(b.x - a.x, b.y - a.y)) },
  });
}

export function twoPointSaccades(
  axis: 'horizontal' | 'vertical',
): ActivityDefinition<TwoPointSaccadeParams> {
  const h = axis === 'horizontal';
  return {
    id: h ? 'saccades-horizontal' : 'saccades-vertical',
    category: 'saccades',
    icon: h ? 'dots-horizontal' : 'dots-vertical',
    priority: 'P0',
    usesTarget: true,
    name: h
      ? L('Sacádicos horizontales', 'Horizontal Saccades')
      : L('Sacádicos verticales', 'Vertical Saccades'),
    description: h
      ? L(
          'Salta con la mirada entre dos puntos fijos, izquierda y derecha.',
          'Jump your gaze between two fixed points, left and right.',
        )
      : L(
          'Salta con la mirada entre dos puntos fijos, arriba y abajo.',
          'Jump your gaze between two fixed points, top and bottom.',
        ),
    purpose: L(
      'Practicar movimientos rápidos y precisos de la mirada entre dos objetivos.',
      'Practice quick, accurate eye jumps between two targets.',
    ),
    instructions: [
      L('Mantén la cabeza quieta.', 'Keep your head still.'),
      L(
        'Cuando el punto cambie de lugar, mueve tus ojos rápidamente hacia él.',
        'When the dot changes place, move your eyes to it quickly.',
      ),
      L(
        'El punto no se desplaza: aparece en la otra posición.',
        'The dot does not travel: it appears at the other position.',
      ),
    ],
    difficulty: 'medium',
    defaultParams: {
      distance: 80,
      pace: 'medium',
      repetitions: 10,
      fixationMs: 0,
      sound: true,
      hapticTick: false,
      showMarkers: true,
    },
    params: [
      {
        key: 'distance',
        type: 'number',
        label: L('Distancia entre puntos', 'Distance between points'),
        unit: '%',
        min: 30,
        max: 100,
        step: 10,
      },
      paceField(),
      {
        key: 'repetitions',
        type: 'number',
        label: L('Repeticiones (ida y vuelta)', 'Repetitions (there and back)'),
        min: 3,
        max: 40,
        step: 1,
      },
      {
        key: 'fixationMs',
        type: 'number',
        label: L('Tiempo por objetivo (0 = según ritmo)', 'Time per target (0 = by pace)'),
        unit: 'ms',
        min: 0,
        max: 3000,
        step: 100,
        dev: true,
      },
      { key: 'sound', type: 'boolean', label: L('Sonido al cambiar', 'Sound on change') },
      {
        key: 'hapticTick',
        type: 'boolean',
        label: L('Vibración al cambiar', 'Haptic on change'),
        dev: true,
      },
      {
        key: 'showMarkers',
        type: 'boolean',
        label: L('Mostrar posición inactiva', 'Show inactive position'),
        dev: true,
      },
    ],
    prompts: { intro: COMMON_PROMPTS.saccades },
    introPrompt: 'intro',
    difficultyOf: (p) => difficultyForPace(p.pace),
    build: (p, ctx) => buildTwoPointSaccades(p, ctx, axis),
  };
}

export const saccadesHorizontal = twoPointSaccades('horizontal');
export const saccadesVertical = twoPointSaccades('vertical');
