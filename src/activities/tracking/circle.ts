/**
 * Circle tracking. Clockwise and counterclockwise are the same activity with a different
 * `direction` — one factory, two registry entries.
 */
import { amplitudeField, showPathField, speedField } from '../core/fields';
import { center, maxRadius } from '../core/geometry';
import { COMMON_PROMPTS, L } from '../core/localize';
import { circlePoints, type Direction } from '../core/paths';
import { finalizeProgram, guideFrom, motion } from '../core/program';
import { difficultyForSpeed, speedPxPerSec } from '../core/speed';
import type { ActivityDefinition, ActivityProgram, BuildContext, SpeedLevel } from '../core/types';

export type CircleParams = {
  turns: number;
  speed: SpeedLevel;
  diameter: 'small' | 'medium' | 'large';
  /** Fine radius control (% of the largest safe radius), developer mode. */
  amplitude: number;
  showPath: boolean;
};

export const DIAMETER_FACTORS: Record<CircleParams['diameter'], number> = {
  small: 0.55,
  medium: 0.78,
  large: 1,
};

export function buildCircle(
  params: CircleParams,
  ctx: BuildContext,
  direction: Direction,
): ActivityProgram {
  const c = center(ctx.canvas);
  const r =
    maxRadius(ctx.canvas, ctx.safeMargin) *
    DIAMETER_FACTORS[params.diameter] *
    (params.amplitude / 100);
  const pxps = speedPxPerSec(params.speed, ctx.canvas, ctx.reduceMotion);
  const segments = [];
  // One segment per revolution keeps each segment short and the debug overlay readable.
  for (let i = 0; i < Math.max(1, Math.round(params.turns)); i++) {
    segments.push(
      motion(circlePoints(c, r, 1, direction), pxps, {
        phase: `${direction === 'cw' ? '↻' : '↺'} ${i + 1}`,
        easing: 'linear',
      }),
    );
  }
  return finalizeProgram({
    segments,
    guides: params.showPath ? [guideFrom(circlePoints(c, r, 1, direction))] : [],
    meta: { pxPerSec: pxps, radius: r },
  });
}

function circleActivity(direction: Direction): ActivityDefinition<CircleParams> {
  const cw = direction === 'cw';
  return {
    id: cw ? 'circle-clockwise' : 'circle-counterclockwise',
    category: 'tracking',
    icon: cw ? 'rotate-right' : 'rotate-left',
    priority: 'P0',
    usesTarget: true,
    name: cw
      ? L('Círculo horario', 'Clockwise Circle')
      : L('Círculo antihorario', 'Counterclockwise Circle'),
    description: cw
      ? L(
          'Sigue un punto que recorre un gran círculo en sentido horario.',
          'Follow a dot around a large circle, clockwise.',
        )
      : L(
          'Sigue un punto que recorre un gran círculo en sentido antihorario.',
          'Follow a dot around a large circle, counterclockwise.',
        ),
    purpose: L(
      'Practicar el seguimiento suave combinando movimientos horizontales, verticales y oblicuos.',
      'Practice smooth pursuit combining horizontal, vertical and oblique movements.',
    ),
    instructions: [
      L('Mantén la cabeza relajada y quieta.', 'Keep your head relaxed and still.'),
      L('El punto empieza arriba del círculo.', 'The dot starts at the top of the circle.'),
      L(
        'Síguelo con tus ojos durante toda la vuelta.',
        'Follow it with your eyes all the way around.',
      ),
    ],
    difficulty: 'easy',
    speedParam: 'speed',
    defaultParams: { turns: 2, speed: 'slow', diameter: 'large', amplitude: 100, showPath: false },
    params: [
      {
        key: 'turns',
        type: 'enum',
        label: L('Vueltas', 'Revolutions'),
        options: [
          { value: 1, label: L('1 vuelta', '1 revolution') },
          { value: 2, label: L('2 vueltas', '2 revolutions') },
          { value: 3, label: L('3 vueltas', '3 revolutions') },
        ],
      },
      speedField(),
      {
        key: 'diameter',
        type: 'enum',
        label: L('Diámetro', 'Diameter'),
        options: [
          { value: 'small', label: L('Pequeño', 'Small') },
          { value: 'medium', label: L('Mediano', 'Medium') },
          { value: 'large', label: L('Grande', 'Large') },
        ],
      },
      amplitudeField('amplitude', L('Ajuste fino del radio', 'Radius fine-tune')),
      showPathField(true),
    ],
    prompts: { intro: COMMON_PROMPTS.followCircle },
    introPrompt: 'intro',
    difficultyOf: (p) => difficultyForSpeed(p.speed),
    build: (p, ctx) => buildCircle(p, ctx, direction),
  };
}

export const circleClockwise = circleActivity('cw');
export const circleCounterclockwise = circleActivity('ccw');
