/**
 * Activity Lab: a free-form activity for developers and optometrists. It reuses the same
 * path generators and builders as the real activities, so whatever is tuned here behaves
 * identically once promoted to a formal activity. Lab runs are never saved as sessions.
 */
import { sanitizeParams } from '../core/config';
import { center, maxRadius } from '../core/geometry';
import { L } from '../core/localize';
import { circlePoints, diagonalLine, horizontalLine, verticalLine } from '../core/paths';
import { finalizeProgram, guideFrom, motion, repeatCycles } from '../core/program';
import { effectivePace, PACE_MS, speedPxPerSec } from '../core/speed';
import type {
  ActivityDefinition,
  ActivityProgram,
  BuildContext,
  Easing,
  Pace,
  ParamValues,
  SpeedLevel,
} from '../core/types';
import { buildRandomSaccades } from '../saccades/randomSaccades';
import { buildHPattern } from '../tracking/hPattern';
import { buildInfinity } from '../tracking/infinity';
import { buildLineTracking } from '../tracking/lineTracking';
import { buildStar } from '../tracking/star';

export type LabPath =
  'horizontal' | 'vertical' | 'diagonal' | 'circle' | 'infinity' | 'star' | 'h' | 'random';

export type LabParams = {
  path: LabPath;
  speed: SpeedLevel;
  pace: Pace;
  durationSec: number;
  showPath: boolean;
  amplitude: number;
  easing: Easing;
  dwellMs: number;
  direction: 'cw' | 'ccw';
  orientation: 'horizontal' | 'vertical';
  diagonal: 'down' | 'up';
  starDirections: '4' | '8' | 'random';
  returnToCenter: boolean;
  randomLevel: 'easy' | 'medium' | 'hard';
};

export const LAB_DEFAULTS: LabParams = {
  path: 'horizontal',
  speed: 'slow',
  pace: 'medium',
  durationSec: 20,
  showPath: true,
  amplitude: 100,
  easing: 'inOutSine',
  dwellMs: 0,
  direction: 'cw',
  orientation: 'horizontal',
  diagonal: 'down',
  starDirections: '8',
  returnToCenter: true,
  randomLevel: 'medium',
};

const is =
  (...paths: LabPath[]) =>
  (v: ParamValues) =>
    paths.includes(v.path as LabPath);

const MOTION_PATHS: LabPath[] = [
  'horizontal',
  'vertical',
  'diagonal',
  'circle',
  'infinity',
  'star',
  'h',
];

function circleForTime(p: LabParams, ctx: BuildContext): ActivityProgram {
  const c = center(ctx.canvas);
  const r = maxRadius(ctx.canvas, ctx.safeMargin) * (p.amplitude / 100);
  const pxps = speedPxPerSec(p.speed, ctx.canvas, ctx.reduceMotion);
  const pts = circlePoints(c, r, 1, p.direction);
  const { segments, cycles } = repeatCycles(
    (i) => [motion(pts, pxps, { phase: `${p.direction} ${i + 1}`, easing: 'linear' })],
    { endMode: 'time', repetitions: 1, durationMs: p.durationSec * 1000 },
  );
  return finalizeProgram({
    segments,
    guides: p.showPath ? [guideFrom(pts)] : [],
    meta: { pxPerSec: pxps, radius: r, turns: cycles },
  });
}

export function buildLab(p: LabParams, ctx: BuildContext): ActivityProgram {
  const durationMs = p.durationSec * 1000;
  const line = {
    speed: p.speed,
    endMode: 'time' as const,
    durationSec: p.durationSec,
    repetitions: 1,
    amplitude: p.amplitude,
    dwellMs: p.dwellMs,
    easing: p.easing,
    showPath: p.showPath,
  };
  const { canvas, safeMargin: m } = ctx;
  switch (p.path) {
    case 'horizontal':
      return buildLineTracking(line, ctx, (s) => horizontalLine(canvas, m, s), {
        forward: '→',
        back: '←',
      });
    case 'vertical':
      return buildLineTracking(line, ctx, (s) => verticalLine(canvas, m, s), {
        forward: '↓',
        back: '↑',
      });
    case 'diagonal':
      return buildLineTracking(line, ctx, (s) => diagonalLine(canvas, m, s, p.diagonal === 'up'), {
        forward: '↘',
        back: '↖',
      });
    case 'circle':
      return circleForTime(p, ctx);
    case 'infinity':
      return buildInfinity(
        {
          orientation: p.orientation,
          speed: p.speed,
          endMode: 'time',
          durationSec: p.durationSec,
          repetitions: 1,
          amplitude: p.amplitude,
          showPath: p.showPath,
        },
        ctx,
      );
    case 'star': {
      const star = (rounds: number) =>
        buildStar(
          {
            directions: p.starDirections,
            returnToCenter: p.returnToCenter,
            rounds,
            speed: p.speed,
            dwellMs: p.dwellMs,
            amplitude: p.amplitude,
            stretch: false,
            showPath: p.showPath,
          },
          ctx,
        );
      const one = star(1).totalMs;
      return star(Math.max(1, Math.min(20, Math.ceil(durationMs / Math.max(1, one)))));
    }
    case 'h':
      return buildHPattern(
        {
          mode: p.showPath ? 'guided' : 'challenge',
          speed: p.speed,
          endMode: 'time',
          durationSec: p.durationSec,
          repetitions: 1,
          dwellMs: p.dwellMs,
          width: p.amplitude,
          height: p.amplitude,
        },
        ctx,
      );
    case 'random': {
      const ms = PACE_MS[effectivePace(p.pace, ctx.reduceMotion)];
      return buildRandomSaccades(
        {
          count: Math.max(2, Math.ceil(durationMs / ms)),
          pace: p.pace,
          level: p.randomLevel,
          spread: p.amplitude,
          sound: true,
        },
        ctx,
      );
    }
  }
}

export const labActivity: ActivityDefinition<LabParams> = {
  id: 'lab',
  hidden: true,
  category: 'oculomotor',
  icon: 'flask-outline',
  priority: 'P0',
  usesTarget: true,
  name: L('Activity Lab', 'Activity Lab'),
  description: L(
    'Prueba libre de trayectorias y parámetros.',
    'Free testing of paths and parameters.',
  ),
  purpose: L(
    'Experimentar con trayectorias, velocidades y objetivos antes de definir una actividad.',
    'Experiment with paths, speeds and targets before defining an activity.',
  ),
  instructions: [L('Sigue el objetivo con tus ojos.', 'Follow the target with your eyes.')],
  difficulty: 'medium',
  speedParam: 'speed',
  defaultParams: LAB_DEFAULTS,
  params: [
    {
      key: 'path',
      type: 'enum',
      label: L('Trayectoria', 'Path'),
      options: [
        { value: 'horizontal', label: L('Horizontal', 'Horizontal') },
        { value: 'vertical', label: L('Vertical', 'Vertical') },
        { value: 'diagonal', label: L('Diagonal', 'Diagonal') },
        { value: 'circle', label: L('Círculo', 'Circle') },
        { value: 'infinity', label: L('Infinito', 'Infinity') },
        { value: 'star', label: L('Estrella', 'Star') },
        { value: 'h', label: L('H', 'H') },
        { value: 'random', label: L('Aleatorio', 'Random') },
      ],
    },
    {
      key: 'speed',
      type: 'enum',
      label: L('Velocidad', 'Speed'),
      visibleWhen: is(...MOTION_PATHS),
      options: [
        { value: 'verySlow', label: L('Muy lenta', 'Very slow') },
        { value: 'slow', label: L('Lenta', 'Slow') },
        { value: 'medium', label: L('Media', 'Medium') },
        { value: 'fast', label: L('Rápida', 'Fast') },
      ],
    },
    {
      key: 'pace',
      type: 'enum',
      label: L('Ritmo de saltos', 'Jump pace'),
      visibleWhen: is('random'),
      options: [
        { value: 'slow', label: L('Lento', 'Slow') },
        { value: 'medium', label: L('Medio', 'Medium') },
        { value: 'fast', label: L('Rápido', 'Fast') },
      ],
    },
    {
      key: 'durationSec',
      type: 'number',
      label: L('Duración', 'Duration'),
      unit: 's',
      min: 5,
      max: 300,
      step: 5,
    },
    {
      key: 'showPath',
      type: 'boolean',
      label: L('Trayectoria visible', 'Visible path'),
      visibleWhen: is(...MOTION_PATHS),
    },
    {
      key: 'amplitude',
      type: 'number',
      label: L('Tamaño del recorrido', 'Path size'),
      unit: '%',
      min: 20,
      max: 100,
      step: 5,
    },
    {
      key: 'direction',
      type: 'enum',
      label: L('Sentido', 'Direction'),
      visibleWhen: is('circle'),
      options: [
        { value: 'cw', label: L('Horario', 'Clockwise') },
        { value: 'ccw', label: L('Antihorario', 'Counterclockwise') },
      ],
    },
    {
      key: 'orientation',
      type: 'enum',
      label: L('Orientación', 'Orientation'),
      visibleWhen: is('infinity'),
      options: [
        { value: 'horizontal', label: L('Horizontal ∞', 'Horizontal ∞') },
        { value: 'vertical', label: L('Vertical 8', 'Vertical 8') },
      ],
    },
    {
      key: 'diagonal',
      type: 'enum',
      label: L('Diagonal', 'Diagonal'),
      visibleWhen: is('diagonal'),
      options: [
        { value: 'down', label: L('↘ Descendente', '↘ Down') },
        { value: 'up', label: L('↗ Ascendente', '↗ Up') },
      ],
    },
    {
      key: 'starDirections',
      type: 'enum',
      label: L('Direcciones', 'Directions'),
      visibleWhen: is('star'),
      options: [
        { value: '4', label: L('4', '4') },
        { value: '8', label: L('8', '8') },
        { value: 'random', label: L('Aleatorias', 'Random') },
      ],
    },
    {
      key: 'returnToCenter',
      type: 'boolean',
      label: L('Volver al centro', 'Return to center'),
      visibleWhen: is('star'),
    },
    {
      key: 'randomLevel',
      type: 'enum',
      label: L('Distancia entre saltos', 'Jump distance'),
      visibleWhen: is('random'),
      options: [
        { value: 'easy', label: L('Corta', 'Short') },
        { value: 'medium', label: L('Media', 'Medium') },
        { value: 'hard', label: L('Larga', 'Long') },
      ],
    },
    {
      key: 'easing',
      type: 'enum',
      label: L('Aceleración en extremos', 'Easing at ends'),
      visibleWhen: is('horizontal', 'vertical', 'diagonal'),
      options: [
        { value: 'inOutSine', label: L('Suave', 'Smooth') },
        { value: 'linear', label: L('Constante', 'Constant') },
      ],
    },
    {
      key: 'dwellMs',
      type: 'number',
      label: L('Pausa en extremos', 'Dwell at ends'),
      unit: 'ms',
      min: 0,
      max: 2000,
      step: 100,
      visibleWhen: is('horizontal', 'vertical', 'diagonal', 'star', 'h'),
    },
  ],
  prompts: {
    intro: L(
      'Sigue el objetivo solamente con tus ojos. Mantén la cabeza quieta.',
      'Follow the target using only your eyes. Keep your head still.',
    ),
  },
  introPrompt: 'intro',
  difficultyOf: (p) => (p.speed === 'fast' ? 'hard' : p.speed === 'medium' ? 'medium' : 'easy'),
  build: buildLab,
};

/** Restore persisted Lab parameters (tolerates stale or partial data). */
export function labParamsFrom(stored: ParamValues | null | undefined): LabParams {
  return sanitizeParams(labActivity, stored ?? {});
}
