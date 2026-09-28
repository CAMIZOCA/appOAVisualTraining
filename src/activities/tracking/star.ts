/**
 * Star / asterisk: movements from the center toward 4 or 8 directions.
 */
import { amplitudeField, dwellField, num, speedField } from '../core/fields';
import { center } from '../core/geometry';
import { L } from '../core/localize';
import { EIGHT_DIRECTIONS, FOUR_DIRECTIONS, starTip, type StarDirectionId } from '../core/paths';
import { finalizeProgram, guideFrom, hold, motion } from '../core/program';
import { createRandom, shuffle } from '../core/random';
import { difficultyForSpeed, speedPxPerSec } from '../core/speed';
import type {
  ActivityDefinition,
  ActivityProgram,
  BuildContext,
  Point,
  Segment,
  SpeedLevel,
} from '../core/types';

export type StarParams = {
  directions: '4' | '8' | 'random';
  returnToCenter: boolean;
  rounds: number;
  speed: SpeedLevel;
  dwellMs: number;
  amplitude: number;
  stretch: boolean;
  showPath: boolean;
};

/** Direction order for one round. Random: all 8 shuffled, never repeating the previous one. */
export function starSequence(
  mode: StarParams['directions'],
  rounds: number,
  seed: number,
): StarDirectionId[] {
  const rand = createRandom(seed);
  const seq: StarDirectionId[] = [];
  for (let r = 0; r < rounds; r++) {
    if (mode === 'random') {
      let round = shuffle(rand, EIGHT_DIRECTIONS);
      if (round[0] === seq[seq.length - 1]) round = [...round.slice(1), round[0]];
      seq.push(...round);
    } else {
      seq.push(...(mode === '4' ? FOUR_DIRECTIONS : EIGHT_DIRECTIONS));
    }
  }
  return seq;
}

export function buildStar(p: StarParams, ctx: BuildContext): ActivityProgram {
  const c = center(ctx.canvas);
  const scale = num(p, 'amplitude', 100) / 100;
  const pxps = speedPxPerSec(p.speed, ctx.canvas, ctx.reduceMotion);
  const dwell = num(p, 'dwellMs', 400);
  const dirs = starSequence(p.directions, Math.max(1, Math.round(p.rounds)), ctx.seed);
  const tip = (d: StarDirectionId): Point =>
    starTip(ctx.canvas, ctx.safeMargin, d, scale, p.stretch);

  const segments: Segment[] = [hold(c, 600, { phase: 'center' })];
  let at = c;
  for (const d of dirs) {
    const t = tip(d);
    segments.push(motion([at, t], pxps, { phase: `→ ${d}`, easing: 'inOutSine' }));
    if (dwell > 0) segments.push(hold(t, dwell, { phase: `hold ${d}` }));
    at = t;
    if (p.returnToCenter) {
      segments.push(motion([t, c], pxps, { phase: '→ center', easing: 'inOutSine' }));
      if (dwell > 0) segments.push(hold(c, dwell / 2, { phase: 'center' }));
      at = c;
    }
  }
  if (!p.returnToCenter)
    segments.push(motion([at, c], pxps, { phase: '→ center', easing: 'inOutSine' }));

  const used = p.directions === '4' ? FOUR_DIRECTIONS : EIGHT_DIRECTIONS;
  return finalizeProgram({
    segments,
    guides: p.showPath ? used.map((d) => guideFrom([c, tip(d)])) : [],
    meta: { pxPerSec: pxps, moves: dirs.length },
  });
}

export const star: ActivityDefinition<StarParams> = {
  id: 'star',
  category: 'oculomotor',
  icon: 'asterisk',
  priority: 'P0',
  usesTarget: true,
  name: L('Estrella', 'Star'),
  description: L(
    'Desde el centro, sigue el punto hacia arriba, abajo, los lados y las diagonales.',
    'From the center, follow the dot up, down, sideways and along the diagonals.',
  ),
  purpose: L(
    'Recorrer las principales direcciones de la mirada de forma guiada.',
    'Move through the main directions of gaze in a guided way.',
  ),
  instructions: [
    L('Mira el punto en el centro de la pantalla.', 'Look at the dot in the center of the screen.'),
    L(
      'Síguelo hacia cada dirección solo con tus ojos.',
      'Follow it toward each direction using only your eyes.',
    ),
    L('Mantén la cabeza quieta y relajada.', 'Keep your head still and relaxed.'),
  ],
  difficulty: 'medium',
  speedParam: 'speed',
  defaultParams: {
    directions: '8',
    returnToCenter: true,
    rounds: 2,
    speed: 'slow',
    dwellMs: 400,
    amplitude: 100,
    stretch: false,
    showPath: false,
  },
  params: [
    {
      key: 'directions',
      type: 'enum',
      label: L('Direcciones', 'Directions'),
      options: [
        { value: '4', label: L('4 direcciones', '4 directions') },
        { value: '8', label: L('8 direcciones', '8 directions') },
        { value: 'random', label: L('Aleatorias', 'Random') },
      ],
    },
    {
      key: 'returnToCenter',
      type: 'boolean',
      label: L('Volver al centro tras cada movimiento', 'Return to center after each movement'),
    },
    { key: 'rounds', type: 'number', label: L('Rondas', 'Rounds'), min: 1, max: 6, step: 1 },
    speedField(),
    dwellField(L('Pausa en cada punta', 'Dwell at each tip')),
    amplitudeField('amplitude', L('Longitud de los brazos', 'Arm length')),
    {
      key: 'stretch',
      type: 'boolean',
      label: L('Usar toda la altura (elipse)', 'Use full height (ellipse)'),
      dev: true,
    },
    { key: 'showPath', type: 'boolean', label: L('Mostrar trayectoria', 'Show path'), dev: true },
  ],
  prompts: {
    intro: L(
      'Mira el punto en el centro. Síguelo con tus ojos hacia cada dirección, sin mover la cabeza.',
      'Look at the dot in the center. Follow it with your eyes in each direction without moving your head.',
    ),
  },
  introPrompt: 'intro',
  difficultyOf: (p) => difficultyForSpeed(p.speed),
  build: buildStar,
};
