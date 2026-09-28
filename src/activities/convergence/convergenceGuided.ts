/**
 * Guided convergence (experimental). A centered high-contrast target plus timed voice steps.
 * Progress is time-based only. The app does NOT measure the near point of convergence.
 */
import { L } from '../core/localize';
import { finalizeProgram, scene } from '../core/program';
import type { ActivityDefinition, ActivityProgram, BuildContext } from '../core/types';

export type ConvergenceParams = {
  durationSec: number;
  target: 'E' | 'dot';
  targetSize: 'small' | 'medium' | 'large';
};

export const CONVERGENCE_SIZES = { small: 32, medium: 48, large: 64 } as const;

/** Voice steps and their relative weight in the timeline. */
export const CONVERGENCE_STEPS = [
  { key: 'hold', weight: 4 },
  { key: 'align', weight: 4 },
  { key: 'closer', weight: 6 },
  { key: 'single', weight: 5 },
  { key: 'double', weight: 5 },
  { key: 'back', weight: 6 },
] as const;

export function buildConvergence(p: ConvergenceParams, _ctx: BuildContext): ActivityProgram {
  const totalWeight = CONVERGENCE_STEPS.reduce((s, x) => s + x.weight, 0);
  const totalMs = p.durationSec * 1000;
  const segments = CONVERGENCE_STEPS.map((step, i) =>
    scene('convergence', (totalMs * step.weight) / totalWeight, {
      phase: `step ${i + 1}: ${step.key}`,
      text: step.key,
      letter: p.target === 'E' ? 'E' : undefined,
      sizePx: CONVERGENCE_SIZES[p.targetSize],
      cue: { voice: step.key },
    }),
  );
  return finalizeProgram({ segments, meta: { steps: segments.length } });
}

export const convergenceGuided: ActivityDefinition<ConvergenceParams> = {
  id: 'convergence-guided',
  category: 'convergence',
  icon: 'arrow-collapse-horizontal',
  priority: 'P1',
  usesTarget: false,
  name: L('Convergencia guiada', 'Guided Convergence'),
  description: L(
    'Acerca el teléfono lentamente manteniendo el objetivo sencillo (experimental).',
    'Slowly bring the phone closer while keeping the target single (experimental).',
  ),
  purpose: L(
    'Actividad experimental de convergencia guiada por voz. No mide el punto próximo de convergencia.',
    'Experimental voice-guided convergence activity. It does not measure the near point of convergence.',
  ),
  instructions: [
    L(
      'Sostén el teléfono centrado frente a tu cara.',
      'Hold your phone centered in front of your face.',
    ),
    L(
      'Acércalo despacio mientras el objetivo se vea sencillo.',
      'Bring it closer slowly while the target stays single.',
    ),
    L(
      'Si se ve doble, deja de acercarlo y aléjalo un poco.',
      'If it becomes double, stop and move it slightly away.',
    ),
  ],
  difficulty: 'medium',
  defaultParams: { durationSec: 30, target: 'E', targetSize: 'medium' },
  params: [
    {
      key: 'durationSec',
      type: 'number',
      label: L('Duración', 'Duration'),
      unit: 's',
      min: 20,
      max: 90,
      step: 5,
    },
    {
      key: 'target',
      type: 'enum',
      label: L('Objetivo', 'Target'),
      options: [
        { value: 'E', label: L('Letra E', 'Letter E') },
        { value: 'dot', label: L('Círculo con punto', 'Circle with dot') },
      ],
    },
    {
      key: 'targetSize',
      type: 'enum',
      label: L('Tamaño', 'Size'),
      options: [
        { value: 'small', label: L('Pequeño', 'Small') },
        { value: 'medium', label: L('Mediano', 'Medium') },
        { value: 'large', label: L('Grande', 'Large') },
      ],
    },
  ],
  prompts: {
    hold: L(
      'Sostén el teléfono centrado frente a tu cara.',
      'Hold your phone centered in front of your face.',
    ),
    align: L(
      'Mantén el objetivo alineado con el centro de tu nariz.',
      'Keep the target aligned with the middle of your nose.',
    ),
    closer: L('Acerca el teléfono lentamente.', 'Slowly bring the phone closer.'),
    single: L('Intenta mantener la imagen sencilla.', 'Try to keep the image single.'),
    double: L(
      'Si la imagen se ve doble, deja de acercar el teléfono.',
      'If the image becomes double, stop approaching.',
    ),
    back: L(
      'Aleja el teléfono un poco hasta que el objetivo vuelva a verse sencillo.',
      'Move the phone slightly farther away until the target becomes single again.',
    ),
  },
  build: buildConvergence,
};
