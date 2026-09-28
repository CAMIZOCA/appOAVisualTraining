/**
 * Random saccades on a predefined 3×3 grid of safe normalized positions — never arbitrary
 * coordinates. Difficulty controls the jump distance between successive targets.
 */
import { num, paceField } from '../core/fields';
import { L } from '../core/localize';
import { gridPoint, SACCADE_GRID } from '../core/paths';
import { finalizeProgram, fixation } from '../core/program';
import { createRandom, pickRandom } from '../core/random';
import { effectivePace, PACE_MS } from '../core/speed';
import type {
  ActivityDefinition,
  ActivityProgram,
  BuildContext,
  Difficulty,
  Pace,
  Segment,
} from '../core/types';

export type RandomSaccadeParams = {
  count: number;
  pace: Pace;
  level: Difficulty;
  spread: number;
  sound: boolean;
};

/** Distance between two grid cells in cell units (0–2 per axis). */
export function cellDistance(a: number, b: number): number {
  const ca = SACCADE_GRID[a];
  const cb = SACCADE_GRID[b];
  return Math.hypot((ca.x - cb.x) * 2, (ca.y - cb.y) * 2);
}

/** Allowed jump distances per difficulty (cell units). */
export const JUMP_RANGES: Record<Difficulty, [number, number]> = {
  easy: [0.9, 1.5], // neighbours, including diagonals
  medium: [0.9, 2.3], // up to two cells away
  hard: [1.9, 3], // across the screen
};

/**
 * Sequence of grid indices. Every jump respects the difficulty range when possible;
 * if no cell qualifies (e.g. "hard" from the center) the farthest cells are used.
 */
export function randomSaccadeSequence(count: number, level: Difficulty, seed: number): number[] {
  const rand = createRandom(seed);
  const [min, max] = JUMP_RANGES[level];
  const all = SACCADE_GRID.map((_, i) => i);
  const seq: number[] = [level === 'hard' ? pickRandom(rand, [0, 2, 6, 8]) : 4];
  while (seq.length < count) {
    const cur = seq[seq.length - 1];
    const others = all.filter((i) => i !== cur);
    let candidates = others.filter((i) => {
      const d = cellDistance(cur, i);
      return d >= min && d <= max;
    });
    if (candidates.length === 0) {
      const far = Math.max(...others.map((i) => cellDistance(cur, i)));
      candidates = others.filter((i) => cellDistance(cur, i) >= far - 1e-6);
    }
    seq.push(pickRandom(rand, candidates));
  }
  return seq;
}

export function buildRandomSaccades(p: RandomSaccadeParams, ctx: BuildContext): ActivityProgram {
  const count = Math.max(2, Math.round(p.count));
  const ms = PACE_MS[effectivePace(p.pace, ctx.reduceMotion)];
  const spread = num(p, 'spread', 100) / 100;
  const seq = randomSaccadeSequence(count, p.level, ctx.seed);
  const segments: Segment[] = seq.map((cell, i) =>
    fixation(
      gridPoint(SACCADE_GRID[cell], ctx.canvas, ctx.safeMargin, spread),
      i === 0 ? ms + 600 : ms,
      i,
      {
        phase: SACCADE_GRID[cell].id,
        cue: i === 0 ? undefined : { sound: p.sound ? 'tick' : undefined },
      },
    ),
  );
  return finalizeProgram({ segments, meta: { fixationMs: ms, targets: count, seed: ctx.seed } });
}

export const randomSaccades: ActivityDefinition<RandomSaccadeParams> = {
  id: 'saccades-random',
  category: 'saccades',
  icon: 'dots-grid',
  priority: 'P1',
  usesTarget: true,
  name: L('Sacádicos aleatorios', 'Random Saccades'),
  description: L(
    'Un punto aparece en distintas posiciones seguras de la pantalla.',
    'A dot appears at different safe positions on the screen.',
  ),
  purpose: L(
    'Practicar la localización rápida de objetivos en distintas direcciones.',
    'Practice quickly locating targets in different directions.',
  ),
  instructions: [
    L('Mantén la cabeza quieta.', 'Keep your head still.'),
    L(
      'Cuando el punto aparezca en otro lugar, míralo lo más rápido que puedas.',
      'When the dot appears somewhere else, look at it as quickly as you can.',
    ),
  ],
  difficulty: 'medium',
  defaultParams: { count: 20, pace: 'medium', level: 'medium', spread: 100, sound: true },
  params: [
    {
      key: 'count',
      type: 'number',
      label: L('Número de objetivos', 'Number of targets'),
      min: 5,
      max: 80,
      step: 5,
    },
    paceField(),
    {
      key: 'level',
      type: 'enum',
      label: L('Dificultad (distancia entre saltos)', 'Difficulty (jump distance)'),
      options: [
        { value: 'easy', label: L('Fácil', 'Easy') },
        { value: 'medium', label: L('Intermedio', 'Intermediate') },
        { value: 'hard', label: L('Avanzado', 'Advanced') },
      ],
    },
    {
      key: 'spread',
      type: 'number',
      label: L('Extensión de la cuadrícula', 'Grid spread'),
      unit: '%',
      min: 40,
      max: 100,
      step: 5,
      dev: true,
    },
    { key: 'sound', type: 'boolean', label: L('Sonido al cambiar', 'Sound on change') },
  ],
  prompts: {
    intro: L(
      'Busca el punto con tus ojos cada vez que cambie de lugar. Intenta no mover la cabeza.',
      'Find the dot with your eyes every time it moves. Try not to move your head.',
    ),
  },
  introPrompt: 'intro',
  difficultyOf: (p) => p.level,
  build: buildRandomSaccades,
};
