import type { ChromaticTheme, SemanticColors } from '../types';

function semanticVars(semantic: SemanticColors): Record<string, string> {
  return {
    '--color-primary': semantic.primary,
    '--color-primary-hover': semantic.primaryHover,
    '--color-background': semantic.background,
    '--color-surface': semantic.surface,
    '--color-text': semantic.text,
    '--color-text-muted': semantic.textMuted,
    '--color-border': semantic.border,
    '--color-error': semantic.error,
    '--color-warning': semantic.warning,
    '--color-success': semantic.success,
  };
}

function varsToCSS(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
}

export function injectThemeCSS(theme: ChromaticTheme): void {
  const { colors, typography, spacing, shadows, borderRadius } = theme;

  const sharedVars: Record<string, string> = {
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
    '--font-sans': typography.fontFamily,
    '--font-mono': typography.monoFamily,
    '--font-size-base': `${typography.baseSize}px`,
    '--spacing-unit': `${spacing.baseUnit}px`,
    '--shadow-sm': `0px ${shadows.sm.offsetY} ${shadows.sm.blur} ${shadows.sm.spread} rgba(0,0,0,${shadows.sm.opacity})`,
    '--shadow-md': `0px ${shadows.md.offsetY} ${shadows.md.blur} ${shadows.md.spread} rgba(0,0,0,${shadows.md.opacity})`,
    '--shadow-lg': `0px ${shadows.lg.offsetY} ${shadows.lg.blur} ${shadows.lg.spread} rgba(0,0,0,${shadows.lg.opacity})`,
    '--shadow-xl': `0px ${shadows.xl.offsetY} ${shadows.xl.blur} ${shadows.xl.spread} rgba(0,0,0,${shadows.xl.opacity})`,
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

  styleEl.textContent = `
.chromatic-preview {
${varsToCSS({ ...sharedVars, ...semanticVars(colors.semanticLight) })}
}

.chromatic-preview[data-dark="true"] {
${varsToCSS(semanticVars(colors.semanticDark))}
}
`.trim();
}
