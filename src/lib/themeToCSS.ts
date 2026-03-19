import type { ChromaticTheme } from '../types';

export function injectThemeCSS(theme: ChromaticTheme): void {
  const { colors, typography, spacing, shadows, borderRadius } = theme;

  const vars: Record<string, string> = {
    // Semantic colors
    '--color-primary': colors.semantic.primary,
    '--color-primary-hover': colors.semantic.primaryHover,
    '--color-background': colors.semantic.background,
    '--color-surface': colors.semantic.surface,
    '--color-text': colors.semantic.text,
    '--color-text-muted': colors.semantic.textMuted,
    '--color-border': colors.semantic.border,
    '--color-error': colors.semantic.error,
    '--color-warning': colors.semantic.warning,
    '--color-success': colors.semantic.success,

    // Brand scale
    ...Object.fromEntries(
      Object.entries(colors.brand).map(([k, v]) => [`--color-brand-${k}`, v]),
    ),
    ...Object.fromEntries(
      Object.entries(colors.accent).map(([k, v]) => [`--color-accent-${k}`, v]),
    ),
    ...Object.fromEntries(
      Object.entries(colors.neutral).map(([k, v]) => [
        `--color-neutral-${k}`,
        v,
      ]),
    ),

    // Typography
    '--font-sans': typography.fontFamily,
    '--font-mono': typography.monoFamily,
    '--font-size-base': `${typography.baseSize}px`,

    // Spacing
    '--spacing-unit': `${spacing.baseUnit}px`,

    // Shadows
    '--shadow-sm': `0px ${shadows.sm.offsetY} ${shadows.sm.blur} ${shadows.sm.spread} rgba(0,0,0,${shadows.sm.opacity})`,
    '--shadow-md': `0px ${shadows.md.offsetY} ${shadows.md.blur} ${shadows.md.spread} rgba(0,0,0,${shadows.md.opacity})`,
    '--shadow-lg': `0px ${shadows.lg.offsetY} ${shadows.lg.blur} ${shadows.lg.spread} rgba(0,0,0,${shadows.lg.opacity})`,
    '--shadow-xl': `0px ${shadows.xl.offsetY} ${shadows.xl.blur} ${shadows.xl.spread} rgba(0,0,0,${shadows.xl.opacity})`,

    // Border radius
    '--radius-sm': `${borderRadius.sm}px`,
    '--radius-md': `${borderRadius.md}px`,
    '--radius-lg': `${borderRadius.lg}px`,
    '--radius-xl': `${borderRadius.xl}px`,
    '--radius-full': `${borderRadius.full}px`,
  };

  let styleEl = document.getElementById('chromatic-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'chromatic-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `.chromatic-preview {\n${Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}`;
}
