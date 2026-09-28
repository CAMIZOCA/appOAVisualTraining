/** Reusable parameter field definitions (schema) shared by activities and the Lab. */
import type { EnumField, Localized, NumberField, ParamField, ParamValues } from './types';

const L = (es: string, en: string): Localized => ({ es, en });

export const speedField = (dev = false): EnumField => ({
  key: 'speed',
  type: 'enum',
  label: L('Velocidad', 'Speed'),
  dev,
  options: [
    { value: 'verySlow', label: L('Muy lenta', 'Very slow') },
    { value: 'slow', label: L('Lenta', 'Slow') },
    { value: 'medium', label: L('Media', 'Medium') },
    { value: 'fast', label: L('Rápida', 'Fast') },
  ],
});

export const paceField = (): EnumField => ({
  key: 'pace',
  type: 'enum',
  label: L('Ritmo', 'Pace'),
  options: [
    { value: 'slow', label: L('Lento', 'Slow') },
    { value: 'medium', label: L('Medio', 'Medium') },
    { value: 'fast', label: L('Rápido', 'Fast') },
  ],
});

export const endModeField = (): EnumField => ({
  key: 'endMode',
  type: 'enum',
  label: L('Finalizar por', 'End by'),
  dev: true,
  options: [
    { value: 'repetitions', label: L('Repeticiones', 'Repetitions') },
    { value: 'time', label: L('Tiempo', 'Time') },
  ],
});

export const durationField = (min = 10, max = 180, step = 5, dev = false): NumberField => ({
  key: 'durationSec',
  type: 'number',
  label: L('Duración', 'Duration'),
  unit: 's',
  min,
  max,
  step,
  dev,
  visibleWhen: (v) => v.endMode === undefined || v.endMode === 'time',
});

export const repetitionsField = (
  label: Localized,
  min = 1,
  max = 30,
  dev = false,
): NumberField => ({
  key: 'repetitions',
  type: 'number',
  label,
  min,
  max,
  step: 1,
  dev,
  visibleWhen: (v) => v.endMode === undefined || v.endMode === 'repetitions',
});

export const showPathField = (dev = false): ParamField => ({
  key: 'showPath',
  type: 'boolean',
  label: L('Mostrar trayectoria', 'Show path'),
  dev,
});

/** Fraction of the safe band used by the path (lets testers shrink/enlarge amplitude). */
export const amplitudeField = (
  key = 'amplitude',
  label = L('Amplitud', 'Amplitude'),
): NumberField => ({
  key,
  type: 'number',
  label,
  unit: '%',
  min: 20,
  max: 100,
  step: 5,
  dev: true,
});

export const dwellField = (label = L('Pausa en extremos', 'Dwell at ends')): NumberField => ({
  key: 'dwellMs',
  type: 'number',
  label,
  unit: 'ms',
  min: 0,
  max: 2000,
  step: 100,
  dev: true,
});

export const easingField = (): EnumField => ({
  key: 'easing',
  type: 'enum',
  label: L('Aceleración', 'Easing'),
  dev: true,
  options: [
    { value: 'inOutSine', label: L('Suave', 'Smooth') },
    { value: 'linear', label: L('Constante', 'Constant') },
  ],
});

/** Numeric helper: read a param as number with fallback. */
export function num(values: ParamValues, key: string, fallback: number): number {
  const v = values[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}
