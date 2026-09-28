/**
 * Near / far focus. The phone cannot create a real far target, so it acts only as the near
 * target and the timer: the letter is shown for near focus, then the screen dims while the
 * user looks at an object at least 3 m away. The app guides the activity; it measures nothing.
 */
import { L } from '../core/localize';
import { finalizeProgram, scene } from '../core/program';
import { createRandom } from '../core/random';
import type { ActivityDefinition, ActivityProgram, BuildContext, Segment } from '../core/types';

export const NEAR_LETTERS = ['E', 'F', 'H', 'N', 'R', 'P', 'T'] as const;

export const LETTER_SIZES = { small: 56, medium: 88, large: 128 } as const;

export type NearFarParams = {
  nearSec: number;
  farSec: number;
  cycles: number;
  letterSize: keyof typeof LETTER_SIZES;
  letters: 'E' | 'random';
};

/** Letter per cycle; random letters never repeat consecutively. */
export function nearLetters(
  mode: NearFarParams['letters'],
  cycles: number,
  seed: number,
): string[] {
  if (mode === 'E') return Array.from({ length: cycles }, () => 'E');
  const rand = createRandom(seed);
  const out: string[] = [];
  while (out.length < cycles) {
    const next = NEAR_LETTERS[Math.floor(rand() * NEAR_LETTERS.length)];
    if (next !== out[out.length - 1]) out.push(next);
  }
  return out;
}

export function buildNearFar(p: NearFarParams, ctx: BuildContext): ActivityProgram {
  const cycles = Math.max(1, Math.round(p.cycles));
  const letters = nearLetters(p.letters, cycles, ctx.seed);
  const sizePx = LETTER_SIZES[p.letterSize];
  const segments: Segment[] = [];
  letters.forEach((letter, i) => {
    segments.push(
      scene('letter', p.nearSec * 1000, {
        phase: `near ${i + 1}`,
        letter,
        sizePx,
        text: i === 0 ? 'focus' : 'returnFocus',
        showCountdown: true,
        cue: {
          voice: i === 0 ? 'focus' : 'returnFocus',
          haptic: i === 0 ? undefined : 'transition',
        },
      }),
      scene('far', p.farSec * 1000, {
        phase: `far ${i + 1}`,
        text: 'lookFar',
        showCountdown: true,
        cue: { voice: 'lookFar', haptic: 'transition' },
      }),
    );
  });
  return finalizeProgram({ segments, meta: { cycles, letters: letters.join('') } });
}

export const nearFar: ActivityDefinition<NearFarParams> = {
  id: 'near-far',
  category: 'accommodation',
  icon: 'image-filter-center-focus',
  priority: 'P1',
  usesTarget: false,
  name: L('Enfoque cerca / lejos', 'Near / Far Focus'),
  description: L(
    'Alterna el enfoque entre una letra en la pantalla y un objeto lejano.',
    'Alternate focus between a letter on screen and a distant object.',
  ),
  purpose: L(
    'Practicar cambios de enfoque entre visión cercana y lejana. La app solo guía los tiempos; no mide la acomodación.',
    'Practice shifting focus between near and far. The app only guides the timing; it does not measure accommodation.',
  ),
  instructions: [
    L(
      'Ubícate donde puedas ver un objeto a 3 metros o más.',
      'Position yourself where you can see an object 3 metres or more away.',
    ),
    L('Enfoca la letra hasta verla nítida.', 'Focus on the letter until it looks sharp.'),
    L(
      'Cuando la pantalla se oscurezca, mira el objeto lejano.',
      'When the screen dims, look at the distant object.',
    ),
    L(
      'Vuelve a la letra cuando la voz te lo indique.',
      'Return to the letter when the voice tells you.',
    ),
  ],
  difficulty: 'easy',
  defaultParams: { nearSec: 5, farSec: 5, cycles: 5, letterSize: 'medium', letters: 'E' },
  params: [
    {
      key: 'nearSec',
      type: 'number',
      label: L('Tiempo de cerca', 'Near time'),
      unit: 's',
      min: 2,
      max: 20,
      step: 1,
    },
    {
      key: 'farSec',
      type: 'number',
      label: L('Tiempo de lejos', 'Far time'),
      unit: 's',
      min: 2,
      max: 20,
      step: 1,
    },
    { key: 'cycles', type: 'number', label: L('Ciclos', 'Cycles'), min: 1, max: 20, step: 1 },
    {
      key: 'letterSize',
      type: 'enum',
      label: L('Tamaño de la letra', 'Letter size'),
      options: [
        { value: 'small', label: L('Pequeña', 'Small') },
        { value: 'medium', label: L('Mediana', 'Medium') },
        { value: 'large', label: L('Grande', 'Large') },
      ],
    },
    {
      key: 'letters',
      type: 'enum',
      label: L('Letra', 'Letter'),
      options: [
        { value: 'E', label: L('Siempre E', 'Always E') },
        { value: 'random', label: L('Aleatoria (E F H N R P T)', 'Random (E F H N R P T)') },
      ],
    },
  ],
  prompts: {
    focus: L('Enfoca la letra.', 'Focus on the letter.'),
    lookFar: L(
      'Ahora mira un objeto que esté al menos a tres metros de distancia.',
      'Now look at an object at least three metres away.',
    ),
    returnFocus: L('Vuelve a enfocar la letra.', 'Return your focus to the letter.'),
  },
  build: buildNearFar,
};
