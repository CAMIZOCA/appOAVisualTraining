import {
  amplitudeField,
  durationField,
  endModeField,
  num,
  repetitionsField,
  showPathField,
  speedField,
} from '../core/fields';
import { center } from '../core/geometry';
import { COMMON_PROMPTS, L } from '../core/localize';
import { infinityExtents, infinityPoints, type Orientation } from '../core/paths';
import { finalizeProgram, guideFrom, motion, repeatCycles, type EndMode } from '../core/program';
import { difficultyForSpeed, speedPxPerSec } from '../core/speed';
import type { ActivityDefinition, ActivityProgram, BuildContext, SpeedLevel } from '../core/types';

export type InfinityParams = {
  orientation: Orientation;
  speed: SpeedLevel;
  endMode: EndMode;
  durationSec: number;
  repetitions: number;
  amplitude: number;
  showPath: boolean;
};

export function buildInfinity(p: InfinityParams, ctx: BuildContext): ActivityProgram {
  const { ax, ay } = infinityExtents(
    ctx.canvas,
    ctx.safeMargin,
    p.orientation,
    num(p, 'amplitude', 100) / 100,
  );
  const pts = infinityPoints(center(ctx.canvas), ax, ay, p.orientation);
  const pxps = speedPxPerSec(p.speed, ctx.canvas, ctx.reduceMotion);
  const { segments, cycles } = repeatCycles(
    (i) => [motion(pts, pxps, { phase: `∞ ${i + 1}`, easing: 'linear' })],
    { endMode: p.endMode, repetitions: p.repetitions, durationMs: p.durationSec * 1000 },
  );
  return finalizeProgram({
    segments,
    guides: p.showPath ? [guideFrom(pts)] : [],
    meta: { pxPerSec: pxps, loops: cycles },
  });
}

export const infinity: ActivityDefinition<InfinityParams> = {
  id: 'infinity',
  category: 'tracking',
  icon: 'infinity',
  priority: 'P0',
  usesTarget: true,
  name: L('Infinito / ocho', 'Figure Eight / Infinity'),
  description: L(
    'Sigue un punto que dibuja un ∞ continuo y suave.',
    'Follow a dot drawing a smooth, continuous ∞.',
  ),
  purpose: L(
    'Practicar el seguimiento suave con cambios de dirección continuos.',
    'Practice smooth pursuit with continuous changes of direction.',
  ),
  instructions: [
    L('Mantén la cabeza quieta.', 'Keep your head still.'),
    L('Sigue el punto sin adelantarte.', 'Follow the dot without jumping ahead.'),
    L('Respira con normalidad.', 'Breathe normally.'),
  ],
  difficulty: 'medium',
  speedParam: 'speed',
  defaultParams: {
    orientation: 'horizontal',
    speed: 'slow',
    endMode: 'time',
    durationSec: 30,
    repetitions: 3,
    amplitude: 100,
    showPath: false,
  },
  params: [
    {
      key: 'orientation',
      type: 'enum',
      label: L('Orientación', 'Orientation'),
      options: [
        { value: 'horizontal', label: L('Infinito horizontal ∞', 'Horizontal infinity ∞') },
        { value: 'vertical', label: L('Ocho vertical 8', 'Vertical figure eight 8') },
      ],
    },
    speedField(),
    { ...endModeField(), dev: false },
    durationField(10, 180, 5),
    repetitionsField(L('Vueltas completas', 'Full loops'), 1, 20),
    amplitudeField('amplitude', L('Tamaño', 'Size')),
    showPathField(true),
  ],
  prompts: { intro: COMMON_PROMPTS.headStill },
  introPrompt: 'intro',
  // Continuous direction changes make ∞ one level harder than straight tracking.
  difficultyOf: (p) =>
    p.speed === 'verySlow' ? 'easy' : difficultyForSpeed(p.speed) === 'hard' ? 'hard' : 'medium',
  build: buildInfinity,
};
