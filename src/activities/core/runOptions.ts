import type { CanvasTheme, TargetSize, TargetType } from './types';

/**
 * Presentation options for a run, independent of the activity's own parameters.
 * Defaults come from Settings; the Lab and Developer mode can override them per run.
 */
export interface RunOptions {
  targetType: TargetType;
  targetSize: TargetSize;
  /** Exact size in dp (developer override). `null` → use `targetSize`. */
  targetSizePx: number | null;
  canvasTheme: CanvasTheme;
  voice: boolean;
  debug: boolean;
}

export const TARGET_SIZE_PX: Record<TargetSize, number> = { small: 20, medium: 28, large: 40 };

export const TARGET_TYPES: TargetType[] = [
  'dotCenter',
  'filled',
  'ring',
  'letterE',
  'letterC',
  'star',
];
export const TARGET_SIZES: TargetSize[] = ['small', 'medium', 'large'];
export const CANVAS_THEMES: CanvasTheme[] = ['light', 'dark', 'contrast'];

export function resolveTargetSizePx(
  options: Pick<RunOptions, 'targetSize' | 'targetSizePx'>,
): number {
  return options.targetSizePx ?? TARGET_SIZE_PX[options.targetSize];
}
