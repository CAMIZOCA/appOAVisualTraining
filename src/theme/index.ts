import { Platform } from 'react-native';

import { useSettings } from '@/store/settingsStore';

/**
 * Óptica Andina brand colors (from opticaandina.com.ec): blue `brand` scale for
 * primary UI, lime `accent` for secondary CTAs. White text on the lime accent fails
 * WCAG contrast, so `onAccent` is dark.
 */
export const brand = {
  blue50: '#EEF4FC',
  blue100: '#D6E6F8',
  blue600: '#2F66A8',
  blue700: '#284F8D',
  blue800: '#1F3C6E',
  blue900: '#162B52',
  lime50: '#F3FAEB',
  lime500: '#8DC63F',
  lime600: '#74A833',
  lime800: '#496920',
};

export const palette = {
  background: '#F6F8FB',
  surface: '#FFFFFF',
  surfaceAlt: brand.blue50,
  text: '#1A2840',
  textMuted: '#5E7285',
  border: '#D6E1EE',
  primary: brand.blue600,
  primaryPressed: brand.blue700,
  primaryTint: brand.blue50,
  onPrimary: '#FFFFFF',
  accent: brand.lime500,
  accentPressed: brand.lime600,
  accentTint: brand.lime50,
  onAccent: '#1A2840',
  brandDeep: brand.blue700,
  danger: '#A8322B',
  dangerTint: '#FBEAE8',
  warning: '#8A5A00',
  overlay: 'rgba(22, 43, 82, 0.55)',
};

export type Palette = typeof palette;

export const highContrastPalette: Palette = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F0',
  text: '#000000',
  textMuted: '#1F1F1F',
  border: '#000000',
  primary: brand.blue800,
  primaryPressed: brand.blue900,
  primaryTint: brand.blue100,
  onPrimary: '#FFFFFF',
  accent: brand.lime800,
  accentPressed: '#3A541A',
  accentTint: '#E2F2CC',
  onAccent: '#FFFFFF',
  brandDeep: brand.blue900,
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

/**
 * Brand typefaces: Poppins for headings and buttons, Inter for body text. Each weight is
 * its own family (loaded in the root layout), so text styles set `fontFamily` instead of
 * `fontWeight` — Android ignores `fontWeight` on custom fonts.
 */
export const fonts = {
  headingBold: 'Poppins_700Bold',
  headingSemiBold: 'Poppins_600SemiBold',
  headingMedium: 'Poppins_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 36, fontFamily: fonts.headingBold },
  title: { fontSize: 22, lineHeight: 30, fontFamily: fonts.headingBold },
  heading: { fontSize: 18, lineHeight: 26, fontFamily: fonts.headingSemiBold },
  body: { fontSize: 16, lineHeight: 23, fontFamily: fonts.body },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontFamily: fonts.bodySemiBold },
  small: { fontSize: 14, lineHeight: 20, fontFamily: fonts.body },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.bodyMedium },
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
    shadowColor: brand.blue700,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 1 },
  default: {},
});
