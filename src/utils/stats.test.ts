import type { SessionRecord } from '@/types/session';

import { formatClock, formatDuration } from './format';
import {
  completedCount,
  currentStreak,
  dayKey,
  minutesPracticed,
  sessionsThisWeek,
  sessionsToday,
  startOfWeek,
  summarize,
  weekDailyMinutes,
} from './stats';

// Wednesday 2026-09-30, 15:00 local time.
const NOW = new Date(2026, 8, 30, 15, 0, 0);

function rec(daysAgo: number, opts: Partial<SessionRecord> = {}): SessionRecord {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10, 0, 0, 0);
  return {
    id: `${daysAgo}-${Math.random()}`,
    activityId: 'horizontal-tracking',
    activityName: 'Seguimiento horizontal',
    startedAt: d.toISOString(),
    durationMs: 60_000,
    plannedMs: 60_000,
    difficulty: 'easy',
    params: {},
    completed: true,
    ...opts,
  };
}

describe('statistics', () => {
  it('groups by local day and ISO week (Monday start)', () => {
    expect(dayKey(NOW)).toBe('2026-09-30');
    expect(dayKey(startOfWeek(NOW))).toBe('2026-09-28');
    const records = [rec(0), rec(0), rec(1), rec(2), rec(3), rec(9)];
    expect(sessionsToday(records, NOW)).toHaveLength(2);
    // Mon 28, Tue 29, Wed 30 are this week; Sun 27 and earlier are not.
    expect(sessionsThisWeek(records, NOW)).toHaveLength(4);
  });

  it('counts completed activities and minutes (partial time included)', () => {
    const records = [
      rec(0),
      rec(0, { completed: false, durationMs: 30_000 }),
      rec(1, { durationMs: 150_000 }),
    ];
    expect(completedCount(records)).toBe(2);
    expect(minutesPracticed(records)).toBe(4);
    expect(summarize(records)).toEqual({ count: 3, completed: 2, minutes: 4 });
  });

  it('computes the current streak', () => {
    expect(currentStreak([], NOW)).toBe(0);
    expect(currentStreak([rec(0), rec(1), rec(2), rec(4)], NOW)).toBe(3);
    // Not practiced yet today: streak up to yesterday is kept.
    expect(currentStreak([rec(1), rec(2)], NOW)).toBe(2);
    // Incomplete sessions do not count.
    expect(currentStreak([rec(0, { completed: false })], NOW)).toBe(0);
    // A gap breaks it.
    expect(currentStreak([rec(2), rec(3)], NOW)).toBe(0);
  });

  it('builds per-day minutes for the week', () => {
    const minutes = weekDailyMinutes([rec(0), rec(0), rec(2, { durationMs: 90_000 })], NOW);
    expect(minutes).toEqual([1.5, 0, 2, 0, 0, 0, 0]);
  });
});

describe('formatting', () => {
  it('formats clocks and durations', () => {
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(-3)).toBe('0:00');
    expect(formatDuration(45_000)).toBe('45 s');
    expect(formatDuration(120_000)).toBe('2 min');
    expect(formatDuration(90_000)).toBe('1 min 30 s');
  });
});
