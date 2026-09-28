import { Platform } from 'react-native';

import { useSettings } from '@/store/settingsStore';

export const palette = {
  background: '#F7F8F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2EF',
  text: '#14201B',
  textMuted: '#55625C',
  border: '#DCE3DE',
  primary: '#2E7D5B',
  primaryPressed: '#256A4C',
  primaryTint: '#E5F1EB',
  onPrimary: '#FFFFFF',
  danger: '#A8322B',
  dangerTint: '#FBEAE8',
  warning: '#8A5A00',
  overlay: 'rgba(20, 32, 27, 0.55)',
};

export type Palette = typeof palette;

export const highContrastPalette: Palette = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F0',
  text: '#000000',
  textMuted: '#1F1F1F',
  border: '#000000',
  primary: '#145A3C',
  primaryPressed: '#0E4630',
  primaryTint: '#DCEFE5',
  onPrimary: '#FFFFFF',
  danger: '#8E1B14',
  dangerTint: '#FBE3E0',
  warning: '#5C3C00',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export function useColors(): Palette {
  const highContrast = useSettings((s) => s.highContrast);
  return highContrast ? highContrastPalette : palette;
}

/** Colors used while an activity is running. Kept neutral so the target has maximum priority. */
export interface CanvasColors {
  background: string;
  target: string;
  targetInner: string;
  marker: string;
  guide: string;
  hud: string;
  hudSurface: string;
  dim: string;
}

export const canvasThemes = {
  light: {
    background: '#ECEFEC',
    target: '#15362A',
    targetInner: '#ECEFEC',
    marker: 'rgba(21, 54, 42, 0.28)',
    guide: 'rgba(21, 54, 42, 0.16)',
    hud: '#3E4A44',
    hudSurface: 'rgba(255, 255, 255, 0.7)',
    dim: 'rgba(12, 18, 15, 0.82)',
  },
  dark: {
    background: '#111513',
    target: '#F1F5F2',
    targetInner: '#111513',
    marker: 'rgba(241, 245, 242, 0.3)',
    guide: 'rgba(241, 245, 242, 0.16)',
    hud: '#C4CCC7',
    hudSurface: 'rgba(255, 255, 255, 0.08)',
    dim: 'rgba(0, 0, 0, 0.85)',
  },
  contrast: {
    background: '#FFFFFF',
    target: '#000000',
    targetInner: '#FFFFFF',
    marker: 'rgba(0, 0, 0, 0.45)',
    guide: 'rgba(0, 0, 0, 0.3)',
    hud: '#000000',
    hudSurface: 'rgba(0, 0, 0, 0.06)',
    dim: 'rgba(0, 0, 0, 0.88)',
  },
} satisfies Record<string, CanvasColors>;

export type CanvasTheme = keyof typeof canvasThemes;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/** Minimum touch target sizes (dp). */
export const touch = { min: 48, primary: 56 } as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontWeight: '600' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  mono: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
} as const;

export type TypographyVariant = keyof typeof typography;

export const shadow = Platform.select({
  ios: {
    shadowColor: '#0D1F17',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 1 },
  default: {},
});
