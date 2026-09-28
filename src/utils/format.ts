import type { Lang } from '@/activities/core/types';
import { localeOf } from '@/i18n';

/** 75 → "1:15". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Human duration: "45 s", "2 min", "1 min 30 s". */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m} min` : `${m} min ${rest} s`;
}

export function formatDateTime(iso: string, lang: Lang): string {
  const d = new Date(iso);
  try {
    return d.toLocaleString(localeOf(lang), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
}

export function formatTime(iso: string, lang: Lang): string {
  const d = new Date(iso);
  try {
    return d.toLocaleTimeString(localeOf(lang), { hour: '2-digit', minute: '2-digit' });
  } catch {
    return d.toISOString().slice(11, 16);
  }
}
