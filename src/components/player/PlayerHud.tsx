import { StyleSheet, Text, View } from 'react-native';

import { spacing, type CanvasColors } from '@/theme';
import { formatClock } from '@/utils/format';

interface PlayerHudProps {
  title: string;
  secondsLeft: number;
  countdown: number;
  inCountdown: boolean;
  paused: boolean;
  colors: CanvasColors;
  labels: { getReady: string; remaining: string; paused: string };
  devBadge?: string;
}

/** Minimal top bar: remaining time (or the 3-2-1 countdown). Never overlaps the canvas. */
export function PlayerHud({
  title,
  secondsLeft,
  countdown,
  inCountdown,
  paused,
  colors,
  labels,
  devBadge,
}: PlayerHudProps) {
  const main = inCountdown ? String(countdown) : formatClock(secondsLeft);
  const caption = paused ? labels.paused : inCountdown ? labels.getReady : labels.remaining;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="timer"
      accessibilityLiveRegion={inCountdown ? 'assertive' : 'none'}
      accessibilityLabel={`${title}. ${caption}: ${main}`}>
      <View style={styles.side}>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
          style={[styles.title, { color: colors.hud }]}>
          {title}
        </Text>
        {devBadge ? (
          <Text
            maxFontSizeMultiplier={1.2}
            style={[styles.badge, { color: colors.hud, borderColor: colors.hud }]}>
            {devBadge}
          </Text>
        ) : null}
      </View>
      <View style={styles.timer}>
        <Text maxFontSizeMultiplier={1.2} style={[styles.caption, { color: colors.hud }]}>
          {caption}
        </Text>
        <Text
          maxFontSizeMultiplier={1.2}
          style={[styles.time, inCountdown && styles.countdown, { color: colors.target }]}>
          {main}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 64,
    gap: spacing.md,
  },
  side: { flex: 1, minWidth: 0, gap: 4, alignItems: 'flex-start' },
  title: { fontSize: 15, fontWeight: '600' },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  timer: { alignItems: 'flex-end' },
  caption: { fontSize: 12, fontWeight: '500' },
  time: { fontSize: 26, fontWeight: '600', fontVariant: ['tabular-nums'] },
  countdown: { fontSize: 34 },
});
