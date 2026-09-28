import { L } from '../core/localize';
import { finalizeProgram, scene } from '../core/program';
import type { ActivityDefinition, ActivityProgram, BuildContext, SceneKind } from '../core/types';

export type VisualBreakParams = {
  /** Scales every step (developer mode), 100 = the standard 2-minute break. */
  scale: number;
};

/** The standard 2-minute break: step, scene, seconds. */
export const VISUAL_BREAK_STEPS: { key: string; scene: SceneKind; seconds: number }[] = [
  { key: 'closeEyes', scene: 'eyesClosed', seconds: 20 },
  { key: 'blink', scene: 'blink', seconds: 20 },
  { key: 'far', scene: 'far', seconds: 30 },
  { key: 'shoulders', scene: 'relax', seconds: 20 },
  { key: 'breathe', scene: 'breathe', seconds: 20 },
  { key: 'return', scene: 'message', seconds: 10 },
];

export function buildVisualBreak(p: VisualBreakParams, _ctx: BuildContext): ActivityProgram {
  const k = p.scale / 100;
  const segments = VISUAL_BREAK_STEPS.map((step, i) =>
    scene(step.scene, Math.round(step.seconds * k) * 1000, {
      phase: step.key,
      text: step.key,
      showCountdown: true,
      // After closed eyes, a haptic signals the change of step.
      cue: { voice: step.key, haptic: i === 1 ? 'transition' : undefined },
    }),
  );
  return finalizeProgram({ segments });
}

export const visualBreak: ActivityDefinition<VisualBreakParams> = {
  id: 'visual-break',
  category: 'relaxation',
  icon: 'weather-sunset',
  priority: 'P1',
  usesTarget: false,
  name: L('Pausa visual', 'Visual Break'),
  description: L(
    'Pausa guiada de 2 minutos para descansar la vista.',
    'A guided 2-minute break to rest your eyes.',
  ),
  purpose: L(
    'Descansar la vista con ojos cerrados, parpadeo, mirada lejana y respiración.',
    'Rest your eyes with closed eyes, blinking, distance viewing and breathing.',
  ),
  instructions: [
    L(
      'Sigue las indicaciones de voz y la cuenta regresiva.',
      'Follow the voice and the countdown.',
    ),
    L(
      'Necesitarás un objeto lejano para mirar durante 30 segundos.',
      'You will need a distant object to look at for 30 seconds.',
    ),
  ],
  difficulty: 'easy',
  defaultParams: { scale: 100 },
  params: [
    {
      key: 'scale',
      type: 'number',
      label: L('Duración de cada paso', 'Length of each step'),
      unit: '%',
      min: 50,
      max: 200,
      step: 25,
      dev: true,
    },
  ],
  prompts: {
    closeEyes: L('Cierra los ojos y descansa.', 'Close your eyes and rest.'),
    blink: L('Abre los ojos y parpadea lentamente.', 'Open your eyes and blink slowly.'),
    far: L(
      'Mira un objeto lejano, a más de tres metros.',
      'Look at a distant object, more than three metres away.',
    ),
    shoulders: L('Relaja los hombros y el cuello.', 'Relax your shoulders and neck.'),
    breathe: L('Respira lentamente.', 'Breathe slowly.'),
    return: L(
      'Vuelve a la pantalla cuando estés listo.',
      'Come back to the screen when you are ready.',
    ),
  },
  build: buildVisualBreak,
};
