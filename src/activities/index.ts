/**
 * Activity registry. To add an activity: create its definition module and add it here —
 * the Activities list, Player, Developer mode, history and definition tests pick it up.
 */
import { createRegistry } from './core/registry';
import type { AnyActivityDefinition } from './core/types';
import { horizontalTracking } from './tracking/horizontal';
import { verticalTracking } from './tracking/vertical';

export const ACTIVITY_DEFINITIONS: AnyActivityDefinition[] = [horizontalTracking, verticalTracking];

export const activities = createRegistry(ACTIVITY_DEFINITIONS);
