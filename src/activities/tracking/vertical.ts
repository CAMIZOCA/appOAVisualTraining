import { COMMON_PROMPTS, L } from '../core/localize';
import { verticalLine } from '../core/paths';
import type { ActivityDefinition } from '../core/types';

import {
  buildLineTracking,
  LINE_TRACKING_DEFAULTS,
  lineTrackingDifficulty,
  lineTrackingFields,
  type LineTrackingParams,
} from './lineTracking';

export const verticalTracking: ActivityDefinition<LineTrackingParams> = {
  id: 'vertical-tracking',
  category: 'tracking',
  icon: 'arrow-up-down',
  priority: 'P0',
  usesTarget: true,
  name: L('Seguimiento vertical', 'Vertical Tracking'),
  description: L(
    'Sigue un punto que sube y baja por la pantalla.',
    'Follow a dot moving up and down the screen.',
  ),
  purpose: L(
    'Practicar movimientos de seguimiento suaves en el eje vertical.',
    'Practice smooth pursuit eye movements along the vertical axis.',
  ),
  instructions: [
    L(
      'Sostén el teléfono frente a ti, a una distancia cómoda.',
      'Hold the phone in front of you at a comfortable distance.',
    ),
    L('Mantén la cabeza quieta.', 'Keep your head still.'),
    L(
      'Sigue el punto de arriba hacia abajo solamente con tus ojos.',
      'Follow the dot up and down using only your eyes.',
    ),
  ],
  difficulty: 'easy',
  speedParam: 'speed',
  defaultParams: LINE_TRACKING_DEFAULTS,
  params: lineTrackingFields(),
  prompts: { intro: COMMON_PROMPTS.headStill },
  introPrompt: 'intro',
  difficultyOf: lineTrackingDifficulty,
  // The canvas already excludes HUD, controls and system UI; the safe band keeps the
  // target away from the remaining edges.
  build: (p, ctx) =>
    buildLineTracking(p, ctx, (span) => verticalLine(ctx.canvas, ctx.safeMargin, span), {
      forward: 'sweep ↓',
      back: 'sweep ↑',
    }),
};
