import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface IconProps {
  name: string;
  size?: number;
  color: string;
}

/** Decorative icon (hidden from screen readers; the surrounding control carries the label). */
export function Icon({ name, size = 22, color }: IconProps) {
  return (
    <MaterialCommunityIcons
      name={name as IconName}
      size={size}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
