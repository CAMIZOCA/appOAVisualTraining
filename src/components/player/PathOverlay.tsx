import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import type { Point, Polyline as PolylineData, Size } from '@/activities/core/types';

interface PathOverlayProps {
  canvas: Size;
  guides: PolylineData[];
  markers: Point[];
  markerSize: number;
  guideColor: string;
  markerColor: string;
  showGuides: boolean;
}

/** Static layer: faint trajectory (guided mode) and dim stationary markers. Renders once. */
export const PathOverlay = memo(function PathOverlay({
  canvas,
  guides,
  markers,
  markerSize,
  guideColor,
  markerColor,
  showGuides,
}: PathOverlayProps) {
  if ((!showGuides || guides.length === 0) && markers.length === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      importantForAccessibility="no-hide-descendants">
      <Svg width={canvas.width} height={canvas.height}>
        {showGuides
          ? guides.map((g, i) => (
              <Polyline
                key={`g${i}`}
                points={g.xs.map((x, k) => `${x.toFixed(1)},${g.ys[k].toFixed(1)}`).join(' ')}
                fill="none"
                stroke={guideColor}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))
          : null}
        {markers.map((m, i) => (
          <Circle
            key={`m${i}`}
            cx={m.x}
            cy={m.y}
            r={markerSize / 2 - 1.5}
            fill="none"
            stroke={markerColor}
            strokeWidth={3}
          />
        ))}
      </Svg>
    </View>
  );
});
