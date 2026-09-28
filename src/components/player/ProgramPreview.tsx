import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline, Rect } from 'react-native-svg';

import { bandRect } from '@/activities/core/geometry';
import { startPosition } from '@/activities/core/program';
import type { AnyActivityDefinition, ParamValues, Point, Size } from '@/activities/core/types';
import { radius, useColors } from '@/theme';

interface ProgramPreviewProps {
  definition: AnyActivityDefinition;
  params: ParamValues;
  /** Aspect of the real canvas; the preview is scaled to `width`. */
  canvas: Size;
  width: number;
  safeMargin: number;
}

/**
 * Static thumbnail of everything a program will do: the full trajectory, jump targets,
 * start position and the safe band. Lets testers see a configuration before running it.
 */
export function ProgramPreview({
  definition,
  params,
  canvas,
  width,
  safeMargin,
}: ProgramPreviewProps) {
  const colors = useColors();
  const scale = width / canvas.width;
  const height = canvas.height * scale;

  const { lines, dots, start } = useMemo(() => {
    const program = definition.build(params, { canvas, safeMargin, reduceMotion: false, seed: 1 });
    const lines: string[] = [];
    const dotSet = new Map<string, Point>();
    for (const s of program.segments) {
      if (s.kind === 'motion') {
        lines.push(
          s.xs.map((x, i) => `${(x * scale).toFixed(1)},${(s.ys[i] * scale).toFixed(1)}`).join(' '),
        );
      } else if (s.kind === 'fixation') {
        dotSet.set(`${Math.round(s.at.x)}:${Math.round(s.at.y)}`, s.at);
      }
    }
    return { lines, dots: [...dotSet.values()], start: startPosition(program) };
  }, [definition, params, canvas, safeMargin, scale]);

  const band = bandRect(canvas, safeMargin);

  return (
    <View
      style={[
        styles.box,
        { width, height, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={height}>
        <Rect
          x={band.left * scale}
          y={band.top * scale}
          width={(band.right - band.left) * scale}
          height={(band.bottom - band.top) * scale}
          fill="none"
          stroke={colors.border}
          strokeDasharray="4 4"
        />
        {lines.map((pts, i) => (
          <Polyline
            key={i}
            points={pts}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2}
            strokeOpacity={0.6}
          />
        ))}
        {dots.map((d, i) => (
          <Circle
            key={i}
            cx={d.x * scale}
            cy={d.y * scale}
            r={4}
            fill={colors.primary}
            fillOpacity={0.7}
          />
        ))}
        {start ? (
          <Circle cx={start.x * scale} cy={start.y * scale} r={6} fill={colors.text} />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden', alignSelf: 'center' },
});
