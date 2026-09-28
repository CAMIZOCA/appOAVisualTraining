# OA Visual Training — Project Plan

## Purpose

OA Visual Training is an internal MVP built for **Óptica Andina**. Optometrists and developers use it to **rapidly design, run and tune guided visual activities** (tracking, saccades, convergence, accommodation, relaxation) on real Android and iOS phones.

It is **not** a medical device. It does not diagnose, treat, cure or measure anything, and it does not replace professional eye care.

### MVP goals

1. Test different visual activity concepts.
2. Evaluate usability.
3. Evaluate animations, timings, targets, instructions and interaction.
4. Let optometrists try the activities internally (Activity Lab + Developer/Test mode).
5. Lay a technical foundation for a future clinical/patient platform.

**Guiding rule:** when choosing between _more app infrastructure_ and _better exercise experimentation_, choose experimentation.

## Requirements analysis

| Area        | Decision                                                                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platforms   | Android + iOS through Expo (managed workflow). Runs in **Expo Go**, so there is no native build step.                                                                  |
| Stack       | Expo SDK 57, React Native 0.86, TypeScript, Expo Router, Zustand, Reanimated 4, Expo Speech, Expo Haptics, Expo Keep Awake, Expo Audio, react-native-svg, AsyncStorage |
| Orientation | Portrait only                                                                                                                                                          |
| Language    | Spanish (default) + English, switchable in Settings. The language controls both UI text and voice.                                                                     |
| Persistence | Local only (AsyncStorage). No backend.                                                                                                                                 |
| Animation   | UI thread only (Reanimated `useFrameCallback` + shared values). No per-frame React renders.                                                                            |
| Coordinates | Normalized 0–1 inside the activity canvas, kept inside a configurable safe band (default 0.1–0.9)                                                                      |
| Speed       | Normalized levels (Very slow → Fast) expressed as fractions of the canvas's short side per second                                                                      |
| Safety      | First-run safety notice that must be accepted. Calm, non-alarming wording. No clinical claims.                                                                         |

### Non-goals (MVP)

Authentication, patient/doctor portals, cloud backend, subscriptions, payments, camera/face/eye tracking, clinical diagnosis, automatic NPC measurement, AI recommendations, push notifications, gamification, social features, Apple Health / Health Connect.

### Future-ready seams

The architecture leaves room to add the following later without rewriting the engine:

- **Activity definitions** are data plus a pure `build()` function, so protocols can be assigned or configured remotely.
- **Session records** carry the full parameter set, so sync or adherence monitoring can reuse them.
- **Services** (voice, haptics, sound, storage) sit behind small interfaces, so they can be swapped for cloud or clinical versions.
- **Engine inputs are separate from renderers**, so camera or head-tracking sensors can later feed the engine or validate a run.

## Priority order

- **P0**: Activity Engine, Activity Player, Horizontal, Vertical, Circle, Star, Saccades, Infinity, Activity Lab
- **P1**: H Pattern, Random Saccades, Near/Far Focus, Guided Convergence, Relaxation
- **P2**: History, Statistics, Settings, Audio guidance, Haptics
- **P3**: UI polish, Accessibility, Developer tools

## Phases

The phases below are tracked in [TASKS.md](TASKS.md). Each phase ends with `npm run verify` (lint + typecheck + tests), error fixing, and a git commit.

| Phase                          | Scope                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| 0 — Project foundation         | Tooling, template cleanup, theme, i18n, UI kit, navigation skeleton, stores, safety gate      |
| 1 — Activity engine            | Types, geometry, paths, speed, timeline, clock, registry, services, engine hook, player       |
| 2 — Core activities            | Horizontal, Vertical, Circle CW/CCW, Star, Saccades H/V, Infinity, H Pattern, Random Saccades |
| 3 — Activity Lab               | Lab definition + screen, Developer parameter panel, debug overlay                             |
| 4 — Relaxation & accommodation | Near/Far, Guided Convergence, Blink Reset, Visual Break                                       |
| 5 — History & settings         | Session saving, comfort feedback, Sessions, Home dashboard, Settings, reset data              |
| 6 — QA & polish                | Accessibility, reduce motion, high contrast, README, QA checklist                             |

## Acceptance criteria

On a physical Android phone or iPhone, a user can:

1. Open Activities, select Horizontal Tracking and press Start.
2. See a 3-second countdown, then follow a smoothly animated target.
3. Pause, resume and complete the session, receive completion feedback, and return to Activities.
4. Select Circle, change the speed and run it.
5. Run Star, then Saccades.
6. Open Activity Lab, combine path, speed, duration and target size, and test the result immediately.
