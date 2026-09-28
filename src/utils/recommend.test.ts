import type { SessionRecord } from '@/types/session';

import { recommendedActivity } from './recommend';

const last = (activityId: string) => [{ activityId } as SessionRecord];

describe('recommended activity', () => {
  it('always returns a registered, visible activity', () => {
    for (let d = 0; d < 30; d++) {
      const def = recommendedActivity([], new Date(2026, 0, 1 + d));
      expect(def).toBeDefined();
      expect(def!.hidden).toBeFalsy();
    }
  });

  it('never recommends the activity that was just done', () => {
    for (let d = 0; d < 30; d++) {
      const day = new Date(2026, 0, 1 + d);
      const suggested = recommendedActivity([], day)!;
      expect(recommendedActivity(last(suggested.id), day)!.id).not.toBe(suggested.id);
    }
  });
});
