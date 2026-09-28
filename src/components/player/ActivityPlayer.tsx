import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { estimateDurationMs } from '@/activities/core/program';
import { newSeed } from '@/activities/core/random';
import type { RunOptions } from '@/activities/core/runOptions';
import type { AnyActivityDefinition, ParamValues } from '@/activities/core/types';
import { useT } from '@/i18n';
import { voice } from '@/services/voice';
import { useDev } from '@/store/devStore';
import { createSessionId, useSessions } from '@/store/sessionsStore';
import { useSettings } from '@/store/settingsStore';
import type { Comfort } from '@/types/session';

import { ActivityRun, estimateCanvas, type RunResult } from './ActivityRun';
import { PreActivityPanel } from './PreActivityPanel';
import { ResultPanel } from './ResultPanel';

type Phase = 'setup' | 'run' | 'result';

/** Runs shorter than this (after the countdown) are not recorded as sessions. */
const MIN_RECORD_MS = 1000;

interface ActivityPlayerProps {
  definition: AnyActivityDefinition;
  mode: 'activity' | 'lab';
  initialParams: ParamValues;
  initialRun: RunOptions;
  /** Lab runs start immediately (the Lab screen is their setup). */
  skipSetup?: boolean;
  onDone: () => void;
}

/**
 * The common player used by every activity and the Lab:
 * setup (purpose, instructions, options) → run (countdown + activity) → result (feedback).
 */
export function ActivityPlayer({
  definition,
  mode,
  initialParams,
  initialRun,
  skipSetup,
  onDone,
}: ActivityPlayerProps) {
  const { l } = useT();
  const devMode = useSettings((s) => s.devMode);
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const safeMargin = useSettings((s) => s.safeMargin);
  const setDevParams = useDev((s) => s.setParams);
  const addSession = useSessions((s) => s.add);
  const setComfortStore = useSessions((s) => s.setComfort);
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>(skipSetup ? 'run' : 'setup');
  const [params, setParams] = useState<ParamValues>(initialParams);
  const [run, setRun] = useState<RunOptions>(initialRun);
  const [seed, setSeed] = useState(newSeed);
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [comfort, setComfort] = useState<Comfort | null>(null);

  const difficulty = definition.difficultyOf
    ? definition.difficultyOf(params)
    : definition.difficulty;

  // Estimate with the canvas this device will actually have.
  const estimatedMs = useMemo(() => {
    const canvas = estimateCanvas(window, insets);
    return estimateDurationMs(definition, params, canvas, safeMargin, reduceMotion);
  }, [definition, params, window, insets, safeMargin, reduceMotion]);

  const onParamsChange = (next: ParamValues) => {
    setParams(next);
    if (devMode && mode === 'activity') setDevParams(definition.id, next);
  };

  const start = () => {
    setSeed(newSeed());
    setResult(null);
    setRecordId(null);
    setComfort(null);
    setRunKey((k) => k + 1);
    setPhase('run');
  };

  const onFinish = useCallback(
    (r: RunResult) => {
      setResult(r);
      setPhase('result');
      if (mode !== 'activity' || !r.startedAt || r.elapsedMs < MIN_RECORD_MS) return;
      const id = createSessionId();
      setRecordId(id);
      addSession({
        id,
        activityId: definition.id,
        activityName: l(definition.name),
        startedAt: r.startedAt,
        durationMs: Math.round(r.elapsedMs),
        plannedMs: r.plannedMs,
        difficulty: definition.difficultyOf
          ? definition.difficultyOf(params)
          : definition.difficulty,
        params,
        completed: r.completed,
      });
    },
    [mode, addSession, definition, l, params],
  );

  const onComfort = (c: Comfort) => {
    setComfort(c);
    if (recordId) setComfortStore(recordId, c);
  };

  const done = () => {
    voice.stop();
    onDone();
  };

  if (phase === 'run') {
    return (
      <ActivityRun
        key={runKey}
        definition={definition}
        params={params}
        run={run}
        seed={seed}
        badge={mode === 'lab' ? 'LAB' : devMode ? 'TEST' : undefined}
        onFinish={onFinish}
      />
    );
  }

  if (phase === 'result' && result) {
    return (
      <ResultPanel
        title={l(definition.name)}
        result={result}
        difficulty={difficulty}
        mode={mode}
        comfort={comfort}
        onComfort={onComfort}
        onRepeat={start}
        onDone={done}
      />
    );
  }

  return (
    <PreActivityPanel
      definition={definition}
      params={params}
      onParamsChange={onParamsChange}
      run={run}
      onRunChange={(patch) => setRun((r) => ({ ...r, ...patch }))}
      devMode={devMode}
      estimatedMs={estimatedMs}
      difficulty={difficulty}
      onStart={start}
    />
  );
}
