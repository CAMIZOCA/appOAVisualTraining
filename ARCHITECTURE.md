# OA Visual Training — Architecture

## 1. Overview

```
┌──────────────────────── Expo Router (src/app) ────────────────────────┐
│  (tabs): Home · Activities · Sessions · Settings                      │
│  activity/[id]  ← one Player for every activity (and the Lab)         │
│  lab · developer · about · safety                                     │
└───────────────┬───────────────────────────────────────┬───────────────┘
                │ definitions + params                  │ settings / records
┌───────────────▼──────────────┐              ┌─────────▼──────────────┐
│ src/activities               │              │ src/store (zustand)    │
│  core/  engine (pure + UI    │              │  settings · sessions   │
│         thread worklets)     │              │  lab · dev             │
│  tracking/ saccades/ ...     │              │  persisted: AsyncStorage│
│  lab/                        │              └────────────────────────┘
└───────────────┬──────────────┘
                │ ActivityProgram (segments, px)
┌───────────────▼──────────────────────────────────────────────────────┐
│ src/hooks/useActivityEngine: useFrameCallback → shared values        │
│ src/components/player: canvas, VisualTarget, overlays, HUD, controls │
│ src/services: voice (expo-speech) · haptics · sound (expo-audio)     │
└──────────────────────────────────────────────────────────────────────┘
```

## 2. Folder structure

```
src/
  app/                    routes only (thin)
  activities/
    core/                 engine: types, geometry, paths, speed, timeline, clock, program, random, registry
    tracking/             horizontal, vertical, circle (CW/CCW), star, infinity, hPattern
    saccades/             horizontal, vertical, random
    accommodation/        nearFar
    convergence/          convergenceGuided
    relaxation/           blinkReset, visualBreak
    lab/                  Activity Lab definition
    index.ts              registers every activity
  components/
    ui/                   design-system primitives
    player/               Player building blocks
    params/               ParamForm (schema-driven form: Lab + Developer mode)
  hooks/                  useActivityEngine, useHydrated, ...
  services/               voice, haptics, sound, storage
  store/                  zustand stores
  i18n/                   es, en, useT
  theme/                  tokens, canvas themes
  types/                  app-level types (sessions)
  utils/                  stats, formatting, dates
```

## 3. Core concepts

### ActivityDefinition → ActivityProgram

An activity is a **definition**: metadata, a parameter schema, voice prompts and a pure `build()` function. Given the parameters and the measured canvas, `build()` compiles the activity into a **program**, which is a flat list of timed segments in pixel space.

```ts
interface ActivityDefinition<P> {
  id;
  category;
  icon;
  name;
  description;
  purpose;
  instructions; // Localized {es,en}
  difficulty;
  defaultParams: P;
  params: ParamField[]; // schema drives UI forms
  prompts: Record<string, Localized>; // voice/on-screen text
  difficultyOf?(params): Difficulty;
  build(params: P, ctx: BuildContext): ActivityProgram; // pure, unit-tested
}

type Segment =
  | { kind: 'motion'; xs; ys; lens; easing } // pre-sampled polyline, arc-length interpolation
  | { kind: 'hold'; at } // static target
  | { kind: 'fixation'; at; index } // saccade jump target (no travel)
  | { kind: 'scene'; scene; text?; letter? }; // guided step without a moving target
// every segment: durationMs, phase, cue? { voice?, haptic?, sound? }
```

**Why pre-sampled polylines?** Every path (line, circle, ∞, H, star spoke, diagonal) goes through a single UI-thread worklet that interpolates by arc length. That gives:

- constant perceived speed on curves;
- the same points to draw the optional visible path;
- a single, testable code path.

A new path only needs a generator returning points.

### Coordinates and safe area

- The **activity canvas** is the area between the top HUD and the bottom controls, inside the device safe area. The Player measures it with `onLayout`.
- Activities describe positions in **normalized** coordinates (0–1), kept inside a **safe band** (`safeMargin`, default 0.1, i.e. 0.1–0.9). Developer mode can change the band.
- Round shapes (circle, star, ∞) use radii based on the canvas's short side, so they stay round on any aspect ratio.
- Programs are rebuilt whenever the canvas size changes.

### Speed system

| Level     | Canvas short side per second |
| --------- | ---------------------------- |
| Very slow | 0.15                         |
| Slow      | 0.25                         |
| Medium    | 0.40                         |
| Fast      | 0.60                         |

Saccade pace is the fixation time per target: slow 1500 ms, medium 1000 ms, fast 700 ms. **Reduce motion** caps tracking speed at _Slow_, saccade pace at _Slow_, and turns off pulse animations. Users never see px/s. The debug overlay shows it.

### Duration policy

Tracking activities support `endMode`:

- `repetitions`: exactly N cycles.
- `time`: whole cycles until the duration is covered, never cut mid-sweep.

The total shown in the timer is the actual program length.

## 4. Runtime (Activity Engine)

`useActivityEngine(program)`:

- **React state** (changes only at transitions): `ready → countdown → running ⇄ paused → completed | stopped`.
- **UI thread**: a single `useFrameCallback` handles the timing.
  - The clock starts at `-3000 ms`; negative time is the countdown.
  - Each frame advances `elapsed` by the frame delta, clamped to avoid jumps after backgrounding, but only while `running`.
  - It binary-searches the current segment and writes the shared values `x`, `y`, `visible`, `pulse`, `progress`.
  - **Nothing re-renders per frame.**
- **Bridge to JS** (`scheduleOnRN`) fires only:
  - on a segment change (voice, haptic and sound cues, scene text);
  - once per second (countdown / remaining-time HUD);
  - on completion.
- **Pause/resume** flips `running`. Resuming continues at exactly the same elapsed time.
- **Stop** ends the run. Voice and sounds are cancelled on pause, stop and unmount. `expo-keep-awake` keeps the screen on while an activity is active.

Timing logic (`clock.ts`, `timeline.ts`) is a set of pure functions marked `'worklet'`. The same code runs on the UI thread and in Jest.

## 5. Rendering

- `ActivityCanvas`: neutral background (light / dark / high contrast).
- `VisualTarget`: an absolutely positioned `Animated.View` translated by `x/y` shared values. Available shapes: circle with a central dot (default), filled circle, ring, letter E, letter C, star.
- `PathOverlay`: faint SVG polylines of the program guides. Used for guided mode, the Lab, and H Pattern.
- `Markers`: dim stationary markers (for example, the inactive saccade target).
- `SceneStage`: non-target steps (letter, "look far" dim screen, eyes closed, blink, breathe, message).
- `DebugOverlay` (Developer mode only): coordinates, FPS, progress, state, elapsed, phase, seed. It uses animated text props, so it stays on the UI thread.

## 6. State and persistence

| Store           | Persisted key    | Contents                                                                                                                                                                           |
| --------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settingsStore` | `oa.settings.v1` | voice, haptics, sound, language, speech rate, default speed, target type/size, high contrast, reduce motion, canvas theme, safety acceptance, dev mode, debug overlay, safe margin |
| `sessionsStore` | `oa.sessions.v1` | `SessionRecord[]` (activity, date, duration, difficulty, params, completed, comfort)                                                                                               |
| `labStore`      | `oa.lab.v1`      | last Activity Lab configuration                                                                                                                                                    |
| `devStore`      | `oa.dev.v1`      | per-activity parameter overrides and voice-text overrides                                                                                                                          |

Statistics (`utils/stats.ts`) are pure functions over the records: today, this week, minutes, completed count, streak.

## 7. Services

- **VoiceInstructionService** (`services/voice.ts`): `configure({enabled, language, rate})`, `speak`, `stop`, `pause`, `resume`. Language: `es-MX` / `en-US`. Native pause exists only on iOS, so on Android pausing falls back to stopping speech.
- **Haptics** (`services/haptics.ts`): `start`, `complete`, `transition`, `tick`. Respects the settings. It never fires during smooth-pursuit motion segments.
- **Sound** (`services/sound.ts`): a short soft tick for saccade jumps (optional).

## 8. Adding a new activity

1. Create `src/activities/<category>/<name>.ts` that exports an `ActivityDefinition`. Most tracking activities are a few lines built from `defineTrackingActivity()` plus a path generator in `core/paths.ts`.
2. Register it in `src/activities/index.ts`.
3. The Activities list, Player, Developer panel, session history and definition tests pick it up automatically. The test suite builds every registered definition on several screen sizes and checks that every target stays inside the safe band.

## 9. Future extension points

- **Remote protocols**: definitions and params are serializable, and `build()` is pure.
- **Camera / head / distance sensing**: an extra input provider for the engine (for example, pausing when the head moves) without touching the activities.
- **Cloud sync / professional dashboard**: `SessionRecord` already stores the parameters and comfort feedback, and a sync adapter can subscribe to `sessionsStore`.
