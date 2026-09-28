import type { Difficulty, ParamValues } from '@/activities/core/types';

export type Comfort = 'comfortable' | 'slightFatigue' | 'moderateFatigue' | 'discomfort';

export const COMFORT_OPTIONS: Comfort[] = [
  'comfortable',
  'slightFatigue',
  'moderateFatigue',
  'discomfort',
];

/** MaterialCommunityIcons glyph per comfort answer (always shown with its label). */
export const COMFORT_ICONS: Record<Comfort, string> = {
  comfortable: 'emoticon-happy-outline',
  slightFatigue: 'emoticon-neutral-outline',
  moderateFatigue: 'emoticon-sad-outline',
  discomfort: 'alert-circle-outline',
};

export interface SessionRecord {
  id: string;
  activityId: string;
  /** Name at the time of the session (in the UI language used). */
  activityName: string;
  /** ISO timestamp of when the activity started (after the countdown). */
  startedAt: string;
  /** Actual time spent in the activity, excluding pauses and countdown. */
  durationMs: number;
  /** Planned total duration of the program. */
  plannedMs: number;
  difficulty: Difficulty;
  params: ParamValues;
  completed: boolean;
  comfort?: Comfort;
}
