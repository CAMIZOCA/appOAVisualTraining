import { useCallback } from 'react';

import type { Lang, Localized } from '@/activities/core/types';
import { useSettings } from '@/store/settingsStore';

import { en } from './en';
import { es, type StringKey } from './es';

export type { StringKey };

const dictionaries: Record<Lang, Record<StringKey, string>> = { es, en };

export type Vars = Record<string, string | number>;

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function translate(lang: Lang, key: StringKey, vars?: Vars): string {
  return interpolate(dictionaries[lang][key] ?? dictionaries.es[key] ?? key, vars);
}

/** Pick the language variant of an activity's localized text. */
export function pick(text: Localized, lang: Lang): string {
  return text[lang] ?? text.es;
}

export type TFunction = (key: StringKey, vars?: Vars) => string;

export function useT() {
  const lang = useSettings((s) => s.language);
  const t = useCallback<TFunction>((key, vars) => translate(lang, key, vars), [lang]);
  const l = useCallback((text: Localized) => pick(text, lang), [lang]);
  return { t, l, lang };
}

/** Locale code for Intl / speech. */
export function localeOf(lang: Lang): string {
  return lang === 'es' ? 'es-MX' : 'en-US';
}
