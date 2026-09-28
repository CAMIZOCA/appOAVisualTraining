import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import type { TargetType } from '@/activities/core/types';

interface TargetShapeProps {
  type: TargetType;
  size: number;
  color: string;
  /** Color of the central dot / background details. */
  inner: string;
}

function starPoints(size: number): string {
  const c = size / 2;
  const outer = size / 2;
  const innerR = outer * 0.45;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : innerR;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${c + r * Math.cos(a)},${c + r * Math.sin(a) + size * 0.04}`);
  }
  return pts.join(' ');
}

/**
 * Static visual target drawn in a `size × size` box. Shapes are deliberately simple,
 * high-contrast and non-distracting.
 */
export function TargetShape({ type, size, color, inner }: TargetShapeProps) {
  const c = size / 2;
  const u = size / 5; // optotype grid unit (E and C are drawn on a 5×5 grid)
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {type === 'dotCenter' ? (
        <>
          <Circle cx={c} cy={c} r={c} fill={color} />
          <Circle cx={c} cy={c} r={Math.max(2, size * 0.14)} fill={inner} />
        </>
      ) : null}
      {type === 'filled' ? <Circle cx={c} cy={c} r={c} fill={color} /> : null}
      {type === 'ring' ? (
        <Circle
          cx={c}
          cy={c}
          r={c - Math.max(1.5, size * 0.09)}
          stroke={color}
          strokeWidth={Math.max(3, size * 0.18)}
          fill="none"
        />
      ) : null}
      {type === 'letterE' ? (
        <>
          <Rect x={0} y={0} width={size} height={u} fill={color} />
          <Rect x={0} y={2 * u} width={size} height={u} fill={color} />
          <Rect x={0} y={4 * u} width={size} height={u} fill={color} />
          <Rect x={0} y={0} width={u} height={size} fill={color} />
        </>
      ) : null}
      {type === 'letterC' ? (
        // Landolt C: ring of stroke u with a gap of width u on the right.
        <Path
          d={(() => {
            const r = c - u / 2;
            const half = Math.asin(u / 2 / r);
            const x1 = c + r * Math.cos(half);
            const y1 = c - r * Math.sin(half);
            const x2 = c + r * Math.cos(-half);
            const y2 = c - r * Math.sin(-half);
            return `M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2}`;
          })()}
          stroke={color}
          strokeWidth={u}
          fill="none"
        />
      ) : null}
      {type === 'star' ? <Polygon points={starPoints(size)} fill={color} /> : null}
    </Svg>
  );
}
