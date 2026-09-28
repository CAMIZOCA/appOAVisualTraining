/**
 * Pure statistics over local session records. Dates use the device's local time zone.
 */
import type { SessionRecord } from '@/types/session';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local calendar day key, e.g. "2026-09-28". */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Monday 00:00 of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

export function isSameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

export function sessionsToday(records: SessionRecord[], now = new Date()): SessionRecord[] {
  return records.filter((r) => isSameDay(new Date(r.startedAt), now));
}

export function sessionsThisWeek(records: SessionRecord[], now = new Date()): SessionRecord[] {
  const from = startOfWeek(now).getTime();
  const to = from + 7 * DAY_MS;
  return records.filter((r) => {
    const t = new Date(r.startedAt).getTime();
    return t >= from && t < to;
  });
}

export function completedCount(records: SessionRecord[]): number {
  return records.filter((r) => r.completed).length;
}

/** Total practiced minutes (partial sessions count for the time actually done). */
export function minutesPracticed(records: SessionRecord[]): number {
  return Math.round(records.reduce((sum, r) => sum + Math.max(0, r.durationMs), 0) / 60_000);
}

/**
 * Consecutive days with at least one completed activity, ending today — or yesterday, so a
 * streak isn't shown as broken before the user has practiced today.
 */
export function currentStreak(records: SessionRecord[], now = new Date()): number {
  const days = new Set(
    records.filter((r) => r.completed).map((r) => dayKey(new Date(r.startedAt))),
  );
  const cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Minutes per day for the current week (Monday → Sunday). */
export function weekDailyMinutes(records: SessionRecord[], now = new Date()): number[] {
  const start = startOfWeek(now);
  const totals = Array.from({ length: 7 }, () => 0);
  for (const r of sessionsThisWeek(records, now)) {
    // Round (not floor) so DST shifts of ±1 h don't move a session to the previous day.
    const idx = Math.round(
      (startOfDay(new Date(r.startedAt)).getTime() - start.getTime()) / DAY_MS,
    );
    const i = Math.min(6, Math.max(0, idx));
    totals[i] += r.durationMs / 60_000;
  }
  return totals.map((m) => Math.round(m * 10) / 10);
}

export interface Summary {
  count: number;
  completed: number;
  minutes: number;
}

export function summarize(records: SessionRecord[]): Summary {
  return {
    count: records.length,
    completed: completedCount(records),
    minutes: minutesPracticed(records),
  };
}
