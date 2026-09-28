import { changedKeys, initialParams, sanitizeParams, visibleFields } from './config';
import { L } from './localize';
import { finalizeProgram, hold, MAX_SEGMENTS, repeatCycles, validateProgram } from './program';
import { createRandom, shuffle } from './random';
import { createRegistry } from './registry';
import type { ActivityDefinition } from './types';

type P = { speed: string; durationSec: number; showPath: boolean; fixed: number };

const def: ActivityDefinition<P> = {
  id: 'test',
  category: 'tracking',
  icon: 'eye',
  priority: 'P0',
  usesTarget: true,
  name: L('Prueba', 'Test'),
  description: L('', ''),
  purpose: L('', ''),
  instructions: [],
  difficulty: 'easy',
  speedParam: 'speed',
  defaultParams: { speed: 'slow', durationSec: 30, showPath: false, fixed: 7 },
  params: [
    {
      key: 'speed',
      type: 'enum',
      label: L('', ''),
      options: [
        { value: 'slow', label: L('', '') },
        { value: 'fast', label: L('', '') },
      ],
    },
    { key: 'durationSec', type: 'number', label: L('', ''), min: 10, max: 60, step: 5 },
    { key: 'showPath', type: 'boolean', label: L('', ''), dev: true },
  ],
  prompts: {},
  build: () => finalizeProgram({ segments: [hold({ x: 50, y: 50 }, 1000, { phase: 'h' })] }),
};

describe('activity configuration', () => {
  it('sanitizes values against the schema', () => {
    const p = sanitizeParams(def, {
      speed: 'warp',
      durationSec: 999,
      showPath: 'yes' as never,
      extra: 1,
    } as never);
    expect(p).toEqual({ speed: 'slow', durationSec: 60, showPath: false, fixed: 7 });
    expect(sanitizeParams(def, { durationSec: 23 }).durationSec).toBe(25);
    expect(sanitizeParams(def, { durationSec: Number.NaN }).durationSec).toBe(30);
  });

  it('applies the user default speed, then developer overrides', () => {
    expect(initialParams(def, { defaultSpeed: 'fast' }).speed).toBe('fast');
    // 'medium' is not an option of this definition → falls back to default.
    expect(initialParams(def, { defaultSpeed: 'medium' }).speed).toBe('slow');
    expect(
      initialParams(def, { defaultSpeed: 'fast', overrides: { speed: 'slow', durationSec: 45 } }),
    ).toMatchObject({
      speed: 'slow',
      durationSec: 45,
    });
  });

  it('hides developer fields unless in developer mode', () => {
    const values = sanitizeParams(def);
    expect(visibleFields(def, values, false).map((f) => f.key)).toEqual(['speed', 'durationSec']);
    expect(visibleFields(def, values, true).map((f) => f.key)).toContain('showPath');
    expect(changedKeys(def, { ...values, durationSec: 40 })).toEqual(['durationSec']);
  });
});

describe('program helpers', () => {
  const cycle = () => [
    hold({ x: 1, y: 1 }, 1000, { phase: 'a' }),
    hold({ x: 1, y: 1 }, 500, { phase: 'b' }),
  ];

  it('repeats an exact number of repetitions', () => {
    const r = repeatCycles(cycle, { endMode: 'repetitions', repetitions: 4, durationMs: 1 });
    expect(r.cycles).toBe(4);
    expect(r.segments).toHaveLength(8);
  });

  it('time mode completes whole cycles covering the duration', () => {
    const r = repeatCycles(cycle, { endMode: 'time', repetitions: 1, durationMs: 4000 });
    // 1500 ms per cycle → 3 cycles (4500 ms) cover 4000 ms.
    expect(r.cycles).toBe(3);
    expect(r.segments.reduce((s, x) => s + x.durationMs, 0)).toBe(4500);
    // Always at least one cycle.
    expect(repeatCycles(cycle, { endMode: 'time', repetitions: 1, durationMs: 0 }).cycles).toBe(1);
  });

  it('caps runaway programs', () => {
    const tiny = () => [hold({ x: 1, y: 1 }, 16, { phase: 'x' })];
    const r = repeatCycles(tiny, { endMode: 'repetitions', repetitions: 1e9, durationMs: 0 });
    expect(r.segments.length).toBeLessThanOrEqual(MAX_SEGMENTS);
  });

  it('validates programs', () => {
    const canvas = { width: 100, height: 100 };
    const ok = finalizeProgram({ segments: [hold({ x: 50, y: 50 }, 100, { phase: 'h' })] });
    expect(validateProgram(ok, canvas, 0.1)).toEqual([]);
    const outside = finalizeProgram({ segments: [hold({ x: 1, y: 50 }, 100, { phase: 'h' })] });
    expect(validateProgram(outside, canvas, 0.1)[0]).toMatch(/outside/);
    expect(validateProgram(finalizeProgram({ segments: [] }), canvas, 0.1)).toContain(
      'program has no segments',
    );
  });
});

describe('random + registry', () => {
  it('seeded random is reproducible', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    const seqA = Array.from({ length: 5 }, a);
    expect(Array.from({ length: 5 }, b)).toEqual(seqA);
    seqA.forEach((v) => expect(v >= 0 && v < 1).toBe(true));
    expect(shuffle(createRandom(1), [1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });

  it('rejects duplicate ids', () => {
    expect(() => createRegistry([def, def])).toThrow(/Duplicate/);
    const reg = createRegistry([def, { ...def, id: 'hidden', hidden: true }]);
    expect(reg.visible.map((d) => d.id)).toEqual(['test']);
    expect(reg.get('hidden')).toBeDefined();
  });
});
