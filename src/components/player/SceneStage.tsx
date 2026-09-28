import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { SceneSegment } from '@/activities/core/types';
import { Icon } from '@/components/ui';
import { spacing, typography, type CanvasColors } from '@/theme';

import { TargetShape } from './TargetShape';

interface SceneStageProps {
  segment: SceneSegment;
  text: string;
  colors: CanvasColors;
  /** Seconds left in this step (for steps with a visible countdown). */
  stepSecondsLeft: number;
  reduceMotion: boolean;
  progress: SharedValue<number>;
}

const SCENE_ICONS: Partial<Record<SceneSegment['scene'], string>> = {
  far: 'image-filter-hdr',
  eyesClosed: 'eye-closed',
  relax: 'human-handsdown',
};

/** A gently looping animation value (0 → 1 → 0), static when reduce motion is on. */
function useLoop(periodMs: number, enabled: boolean) {
  const v = useSharedValue(0);
  useEffect(() => {
    if (!enabled) return;
    v.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: periodMs / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: periodMs / 2, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(v);
  }, [v, periodMs, enabled]);
  return v;
}

function Breathe({ color, reduceMotion }: { color: string; reduceMotion: boolean }) {
  // 4 s in, 4 s out: a calm breathing rhythm.
  const v = useLoop(8000, !reduceMotion);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.55 + v.get() * 0.45 }] }));
  return (
    <Animated.View
      style={[styles.breathe, { borderColor: color, backgroundColor: `${color}14` }, style]}
    />
  );
}

function Blink({ color, reduceMotion }: { color: string; reduceMotion: boolean }) {
  // Slow blink roughly every 2.4 s.
  const v = useLoop(2400, !reduceMotion);
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: v.get() > 0.85 ? 1 - (v.get() - 0.85) * 6 : 1 }],
  }));
  return (
    <Animated.View style={style}>
      <Icon name="eye-outline" color={color} size={120} />
    </Animated.View>
  );
}

function Pulse({ children, reduceMotion }: { children: React.ReactNode; reduceMotion: boolean }) {
  const v = useLoop(5000, !reduceMotion);
  const style = useAnimatedStyle(() => ({ opacity: 0.55 + v.get() * 0.45 }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function ProgressBar({
  progress,
  color,
  track,
}: {
  progress: SharedValue<number>;
  color: string;
  track: string;
}) {
  const style = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));
  return (
    <View style={[styles.bar, { backgroundColor: track }]}>
      <Animated.View style={[styles.barFill, { backgroundColor: color }, style]} />
    </View>
  );
}

/** Guided step without a moving target (relaxation, accommodation, convergence). */
export function SceneStage({
  segment,
  text,
  colors,
  stepSecondsLeft,
  reduceMotion,
  progress,
}: SceneStageProps) {
  const isFar = segment.scene === 'far';
  const fg = isFar ? '#F1F5F2' : colors.target;
  const icon = SCENE_ICONS[segment.scene];

  let visual: React.ReactNode = null;
  switch (segment.scene) {
    case 'letter':
      visual = (
        <Text
          allowFontScaling={false}
          style={{
            color: colors.target,
            fontSize: segment.sizePx ?? 96,
            lineHeight: (segment.sizePx ?? 96) * 1.1,
            fontWeight: '700',
            letterSpacing: 0,
          }}>
          {segment.letter ?? 'E'}
        </Text>
      );
      break;
    case 'convergence':
      visual = (
        <TargetShape
          type={segment.letter ? 'letterE' : 'dotCenter'}
          size={segment.sizePx ?? 48}
          color={colors.target}
          inner={colors.targetInner}
        />
      );
      break;
    case 'breathe':
      visual = <Breathe color={colors.target} reduceMotion={reduceMotion} />;
      break;
    case 'blink':
      visual = <Blink color={colors.target} reduceMotion={reduceMotion} />;
      break;
    case 'message':
      visual = null;
      break;
    default:
      visual = icon ? (
        <Pulse reduceMotion={reduceMotion}>
          <Icon name={icon} color={fg} size={112} />
        </Pulse>
      ) : null;
  }

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.center, isFar && { backgroundColor: colors.dim }]}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={text}>
      <View style={styles.visual}>{visual}</View>
      {text ? (
        <Text
          maxFontSizeMultiplier={1.6}
          style={[
            segment.scene === 'message' ? typography.title : typography.heading,
            styles.text,
            { color: fg },
          ]}>
          {text}
        </Text>
      ) : null}
      {segment.showCountdown && stepSecondsLeft > 0 ? (
        <Text allowFontScaling={false} style={[styles.countdown, { color: fg }]}>
          {stepSecondsLeft}
        </Text>
      ) : null}
      {segment.scene === 'convergence' ? (
        <View style={styles.barWrap}>
          <ProgressBar progress={progress} color={colors.target} track={colors.guide} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.xl },
  visual: { minHeight: 140, alignItems: 'center', justifyContent: 'center' },
  text: { textAlign: 'center', maxWidth: 420 },
  countdown: { fontSize: 44, fontWeight: '300', fontVariant: ['tabular-nums'] },
  breathe: { width: 200, height: 200, borderRadius: 100, borderWidth: 3 },
  barWrap: { position: 'absolute', left: spacing.xxl, right: spacing.xxl, bottom: spacing.xl },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
