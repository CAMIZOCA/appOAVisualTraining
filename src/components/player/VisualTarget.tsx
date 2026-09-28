import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { TargetType } from '@/activities/core/types';

import { TargetShape } from './TargetShape';

interface VisualTargetProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  visible: SharedValue<number>;
  pulse: SharedValue<number>;
  type: TargetType;
  size: number;
  color: string;
  inner: string;
}

/**
 * The moving target. Position comes from UI-thread shared values, so moving it never
 * re-renders React. The SVG itself is static.
 */
export function VisualTarget({
  x,
  y,
  visible,
  pulse,
  type,
  size,
  color,
  inner,
}: VisualTargetProps) {
  const style = useAnimatedStyle(() => ({
    opacity: visible.get(),
    transform: [
      { translateX: x.get() - size / 2 },
      { translateY: y.get() - size / 2 },
      { scale: pulse.get() },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, style]}>
      <TargetShape type={type} size={size} color={color} inner={inner} />
    </Animated.View>
  );
}
