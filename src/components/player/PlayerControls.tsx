import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import { spacing, type CanvasColors } from '@/theme';

interface PlayerControlsProps {
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  colors: CanvasColors;
  labels: { pause: string; resume: string; stop: string };
}

/** Bottom controls: large, subdued, outside the activity canvas. */
export function PlayerControls({
  paused,
  onPause,
  onResume,
  onStop,
  colors,
  labels,
}: PlayerControlsProps) {
  const tint = { background: colors.hudSurface, foreground: colors.hud, border: colors.guide };
  return (
    <View style={styles.row}>
      <Button
        label={paused ? labels.resume : labels.pause}
        icon={paused ? 'play' : 'pause'}
        onPress={paused ? onResume : onPause}
        tint={paused ? { background: colors.target, foreground: colors.background } : tint}
        style={styles.btn}
      />
      <Button label={labels.stop} icon="stop" onPress={onStop} tint={tint} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg },
  btn: { flex: 1 },
});
