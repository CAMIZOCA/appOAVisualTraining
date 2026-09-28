/**
 * Activity registry. To add an activity: create its definition module and add it here —
 * the Activities list, Player, Developer mode, history and definition tests pick it up.
 */
import { createRegistry } from './core/registry';
import type { AnyActivityDefinition } from './core/types';
import { randomSaccades } from './saccades/randomSaccades';
import { saccadesHorizontal, saccadesVertical } from './saccades/twoPointSaccades';
import { circleClockwise, circleCounterclockwise } from './tracking/circle';
import { hPattern } from './tracking/hPattern';
import { horizontalTracking } from './tracking/horizontal';
import { infinity } from './tracking/infinity';
import { star } from './tracking/star';
import { verticalTracking } from './tracking/vertical';

/** Display order in the Activities list. */
export const ACTIVITY_DEFINITIONS: AnyActivityDefinition[] = [
  horizontalTracking,
  verticalTracking,
  circleClockwise,
  circleCounterclockwise,
  infinity,
  star,
  hPattern,
  saccadesHorizontal,
  saccadesVertical,
  randomSaccades,
];

export const activities = createRegistry(ACTIVITY_DEFINITIONS);
