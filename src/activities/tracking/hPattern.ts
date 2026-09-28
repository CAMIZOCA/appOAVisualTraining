/**
 * H pattern: top-left → bottom-left → center-left → center-right → top-right → bottom-right,
 * then the same route backwards. Guided mode shows a faint H.
 */
import {
  amplitudeField,
  dwellField,
  durationField,
  endModeField,
  num,
  repetitionsField,
  speedField,
} from '../core/fields';
import { L } from '../core/localize';
import { hPatternPoints } from '../core/paths';
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
  ActivityDefinition,
  ActivityProgram,
  BuildContext,
  Point,
  Segment,
  SpeedLevel,
} from '../core/types';

export type HPatternParams = {
  mode: 'guided' | 'challenge';
  speed: SpeedLevel;
  endMode: EndMode;
  durationSec: number;
  repetitions: number;
  dwellMs: number;
  width: number;
  height: number;
};

const LEG_NAMES = ['TL→BL', 'BL→CL', 'CL→CR', 'CR→TR', 'TR→BR'];

export function buildHPattern(p: HPatternParams, ctx: BuildContext): ActivityProgram {
  const pts = hPatternPoints(
    ctx.canvas,
    ctx.safeMargin,
    num(p, 'width', 100) / 100,
    num(p, 'height', 100) / 100,
  );
  const pxps = speedPxPerSec(p.speed, ctx.canvas, ctx.reduceMotion);
  const dwell = num(p, 'dwellMs', 300);

  const route = (points: Point[], names: string[]): Segment[] => {
    const segs: Segment[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      segs.push(motion([points[i], points[i + 1]], pxps, { phase: names[i], easing: 'inOutSine' }));
      if (dwell > 0) segs.push(hold(points[i + 1], dwell, { phase: 'hold' }));
    }
    return segs;
  };
  const back = [...pts].reverse();
  const backNames = [...LEG_NAMES].reverse().map((n) => n.split('→').reverse().join('→'));

  const { segments, cycles } = repeatCycles(
    () => [...route(pts, LEG_NAMES), ...route(back, backNames)],
    { endMode: p.endMode, repetitions: p.repetitions, durationMs: p.durationSec * 1000 },
  );
  const [tl, bl, cl, cr, tr, br] = pts;
  return finalizeProgram({
    segments: [hold(pts[0], 500, { phase: 'start' }), ...segments],
    guides:
      p.mode === 'guided' ? [guideFrom([tl, bl]), guideFrom([cl, cr]), guideFrom([tr, br])] : [],
    meta: { pxPerSec: pxps, cycles },
  });
}

export const hPattern: ActivityDefinition<HPatternParams> = {
  id: 'h-pattern',
  category: 'oculomotor',
  icon: 'alpha-h-box-outline',
  priority: 'P1',
  usesTarget: true,
  name: L('Patrón H', 'H Pattern'),
  description: L(
    'Sigue el punto a lo largo de una trayectoria en forma de H.',
    'Follow the dot along an H-shaped path.',
  ),
  purpose: L(
    'Recorrer posiciones de mirada verticales y horizontales siguiendo un patrón en H.',
    'Move through vertical and horizontal gaze positions following an H pattern.',
  ),
  instructions: [
    L('Mantén la cabeza quieta.', 'Keep your head still.'),
    L('Sigue el punto por cada tramo de la H.', 'Follow the dot along each part of the H.'),
    L('En modo reto la trayectoria no se muestra.', 'In challenge mode the path is not shown.'),
  ],
  difficulty: 'medium',
  speedParam: 'speed',
  defaultParams: {
    mode: 'guided',
    speed: 'slow',
    endMode: 'repetitions',
    durationSec: 40,
    repetitions: 2,
    dwellMs: 300,
    width: 100,
    height: 100,
  },
  params: [
    {
      key: 'mode',
      type: 'enum',
      label: L('Modo', 'Mode'),
      options: [
        { value: 'guided', label: L('Guiado (con trayectoria)', 'Guided (path visible)') },
        { value: 'challenge', label: L('Reto (solo el punto)', 'Challenge (dot only)') },
      ],
    },
    speedField(),
    { ...endModeField(), dev: false },
    durationField(10, 180, 5),
    repetitionsField(L('Repeticiones (ida y vuelta)', 'Repetitions (there and back)'), 1, 10),
    dwellField(L('Pausa en esquinas', 'Dwell at corners')),
    amplitudeField('width', L('Ancho de la H', 'H width')),
    amplitudeField('height', L('Alto de la H', 'H height')),
  ],
  prompts: {
    intro: L(
      'Sigue el punto por la letra H solamente con tus ojos. Mantén la cabeza quieta.',
      'Follow the dot along the letter H using only your eyes. Keep your head still.',
    ),
  },
  introPrompt: 'intro',
  difficultyOf: (p) =>
    p.mode === 'challenge' ? (p.speed === 'fast' ? 'hard' : 'medium') : difficultyForSpeed(p.speed),
  build: buildHPattern,
};
