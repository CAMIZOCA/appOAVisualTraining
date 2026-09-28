import { COMMON_PROMPTS, L } from '../core/localize';
import { horizontalLine } from '../core/paths';
import type { ActivityDefinition } from '../core/types';

import {
  buildLineTracking,
  LINE_TRACKING_DEFAULTS,
  lineTrackingDifficulty,
  lineTrackingFields,
  type LineTrackingParams,
} from './lineTracking';

export const horizontalTracking: ActivityDefinition<LineTrackingParams> = {
  id: 'horizontal-tracking',
  category: 'tracking',
  icon: 'arrow-left-right',
  priority: 'P0',
  usesTarget: true,
  name: L('Seguimiento horizontal', 'Horizontal Tracking'),
  description: L(
    'Sigue un punto que se mueve de izquierda a derecha y de regreso.',
    'Follow a dot moving left to right and back.',
  ),
  purpose: L(
    'Practicar movimientos de seguimiento suaves en el eje horizontal.',
    'Practice smooth pursuit eye movements along the horizontal axis.',
  ),
  instructions: [
    L(
      'Sostén el teléfono frente a ti, a una distancia cómoda.',
      'Hold the phone in front of you at a comfortable distance.',
    ),
    L('Mantén la cabeza quieta.', 'Keep your head still.'),
    L('Sigue el punto solamente con tus ojos.', 'Follow the dot using only your eyes.'),
  ],
  difficulty: 'easy',
  speedParam: 'speed',
  defaultParams: LINE_TRACKING_DEFAULTS,
  params: lineTrackingFields(),
  prompts: { intro: COMMON_PROMPTS.headStill },
  introPrompt: 'intro',
  difficultyOf: lineTrackingDifficulty,
  build: (p, ctx) =>
    buildLineTracking(p, ctx, (span) => horizontalLine(ctx.canvas, ctx.safeMargin, span), {
      forward: 'sweep →',
      back: 'sweep ←',
    }),
};
