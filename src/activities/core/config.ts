/**
 * Activity configuration: merge defaults, user defaults and developer overrides into a
 * sanitized parameter set that always matches the definition's schema.
 */
import { isSpeedLevel } from './speed';
import type {
  ActivityDefinition,
  AnyActivityDefinition,
  ParamField,
  ParamValue,
  ParamValues,
  SpeedLevel,
} from './types';

function sanitizeValue(
  field: ParamField,
  value: ParamValue | undefined,
  fallback: ParamValue,
): ParamValue {
  if (value === undefined) return fallback;
  switch (field.type) {
    case 'number': {
      if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
      const stepped = Math.round((value - field.min) / field.step) * field.step + field.min;
      const clamped = Math.min(field.max, Math.max(field.min, stepped));
      return Number(clamped.toFixed(6));
    }
    case 'boolean':
      return typeof value === 'boolean' ? value : fallback;
    case 'enum':
      return field.options.some((o) => o.value === value) ? value : fallback;
  }
}

/**
 * Returns a complete, valid parameter set. Unknown keys are dropped; keys that exist in
 * `defaultParams` but not in the schema keep their defaults (fixed parameters).
 */
export function sanitizeParams<P extends ParamValues>(
  def: ActivityDefinition<P>,
  values: Partial<ParamValues> = {},
): P {
  const out: ParamValues = { ...def.defaultParams };
  for (const field of def.params) {
    out[field.key] = sanitizeValue(field, values[field.key], def.defaultParams[field.key]);
  }
  return out as P;
}

export interface InitialParamsOptions {
  /** User default speed from Settings (applied only to activities with a speed parameter). */
  defaultSpeed?: SpeedLevel;
  /** Developer-mode overrides persisted per activity. */
  overrides?: Partial<ParamValues>;
}

export function initialParams(
  def: AnyActivityDefinition,
  opts: InitialParamsOptions = {},
): ParamValues {
  const merged: Partial<ParamValues> = { ...def.defaultParams };
  if (def.speedParam && opts.defaultSpeed && isSpeedLevel(opts.defaultSpeed)) {
    merged[def.speedParam] = opts.defaultSpeed;
  }
  Object.assign(merged, opts.overrides ?? {});
  return sanitizeParams(def, merged);
}

/** Fields to show in forms for the given values and mode. */
export function visibleFields(
  def: AnyActivityDefinition,
  values: ParamValues,
  devMode: boolean,
): ParamField[] {
  return def.params.filter((f) => (devMode || !f.dev) && (!f.visibleWhen || f.visibleWhen(values)));
}

/** Keys whose value differs from the definition defaults. */
export function changedKeys(def: AnyActivityDefinition, values: ParamValues): string[] {
  return def.params.filter((f) => values[f.key] !== def.defaultParams[f.key]).map((f) => f.key);
}
