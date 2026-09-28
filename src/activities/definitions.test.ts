/**
 * Contract tests run against EVERY registered activity: a new activity gets these checks
 * for free when it is added to the registry.
 */
import { ACTIVITY_DEFINITIONS, activities } from './index';
import { initialParams, sanitizeParams } from './core/config';
import { validateProgram } from './core/program';
import { segmentEnds } from './core/timeline';
import type { AnyActivityDefinition, BuildContext, ParamValues, Size } from './core/types';

const CANVASES: Size[] = [
  { width: 320, height: 480 }, // small phone
  { width: 390, height: 620 }, // typical phone
  { width: 430, height: 760 }, // large phone
];
const MARGINS = [0.1, 0.05, 0.2];

const ctx = (canvas: Size, safeMargin = 0.1, extra: Partial<BuildContext> = {}): BuildContext => ({
  canvas,
  safeMargin,
  reduceMotion: false,
  seed: 1234,
  ...extra,
});

/** Every single-field variation of the defaults (each enum option, number min/max, boolean flip). */
function variations(def: AnyActivityDefinition): ParamValues[] {
  const base = sanitizeParams(def);
  const out: ParamValues[] = [base];
  for (const f of def.params) {
    if (f.type === 'enum') f.options.forEach((o) => out.push({ ...base, [f.key]: o.value }));
    if (f.type === 'number') out.push({ ...base, [f.key]: f.min }, { ...base, [f.key]: f.max });
    if (f.type === 'boolean') out.push({ ...base, [f.key]: !base[f.key] });
  }
  return out.map((v) => sanitizeParams(def, v));
}

describe.each(ACTIVITY_DEFINITIONS.map((d) => [d.id, d] as const))('%s', (_id, def) => {
  it('has complete bilingual metadata', () => {
    for (const text of [def.name, def.description, def.purpose, ...def.instructions]) {
      expect(text.es.trim()).not.toBe('');
      expect(text.en.trim()).not.toBe('');
    }
    for (const [key, text] of Object.entries(def.prompts)) {
      expect(`${key}:${text.es.trim() !== '' && text.en.trim() !== ''}`).toBe(`${key}:true`);
    }
    if (def.introPrompt) expect(def.prompts[def.introPrompt]).toBeDefined();
  });

  it('has defaults that satisfy its own schema', () => {
    expect(sanitizeParams(def, def.defaultParams)).toEqual(def.defaultParams);
    for (const f of def.params) expect(def.defaultParams).toHaveProperty(f.key);
    expect(new Set(def.params.map((f) => f.key)).size).toBe(def.params.length);
  });

  it.each(CANVASES)('builds a valid program with defaults on %o', (canvas) => {
    const program = def.build(sanitizeParams(def), ctx(canvas));
    expect(validateProgram(program, canvas, 0.1)).toEqual([]);
    expect(program.totalMs).toBeGreaterThan(5_000);
    expect(program.totalMs).toBeLessThan(5 * 60_000);
  });

  it('stays valid for every parameter variation and safe margin', () => {
    for (const params of variations(def)) {
      for (const margin of MARGINS) {
        const program = def.build(params, ctx(CANVASES[1], margin));
        const errors = validateProgram(program, CANVASES[1], margin);
        expect({ params, margin, errors }).toEqual({ params, margin, errors: [] });
      }
    }
  });

  it('is deterministic for a given seed', () => {
    const a = def.build(sanitizeParams(def), ctx(CANVASES[1]));
    const b = def.build(sanitizeParams(def), ctx(CANVASES[1]));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('never attaches haptics to smooth-pursuit motion', () => {
    const program = def.build(sanitizeParams(def), ctx(CANVASES[1]));
    expect(program.segments.filter((s) => s.kind === 'motion' && s.cue?.haptic)).toEqual([]);
  });

  it('respects reduce motion (moves are never faster)', () => {
    const fast = sanitizeParams(def, { ...def.defaultParams, speed: 'fast', pace: 'fast' });
    const firstMove = (reduceMotion: boolean) =>
      def
        .build(fast, ctx(CANVASES[1], 0.1, { reduceMotion }))
        .segments.find((s) => s.kind === 'motion' || s.kind === 'fixation')?.durationMs ?? 0;
    expect(firstMove(true)).toBeGreaterThanOrEqual(firstMove(false));
  });

  it('accepts the user default speed', () => {
    const p = initialParams(def, { defaultSpeed: 'verySlow' });
    if (def.speedParam) expect(p[def.speedParam]).toBe('verySlow');
    expect(() => def.build(p, ctx(CANVASES[0]))).not.toThrow();
  });
});

describe('registry', () => {
  it('contains all P0 activities from the brief', () => {
    for (const id of [
      'horizontal-tracking',
      'vertical-tracking',
      'circle-clockwise',
      'circle-counterclockwise',
      'star',
      'saccades-horizontal',
      'saccades-vertical',
      'infinity',
    ]) {
      expect(activities.get(id)?.priority).toBe('P0');
    }
  });

  it('activity ids are URL-safe', () => {
    for (const d of ACTIVITY_DEFINITIONS) expect(d.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('segment ends are monotonic for every activity', () => {
    for (const d of ACTIVITY_DEFINITIONS) {
      const ends = segmentEnds(d.build(sanitizeParams(d), ctx(CANVASES[1])).segments);
      ends.forEach((e, i) => i > 0 && expect(e).toBeGreaterThan(ends[i - 1]));
    }
  });
});
