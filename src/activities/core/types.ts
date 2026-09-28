/**
 * Core types of the activity engine.
 *
 * An activity is an {@link ActivityDefinition}: metadata + parameter schema + a pure `build()`
 * that compiles parameters and the measured canvas into an {@link ActivityProgram} (a flat list
 * of timed segments in pixel space). The engine only knows how to play programs.
 */

export type Lang = 'es' | 'en';

/** Text in every supported language. Activities carry their own copy so modules stay independent. */
export type Localized = Record<Lang, string>;

export type ActivityCategory =
  'oculomotor' | 'saccades' | 'tracking' | 'convergence' | 'accommodation' | 'relaxation';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SpeedLevel = 'verySlow' | 'slow' | 'medium' | 'fast';

export type Pace = 'slow' | 'medium' | 'fast';

export type TargetType = 'dotCenter' | 'filled' | 'ring' | 'letterE' | 'letterC' | 'star';

export type TargetSize = 'small' | 'medium' | 'large';

export type CanvasTheme = 'light' | 'dark' | 'contrast';

export type Easing = 'linear' | 'inOutSine' | 'inOutQuad';

export type HapticCue = 'start' | 'complete' | 'transition' | 'tick';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Side effects fired (on the JS thread) when a segment begins. */
export interface Cue {
  /** Key into the definition's `prompts`. Spoken if voice is enabled. */
  voice?: string;
  haptic?: HapticCue;
  sound?: 'tick';
}

interface SegmentBase {
  durationMs: number;
  /** Short machine label shown in the debug overlay (e.g. "sweep→", "hold", "near"). */
  phase: string;
  cue?: Cue;
}

/** Smooth pursuit along a pre-sampled polyline, interpolated by arc length. */
export interface MotionSegment extends SegmentBase {
  kind: 'motion';
  xs: number[];
  ys: number[];
  /** Cumulative arc length; `lens[0] === 0`, last item is the total length (px). */
  lens: number[];
  easing: Easing;
}

/** Target stays still at a point. */
export interface HoldSegment extends SegmentBase {
  kind: 'hold';
  at: Point;
}

/** Saccade fixation: the target appears (jumps) at `at` with no travel. */
export interface FixationSegment extends SegmentBase {
  kind: 'fixation';
  at: Point;
  /** Sequential index of the jump (drives the visual pulse). */
  index: number;
}

export type SceneKind =
  'letter' | 'far' | 'eyesClosed' | 'blink' | 'breathe' | 'relax' | 'message' | 'convergence';

/** Guided step without a moving target (relaxation, accommodation, convergence). */
export interface SceneSegment extends SegmentBase {
  kind: 'scene';
  scene: SceneKind;
  /** Prompt key displayed as on-screen text. */
  text?: string;
  letter?: string;
  /** Letter / central target size in px. */
  sizePx?: number;
  /** Show a per-step countdown. */
  showCountdown?: boolean;
}

export type Segment = MotionSegment | HoldSegment | FixationSegment | SceneSegment;

export interface Polyline {
  xs: number[];
  ys: number[];
}

export interface ActivityProgram {
  segments: Segment[];
  totalMs: number;
  /** Optional visible trajectory (px). */
  guides: Polyline[];
  /** Stationary dim markers (px), e.g. both saccade positions. */
  markers: Point[];
  /** Arbitrary info for the debug overlay. */
  meta: Record<string, string | number>;
}

export type ParamValue = string | number | boolean;
export type ParamValues = Record<string, ParamValue>;

interface ParamFieldBase {
  key: string;
  label: Localized;
  help?: Localized;
  /** Only shown in Developer / Test mode. */
  dev?: boolean;
  /** Hide the field when this returns false for the current values. */
  visibleWhen?: (values: ParamValues) => boolean;
}

export interface EnumOption {
  value: string | number;
  label: Localized;
}

export interface EnumField extends ParamFieldBase {
  type: 'enum';
  options: EnumOption[];
}

export interface NumberField extends ParamFieldBase {
  type: 'number';
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface BooleanField extends ParamFieldBase {
  type: 'boolean';
}

export type ParamField = EnumField | NumberField | BooleanField;

export interface BuildContext {
  canvas: Size;
  /** Normalized safe band margin (0.1 → targets kept inside 0.1–0.9). */
  safeMargin: number;
  reduceMotion: boolean;
  /** Seed for reproducible pseudo-random sequences. */
  seed: number;
}

export interface ActivityDefinition<P extends ParamValues = ParamValues> {
  id: string;
  category: ActivityCategory;
  /** MaterialCommunityIcons glyph name. */
  icon: string;
  name: Localized;
  description: Localized;
  purpose: Localized;
  instructions: Localized[];
  difficulty: Difficulty;
  /** Priority tag for internal testing (P0/P1). */
  priority: 'P0' | 'P1';
  /** Whether the activity uses the moving target (vs. guided scenes only). */
  usesTarget: boolean;
  /** Whether a speed level is part of the params (receives the user default speed). */
  speedParam?: keyof P & string;
  defaultParams: P;
  params: ParamField[];
  prompts: Record<string, Localized>;
  /** Prompt key spoken when the countdown starts. */
  introPrompt?: string;
  difficultyOf?: (params: P) => Difficulty;
  build: (params: P, ctx: BuildContext) => ActivityProgram;
  /** Hidden from the Activities list (e.g. the Lab). */
  hidden?: boolean;
}

/** Type-erased definition used by registries and generic UI. */
export type AnyActivityDefinition = ActivityDefinition<any>;
