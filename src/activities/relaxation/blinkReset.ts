import { L } from '../core/localize';
import { finalizeProgram, scene } from '../core/program';
import type { ActivityDefinition, ActivityProgram, BuildContext, Segment } from '../core/types';

export type BlinkResetParams = {
  closedSec: number;
  blinkSec: number;
  rounds: number;
};

export function buildBlinkReset(p: BlinkResetParams, _ctx: BuildContext): ActivityProgram {
  const segments: Segment[] = [
    scene('relax', 6000, { phase: 'relax', text: 'relax', cue: { voice: 'relax' } }),
  ];
  for (let r = 0; r < Math.max(1, Math.round(p.rounds)); r++) {
    segments.push(
      scene('eyesClosed', p.closedSec * 1000, {
        phase: `closed ${r + 1}`,
        text: 'close',
        showCountdown: true,
        cue: { voice: 'close' },
      }),
      scene('message', 3000, {
        phase: 'open',
        text: 'open',
        // Eyes were closed: a gentle haptic tells the user when to open them.
        cue: { voice: 'open', haptic: 'transition' },
      }),
      scene('blink', p.blinkSec * 1000, {
        phase: `blink ${r + 1}`,
        text: 'blink',
        showCountdown: true,
        cue: { voice: 'blink' },
      }),
      scene('eyesClosed', p.closedSec * 1000, {
        phase: `closed again ${r + 1}`,
        text: 'closeAgain',
        showCountdown: true,
        cue: { voice: 'closeAgain' },
      }),
    );
  }
  segments.push(
    scene('breathe', 6000, {
      phase: 'finish',
      text: 'finish',
      cue: { voice: 'finish', haptic: 'transition' },
    }),
  );
  return finalizeProgram({ segments });
}

export const blinkReset: ActivityDefinition<BlinkResetParams> = {
  id: 'blink-reset',
  category: 'relaxation',
  icon: 'eye-refresh-outline',
  priority: 'P1',
  usesTarget: false,
  name: L('Reinicio con parpadeo', 'Blink Reset'),
  description: L(
    'Una pausa breve para relajar los ojos: cerrar, abrir y parpadear lentamente.',
    'A short pause to relax your eyes: close, open and blink slowly.',
  ),
  purpose: L(
    'Relajar y humectar los ojos después de actividades visuales.',
    'Relax and refresh your eyes after visual activities.',
  ),
  instructions: [
    L(
      'Sigue las indicaciones de voz; puedes cerrar los ojos cuando se te pida.',
      'Follow the voice; close your eyes when asked.',
    ),
    L(
      'Una vibración suave te avisará cuando abrir los ojos.',
      'A gentle vibration will tell you when to open your eyes.',
    ),
  ],
  difficulty: 'easy',
  defaultParams: { closedSec: 5, blinkSec: 10, rounds: 1 },
  params: [
    {
      key: 'closedSec',
      type: 'number',
      label: L('Ojos cerrados', 'Eyes closed'),
      unit: 's',
      min: 3,
      max: 15,
      step: 1,
    },
    {
      key: 'blinkSec',
      type: 'number',
      label: L('Tiempo de parpadeo', 'Blinking time'),
      unit: 's',
      min: 5,
      max: 20,
      step: 1,
    },
    { key: 'rounds', type: 'number', label: L('Rondas', 'Rounds'), min: 1, max: 3, step: 1 },
  ],
  prompts: {
    relax: L('Relaja los hombros.', 'Relax your shoulders.'),
    close: L('Cierra los ojos durante cinco segundos.', 'Close your eyes for five seconds.'),
    open: L('Abre los ojos.', 'Open your eyes.'),
    blink: L('Parpadea lentamente cinco veces.', 'Blink slowly five times.'),
    closeAgain: L('Cierra los ojos de nuevo.', 'Close your eyes again.'),
    finish: L('Abre los ojos y respira lentamente.', 'Open your eyes and breathe slowly.'),
  },
  build: buildBlinkReset,
};
