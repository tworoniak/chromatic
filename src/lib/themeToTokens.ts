import type { ChromaticTheme, TokenSet } from '../types';

export function themeToTokens(theme: ChromaticTheme): TokenSet {
  const { colors, typography, spacing, shadows, borderRadius } = theme;

  const spacingTokens: Record<string, { $value: string; $type: 'dimension' }> =
    {};
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
  steps.forEach((step) => {
    spacingTokens[String(step)] = {
      $value: `${step * spacing.baseUnit}px`,
      $type: 'dimension',
    };
  });

  // Modular type scale: base sits at index 2, each step multiplies by scaleRatio
  const sizeSteps = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
  const fontSizeTokens: Record<string, { $value: string; $type: 'fontSize' }> =
    {};
  sizeSteps.forEach((step, i) => {
    const size = typography.baseSize * Math.pow(typography.scaleRatio, i - 2);
    fontSizeTokens[step] = {
      $value: `${Math.round(size)}px`,
      $type: 'fontSize',
    };
  });

  return {
    color: {
      brand: Object.fromEntries(
        Object.entries(colors.brand).map(([k, v]) => [
          k,
          { $value: v, $type: 'color' },
        ]),
      ),
      accent: Object.fromEntries(
        Object.entries(colors.accent).map(([k, v]) => [
          k,
          { $value: v, $type: 'color' },
        ]),
      ),
      neutral: Object.fromEntries(
        Object.entries(colors.neutral).map(([k, v]) => [
          k,
          { $value: v, $type: 'color' },
        ]),
      ),
      light: Object.fromEntries(
        Object.entries(colors.semanticLight).map(([k, v]) => [
          k,
          { $value: v, $type: 'color' },
        ]),
      ),
      dark: Object.fromEntries(
        Object.entries(colors.semanticDark).map(([k, v]) => [
          k,
          { $value: v, $type: 'color' },
        ]),
      ),
    },
    spacing: spacingTokens,
    fontSize: fontSizeTokens,
    fontFamily: {
      sans: { $value: typography.fontFamily, $type: 'fontFamily' },
      mono: { $value: typography.monoFamily, $type: 'fontFamily' },
    },
    fontWeight: {
      normal: {
        $value: String(typography.weights.normal),
        $type: 'fontWeight',
      },
      medium: {
        $value: String(typography.weights.medium),
        $type: 'fontWeight',
      },
      semibold: {
        $value: String(typography.weights.semibold),
        $type: 'fontWeight',
      },
      bold: { $value: String(typography.weights.bold), $type: 'fontWeight' },
    },
    lineHeight: {
      tight: {
        $value: String(typography.lineHeights.tight),
        $type: 'lineHeight',
      },
      normal: {
        $value: String(typography.lineHeights.normal),
        $type: 'lineHeight',
      },
      loose: {
        $value: String(typography.lineHeights.loose),
        $type: 'lineHeight',
      },
    },
    borderRadius: {
      sm: { $value: `${borderRadius.sm}px`, $type: 'dimension' },
      md: { $value: `${borderRadius.md}px`, $type: 'dimension' },
      lg: { $value: `${borderRadius.lg}px`, $type: 'dimension' },
      xl: { $value: `${borderRadius.xl}px`, $type: 'dimension' },
      full: { $value: `${borderRadius.full}px`, $type: 'dimension' },
    },
    shadow: {
      sm: {
        $value: {
          offsetX: '0px',
          offsetY: shadows.sm.offsetY,
          blur: shadows.sm.blur,
          spread: shadows.sm.spread,
          color: `rgba(0,0,0,${shadows.sm.opacity})`,
        },
        $type: 'shadow',
      },
      md: {
        $value: {
          offsetX: '0px',
          offsetY: shadows.md.offsetY,
          blur: shadows.md.blur,
          spread: shadows.md.spread,
          color: `rgba(0,0,0,${shadows.md.opacity})`,
        },
        $type: 'shadow',
      },
      lg: {
        $value: {
          offsetX: '0px',
          offsetY: shadows.lg.offsetY,
          blur: shadows.lg.blur,
          spread: shadows.lg.spread,
          color: `rgba(0,0,0,${shadows.lg.opacity})`,
        },
        $type: 'shadow',
      },
      xl: {
        $value: {
          offsetX: '0px',
          offsetY: shadows.xl.offsetY,
          blur: shadows.xl.blur,
          spread: shadows.xl.spread,
          color: `rgba(0,0,0,${shadows.xl.opacity})`,
        },
        $type: 'shadow',
      },
    },
  } as unknown as TokenSet;
}
