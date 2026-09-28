# TASKS

Legend: `[x]` done · `[ ]` pending. Each phase closes with `npm run verify` + commit.

## Phase 0 — Project foundation

- [x] git repository, `.gitattributes` (LF)
- [x] Dependencies (zustand, async-storage, speech, haptics, keep-awake, audio, svg, vector-icons)
- [x] ESLint (expo flat config + prettier), Prettier, Jest (`jest-expo`), scripts (`lint`, `typecheck`, `test`, `verify`, `format`)
- [x] Remove create-expo-app template leftovers
- [x] PROJECT_PLAN.md, ARCHITECTURE.md, TASKS.md
- [x] Theme / design tokens (normal + high contrast, canvas themes)
- [x] i18n (es / en) with typed keys
- [x] UI kit: Screen, AppText, Button, Card, Chip, SegmentedControl, Stepper, ToggleRow, ListRow, StatTile
- [x] Stores: settings, sessions, lab, dev (persisted)
- [x] Navigation: root stack, 4 tabs, activity player route, lab, developer, about, safety
- [x] Safety onboarding gate

## Phase 1 — Activity engine

- [x] `types.ts`: ActivityDefinition, ParamField, Segment union, ActivityProgram
- [x] `geometry.ts`: normalized ↔ px, safe band, polyline arc length
- [x] `paths.ts`: line, polyline, circle, infinity, star spokes, H, grid
- [x] `speed.ts`: speed levels, saccade pace, reduce-motion caps
- [x] `timeline.ts` + `clock.ts` (worklet-safe, unit tested)
- [x] `program.ts`: repetition/time expansion, validation
- [x] `random.ts`: seeded PRNG
- [x] `registry.ts`
- [x] Services: VoiceInstructionService, haptics, sound (tick)
- [x] `useActivityEngine` (UI-thread frame callback, pause/resume/stop, countdown)
- [x] Player components: canvas, VisualTarget, PathOverlay, markers, HUD, controls, countdown, pre-panel, result panel
- [x] Unit tests: timer/clock, timeline, geometry, speed, program

## Phase 2 — Core activities

- [x] Horizontal tracking, Vertical tracking
- [x] Circle clockwise / counterclockwise (single factory)
- [x] Star / asterisk (4, 8, random; return to center)
- [x] Saccades horizontal / vertical
- [x] Figure eight / infinity (horizontal, vertical)
- [x] H pattern (guided / challenge)
- [x] Random saccades (3×3 grid, difficulty distance, seeded)
- [x] Definition tests across 3 screen sizes

## Phase 3 — Activity Lab

- [x] Lab definition (8 paths) using shared path builders
- [x] Lab screen (ParamForm + run options + live path preview) with persisted config
- [x] Lab-mode player (no session record)
- [x] Developer mode: advanced parameter panel, voice text overrides, debug overlay

## Phase 4 — Relaxation and accommodation activities

- [x] Scene stage (letter, far, eyes closed, blink, breathe, relax, message, convergence)
- [x] Near / far focus
- [x] Guided convergence
- [x] Blink reset
- [x] Visual break

## Phase 5 — History and settings

- [x] Session saving + comfort feedback
- [x] Sessions screen (today, week, recent, stats)
- [x] Home dashboard (continue, quick, recommended, recent, stats)
- [x] Settings (all options), Developer screen, About, reset local data

## Phase 6 — QA and polish

- [ ] Accessibility labels / roles / states, font scaling
- [ ] Reduce motion + high contrast
- [ ] README (install, commands, Android/iOS, architecture, new activity guide, limitations)
- [ ] docs/QA_CHECKLIST.md
- [ ] Web smoke run of the acceptance flow
