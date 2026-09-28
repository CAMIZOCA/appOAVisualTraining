import { StyleSheet, Text, View } from 'react-native';

import type { Size } from '@/activities/core/types';
import type { DebugSnapshot, EngineStatus } from '@/hooks/useActivityEngine';
import { typography } from '@/theme';

interface DebugOverlayProps {
  snapshot: DebugSnapshot | null;
  status: EngineStatus;
  phase: string;
  segmentCount: number;
  totalMs: number;
  canvas: Size;
  meta: Record<string, string | number>;
}

/** Developer-mode overlay. Updated at ~5 Hz from the engine; never shown to regular users. */
export function DebugOverlay({
  snapshot,
  status,
  phase,
  segmentCount,
  totalMs,
  canvas,
  meta,
}: DebugOverlayProps) {
  const s = snapshot;
  const lines = [
    `state ${status}  phase ${phase || '—'}`,
    s
      ? `xy ${s.x.toFixed(0)},${s.y.toFixed(0)} px  (${(s.x / canvas.width).toFixed(3)}, ${(s.y / canvas.height).toFixed(3)})`
      : 'xy —',
    `fps ${s ? s.fps.toFixed(0) : '—'}`,
    `t ${s ? (s.elapsed / 1000).toFixed(1) : '0.0'} / ${(totalMs / 1000).toFixed(1)} s  ${s ? (s.progress * 100).toFixed(0) : 0}%`,
    `seg ${s ? s.segmentIndex + 1 : 0}/${segmentCount}  path ${s ? (s.segmentProgress * 100).toFixed(0) : 0}%`,
    `canvas ${canvas.width.toFixed(0)}×${canvas.height.toFixed(0)}`,
    ...Object.entries(meta).map(
      ([k, v]) => `${k} ${typeof v === 'number' ? Number(v.toFixed(2)) : v}`,
    ),
  ];
  return (
    <View pointerEvents="none" style={styles.box} importantForAccessibility="no-hide-descendants">
      {lines.map((l, i) => (
        <Text key={i} allowFontScaling={false} style={styles.line}>
          {l}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  line: { ...typography.mono, color: '#9CF5C8', fontSize: 11, lineHeight: 14 },
});
