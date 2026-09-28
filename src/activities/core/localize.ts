import type { Localized } from './types';

/** Shorthand for bilingual activity copy. */
export const L = (es: string, en: string): Localized => ({ es, en });

/** Prompts shared by several activities. */
export const COMMON_PROMPTS = {
  headStill: L(
    'Mantén la cabeza quieta y sigue el punto solamente con tus ojos.',
    'Keep your head still and follow the dot using only your eyes.',
  ),
  followCircle: L(
    'Sigue el punto con tus ojos. Mantén la cabeza relajada y quieta.',
    'Follow the point with your eyes. Keep your head relaxed and still.',
  ),
  saccades: L(
    'Mueve tus ojos rápidamente de un punto al otro. Intenta no mover la cabeza.',
    'Move your eyes quickly from one point to the other. Try not to move your head.',
  ),
  breathe: L('Respira lentamente.', 'Breathe slowly.'),
};
