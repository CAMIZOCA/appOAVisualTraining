import type { AnyActivityDefinition, Lang } from './types';

/**
 * Resolve a prompt key to text: developer override (current language) → definition text.
 * Overrides are stored per language (`es:intro`) so a Spanish test text never leaks into English.
 * Returns an empty string for unknown keys so a typo never crashes an activity.
 */
export function resolvePrompt(
  def: AnyActivityDefinition,
  key: string | undefined,
  lang: Lang,
  overrides?: Record<string, string>,
): string {
  if (!key) return '';
  const override = overrides?.[promptOverrideKey(lang, key)];
  if (override && override.trim()) return override;
  const text = def.prompts[key];
  return text ? (text[lang] ?? text.es) : '';
}

export function promptOverrideKey(lang: Lang, key: string): string {
  return `${lang}:${key}`;
}
