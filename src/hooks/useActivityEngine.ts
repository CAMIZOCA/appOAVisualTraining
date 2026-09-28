import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  useFrameCallback,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import {
  advanceClock,
  COUNTDOWN_MS,
  countdownSecondsLeft,
  progressOf,
  remainingSeconds,
} from '@/activities/core/clock';
import { startPosition } from '@/activities/core/program';
import {
  locateSegment,
  positionInSegment,
  segmentEnds,
  segmentStartAt,
} from '@/activities/core/timeline';
import type { ActivityProgram, Segment } from '@/activities/core/types';

export type EngineStatus = 'ready' | 'countdown' | 'running' | 'paused' | 'completed' | 'stopped';

export interface DebugSnapshot {
  x: number;
  y: number;
  fps: number;
  elapsed: number;
  progress: number;
  segmentProgress: number;
  segmentIndex: number;
}

export interface EngineCallbacks {
  /** A segment became active (fire its cues). */
  onSegment?: (index: number, segment: Segment) => void;
  /** Countdown finished; the activity itself begins. */
  onBegin?: () => void;
  /** The program reached its end. */
  onComplete?: () => void;
  /** Debug snapshots (~5 Hz), only when `debug` is enabled. */
  onDebug?: (snapshot: DebugSnapshot) => void;
}

export interface EngineOptions {
  reduceMotion?: boolean;
  debug?: boolean;
}

export interface ActivityEngine {
  status: EngineStatus;
  /** 3…1 during countdown. */
  countdown: number;
  /** Whole seconds remaining in the activity. */
  secondsLeft: number;
  /** Program time (ms) at the last whole-second tick; used for per-step countdowns. */
  tickElapsed: number;
  segmentIndex: number;
  /** UI-thread values for renderers (never read during render). */
  shared: {
    x: SharedValue<number>;
    y: SharedValue<number>;
    visible: SharedValue<number>;
    pulse: SharedValue<number>;
    progress: SharedValue<number>;
  };
  ends: number[];
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  /** Activity time actually played (excludes countdown and pauses). */
  elapsedMs: () => number;
}

const DEBUG_INTERVAL_MS = 200;

/**
 * Plays an ActivityProgram. All per-frame work happens on the UI thread in a single frame
 * callback that writes shared values; React state only changes at transitions and once per
 * second, so the screen never re-renders per frame.
 */
export function useActivityEngine(
  program: ActivityProgram,
  callbacks: EngineCallbacks,
  options: EngineOptions = {},
): ActivityEngine {
  const { reduceMotion = false, debug = false } = options;
  const segments = program.segments;
  const totalMs = program.totalMs;
  const ends = useMemo(() => segmentEnds(segments), [segments]);
  const startAt = useMemo(() => startPosition(program), [program]);

  const [status, setStatus] = useState<EngineStatus>('ready');
  const [countdown, setCountdown] = useState(Math.ceil(COUNTDOWN_MS / 1000));
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(totalMs / 1000));
  const [tickElapsed, setTickElapsed] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(-1);

  const elapsed = useSharedValue(-COUNTDOWN_MS);
  const running = useSharedValue(false);
  const segIdx = useSharedValue(-1);
  const lastTick = useSharedValue(-1);
  const lastDebug = useSharedValue(0);
  const fps = useSharedValue(60);
  const x = useSharedValue(startAt?.x ?? 0);
  const y = useSharedValue(startAt?.y ?? 0);
  const visible = useSharedValue(startAt ? 1 : 0);
  const pulse = useSharedValue(1);
  const progress = useSharedValue(0);

  // Keep latest callbacks without re-registering the frame callback for every render.
  const cbRef = useRef(callbacks);
  useLayoutEffect(() => {
    cbRef.current = callbacks;
  });

  const handleCountdown = useCallback((sec: number) => setCountdown(sec), []);
  const handleBegin = useCallback(() => {
    setStatus((s) => (s === 'countdown' ? 'running' : s));
    cbRef.current.onBegin?.();
  }, []);
  const handleSecond = useCallback((rem: number, e: number) => {
    setSecondsLeft(rem);
    setTickElapsed(e);
  }, []);
  const handleSegment = useCallback(
    (i: number) => {
      setSegmentIndex(i);
      const seg = segments[i];
      if (seg) cbRef.current.onSegment?.(i, seg);
    },
    [segments],
  );
  const handleComplete = useCallback(() => {
    setStatus('completed');
    setSecondsLeft(0);
    cbRef.current.onComplete?.();
  }, []);
  const handleDebug = useCallback((s: DebugSnapshot) => cbRef.current.onDebug?.(s), []);

  useFrameCallback((frame) => {
    'worklet';
    const dt = frame.timeSincePreviousFrame ?? 0;
    if (dt > 0) fps.set(fps.get() * 0.9 + (1000 / dt) * 0.1);
    if (!running.get() || segments.length === 0) return;

    const prev = elapsed.get();
    const e = advanceClock(prev, dt, totalMs, true);
    elapsed.set(e);

    if (e < 0) {
      const c = countdownSecondsLeft(e);
      if (c !== lastTick.get()) {
        lastTick.set(c);
        scheduleOnRN(handleCountdown, c);
      }
      return;
    }
    if (prev < 0) scheduleOnRN(handleBegin);

    const rem = remainingSeconds(e, totalMs);
    if (1000 + rem !== lastTick.get()) {
      lastTick.set(1000 + rem);
      scheduleOnRN(handleSecond, rem, e);
    }

    const i = locateSegment(ends, e >= totalMs ? totalMs - 0.001 : e);
    const seg = segments[i];
    if (i !== segIdx.get()) {
      segIdx.set(i);
      if (seg.kind === 'fixation' && !reduceMotion) {
        pulse.set(
          withSequence(withTiming(1.3, { duration: 90 }), withTiming(1, { duration: 200 })),
        );
      }
      scheduleOnRN(handleSegment, i);
    }

    const segStart = segmentStartAt(ends, i);
    const local = seg.durationMs > 0 ? (e - segStart) / seg.durationMs : 1;
    const p = positionInSegment(seg, local);
    if (p) {
      x.set(p.x);
      y.set(p.y);
      visible.set(1);
    } else {
      visible.set(0);
    }
    progress.set(progressOf(e, totalMs));

    if (debug && e - lastDebug.get() >= DEBUG_INTERVAL_MS) {
      lastDebug.set(e);
      scheduleOnRN(handleDebug, {
        x: x.get(),
        y: y.get(),
        fps: fps.get(),
        elapsed: e,
        progress: progress.get(),
        segmentProgress: local > 1 ? 1 : local,
        segmentIndex: i,
      });
    }

    if (e >= totalMs) {
      running.set(false);
      scheduleOnRN(handleComplete);
    }
  });

  const start = useCallback(() => {
    elapsed.set(-COUNTDOWN_MS);
    segIdx.set(-1);
    lastTick.set(-1);
    lastDebug.set(-COUNTDOWN_MS);
    progress.set(0);
    if (startAt) {
      x.set(startAt.x);
      y.set(startAt.y);
      visible.set(1);
    } else {
      visible.set(0);
    }
    setCountdown(Math.ceil(COUNTDOWN_MS / 1000));
    setSecondsLeft(Math.ceil(totalMs / 1000));
    setTickElapsed(0);
    setSegmentIndex(-1);
    setStatus('countdown');
    running.set(true);
  }, [elapsed, segIdx, lastTick, lastDebug, progress, startAt, x, y, visible, totalMs, running]);

  const pause = useCallback(() => {
    if (status !== 'countdown' && status !== 'running') return;
    running.set(false);
    setStatus('paused');
  }, [running, status]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    running.set(true);
    setStatus(elapsed.get() < 0 ? 'countdown' : 'running');
  }, [running, elapsed, status]);

  const stop = useCallback(() => {
    running.set(false);
    setStatus((s) => (s === 'completed' ? s : 'stopped'));
  }, [running]);

  const elapsedMs = useCallback(() => {
    const e = elapsed.get();
    return e > 0 ? Math.min(e, totalMs) : 0;
  }, [elapsed, totalMs]);

  return {
    status,
    countdown,
    secondsLeft,
    tickElapsed,
    segmentIndex,
    shared: { x, y, visible, pulse, progress },
    ends,
    start,
    pause,
    resume,
    stop,
    elapsedMs,
  };
}
