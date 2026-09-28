import { activities } from '@/activities';
import type { AnyActivityDefinition } from '@/activities/core/types';
import type { SessionRecord } from '@/types/session';

/** Rotates daily through a balanced set, skipping the last activity done. */
const RECOMMENDATION_ROTATION = [
  'horizontal-tracking',
  'saccades-horizontal',
  'circle-clockwise',
  'star',
  'near-far',
  'infinity',
  'saccades-random',
  'blink-reset',
];

export function recommendedActivity(
  records: SessionRecord[],
  now = new Date(),
): AnyActivityDefinition | undefined {
  const dayIndex = Math.floor(now.getTime() / 86_400_000);
  const last = records[0]?.activityId;
  for (let i = 0; i < RECOMMENDATION_ROTATION.length; i++) {
    const id = RECOMMENDATION_ROTATION[(dayIndex + i) % RECOMMENDATION_ROTATION.length];
    if (id !== last && activities.get(id)) return activities.get(id);
  }
  return activities.visible[0];
}
