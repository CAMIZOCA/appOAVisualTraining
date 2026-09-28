import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  BackHandler,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sanitizeMargin } from '@/activities/core/geometry';
import { resolvePrompt } from '@/activities/core/prompts';
import { resolveTargetSizePx, type RunOptions } from '@/activities/core/runOptions';
import type {
  ActivityProgram,
  AnyActivityDefinition,
  ParamValues,
  Segment,
  Size,
} from '@/activities/core/types';
import { useActivityEngine, type DebugSnapshot } from '@/hooks/useActivityEngine';
import { useScreenAwake } from '@/hooks/useScreenAwake';
import { useT } from '@/i18n';
import { haptic } from '@/services/haptics';
import { playTick, preloadSounds, stopSounds } from '@/services/sound';
import { voice } from '@/services/voice';
import { useDev } from '@/store/devStore';
import { useSettings } from '@/store/settingsStore';
import { canvasThemes, spacing, touch, type CanvasColors } from '@/theme';

import { DebugOverlay } from './DebugOverlay';
import { PathOverlay } from './PathOverlay';
import { PlayerControls } from './PlayerControls';
import { PlayerHud } from './PlayerHud';
import { SceneStage } from './SceneStage';
import { VisualTarget } from './VisualTarget';

export const HUD_HEIGHT = 72;
export const CONTROLS_HEIGHT = touch.primary + spacing.md * 2;

/** Canvas size implied by the fixed layout; refined by onLayout once measured. */
export function estimateCanvas(
  window: { width: number; height: number },
  insets: { top: number; bottom: number },
): Size {
  return {
    width: Math.round(window.width),
    height: Math.max(
      200,
      Math.round(window.height - insets.top - insets.bottom - HUD_HEIGHT - CONTROLS_HEIGHT),
    ),
  };
}

export interface RunResult {
  completed: boolean;
  /** Activity time actually played (excludes countdown and pauses). */
  elapsedMs: number;
  plannedMs: number;
  /** ISO time when the countdown finished, null if stopped during countdown. */
  startedAt: string | null;
}

interface ActivityRunProps {
  definition: AnyActivityDefinition;
  params: ParamValues;
  run: RunOptions;
  seed: number;
  /** Label for the dev badge in the HUD (e.g. "LAB"). */
  badge?: string;
  onFinish: (result: RunResult) => void;
}

/**
 * Full-screen activity run. The layout is fixed (HUD · canvas · controls); the canvas is
 * measured first and the program is compiled for its exact size, then the engine starts.
 */
export function ActivityRun(props: ActivityRunProps) {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [canvas, setCanvas] = useState<Size>(() => estimateCanvas(window, insets));
  const colors = canvasThemes[props.run.canvasTheme];

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const w = Math.round(width);
    const h = Math.round(height);
    setCanvas((prev) =>
      prev && Math.abs(prev.width - w) <= 2 && Math.abs(prev.height - h) <= 2
        ? prev
        : { width: w, height: h },
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={{ height: insets.top + HUD_HEIGHT }} />
      <View style={styles.fill} onLayout={onLayout} />
      <View style={{ height: CONTROLS_HEIGHT + insets.bottom }} />
      {canvas && canvas.width > 0 && canvas.height > 0 ? (
        <Runner
          key={`${canvas.width}x${canvas.height}`}
          {...props}
          canvas={canvas}
          colors={colors}
        />
      ) : null}
    </View>
  );
}

function Runner({
  definition,
  params,
  run,
  seed,
  badge,
  onFinish,
  canvas,
  colors,
}: ActivityRunProps & { canvas: Size; colors: CanvasColors }) {
  useScreenAwake();
  const insets = useSafeAreaInsets();
  const { t, l, lang } = useT();
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const safeMargin = useSettings((s) => s.safeMargin);
  const promptOverrides = useDev((s) => s.promptOverrides[definition.id]);

  const program: ActivityProgram = useMemo(
    () =>
      definition.build(params, {
        canvas,
        safeMargin: sanitizeMargin(safeMargin),
        reduceMotion,
        seed,
      }),
    [definition, params, canvas, safeMargin, reduceMotion, seed],
  );

  const [debug, setDebug] = useState<DebugSnapshot | null>(null);
  const startedAt = useRef<string | null>(null);
  const finished = useRef(false);
  const prompt = useCallback(
    (key?: string) => resolvePrompt(definition, key, lang, promptOverrides),
    [definition, lang, promptOverrides],
  );

  const onSegment = useCallback(
    (_: number, seg: Segment) => {
      const cue = seg.cue;
      if (!cue) return;
      if (cue.voice) voice.speak(prompt(cue.voice));
      if (cue.haptic) haptic(cue.haptic);
      if (cue.sound === 'tick') playTick();
    },
    [prompt],
  );

  const engine = useActivityEngine(
    program,
    {
      onSegment,
      onBegin: () => {
        startedAt.current = new Date().toISOString();
        haptic('start');
      },
      onComplete: () => {
        if (finished.current) return;
        finished.current = true;
        haptic('complete');
        voice.speak(t('voice.done'));
        onFinish({
          completed: true,
          elapsedMs: program.totalMs,
          plannedMs: program.totalMs,
          startedAt: startedAt.current,
        });
      },
      onDebug: setDebug,
    },
    { reduceMotion, debug: run.debug },
  );

  const { start, pause, resume, stop, elapsedMs, status } = engine;

  // Autostart: voice intro + countdown.
  useEffect(() => {
    // The per-run voice toggle wins over the global setting for this run only.
    voice.configure({ enabled: run.voice });
    preloadSounds();
    start();
    if (definition.introPrompt) voice.speak(prompt(definition.introPrompt));
    return () => {
      voice.stop();
      stopSounds();
      voice.configure({ enabled: useSettings.getState().voiceEnabled });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStop = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    stop();
    voice.stop();
    stopSounds();
    onFinish({
      completed: false,
      elapsedMs: elapsedMs(),
      plannedMs: program.totalMs,
      startedAt: startedAt.current,
    });
  }, [stop, elapsedMs, onFinish, program.totalMs]);

  const handlePause = useCallback(() => {
    pause();
    voice.pause();
    stopSounds();
  }, [pause]);

  const handleResume = useCallback(() => {
    resume();
    voice.resume();
  }, [resume]);

  // Android back = stop; app to background = pause.
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      handleStop();
      return true;
    });
    const app = AppState.addEventListener('change', (state) => {
      if (state !== 'active') handlePause();
    });
    return () => {
      back.remove();
      app.remove();
    };
  }, [handleStop, handlePause]);

  const seg = engine.segmentIndex >= 0 ? program.segments[engine.segmentIndex] : undefined;
  const scene = seg?.kind === 'scene' ? seg : null;
  const stepSecondsLeft = scene
    ? Math.max(0, Math.ceil((engine.ends[engine.segmentIndex] - engine.tickElapsed) / 1000))
    : 0;
  const targetSize = resolveTargetSizePx(run);
  const paused = status === 'paused';
  const inCountdown = status === 'countdown' || (paused && engine.segmentIndex < 0);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.hud, { paddingTop: insets.top, height: insets.top + HUD_HEIGHT }]}>
        <PlayerHud
          title={l(definition.name)}
          secondsLeft={engine.secondsLeft}
          countdown={engine.countdown}
          inCountdown={inCountdown}
          paused={paused}
          colors={colors}
          devBadge={badge}
          labels={{
            getReady: t('player.getReady'),
            remaining: t('player.remaining'),
            paused: t('player.paused'),
          }}
        />
      </View>

      <View
        style={[
          styles.canvas,
          { top: insets.top + HUD_HEIGHT, width: canvas.width, height: canvas.height },
        ]}
        accessibilityLabel={l(definition.name)}>
        <PathOverlay
          canvas={canvas}
          guides={program.guides}
          markers={program.markers}
          markerSize={targetSize}
          guideColor={colors.guide}
          markerColor={colors.marker}
          showGuides
        />
        {definition.usesTarget ? (
          <VisualTarget
            x={engine.shared.x}
            y={engine.shared.y}
            visible={engine.shared.visible}
            pulse={engine.shared.pulse}
            type={run.targetType}
            size={targetSize}
            color={colors.target}
            inner={colors.targetInner}
          />
        ) : null}
        {scene ? (
          <SceneStage
            key={engine.segmentIndex}
            segment={scene}
            text={prompt(scene.text)}
            colors={colors}
            stepSecondsLeft={stepSecondsLeft}
            reduceMotion={reduceMotion}
            progress={engine.shared.progress}
            targetType={run.targetType}
            targetSize={targetSize}
          />
        ) : null}
        {run.debug ? (
          <DebugOverlay
            snapshot={debug}
            status={status}
            phase={seg?.phase ?? (inCountdown ? 'countdown' : '')}
            segmentCount={program.segments.length}
            totalMs={program.totalMs}
            canvas={canvas}
            meta={program.meta}
          />
        ) : null}
      </View>

      <View
        style={[
          styles.controls,
          { height: CONTROLS_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
        ]}>
        <PlayerControls
          paused={paused}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          colors={colors}
          labels={{ pause: t('player.pause'), resume: t('player.resume'), stop: t('player.stop') }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  hud: { position: 'absolute', left: 0, right: 0, top: 0, justifyContent: 'center' },
  canvas: { position: 'absolute', left: 0, overflow: 'hidden' },
  controls: { position: 'absolute', left: 0, right: 0, bottom: 0, justifyContent: 'center' },
});
