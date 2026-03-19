import type { ChromaticTheme, SemanticColors } from '../types';
import {
  getContrastRatio,
  getContrastColor,
  hexToHSL,
  hslToHex,
} from './colorUtils';

export type WCAGLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

export type FixTarget = 'foreground' | 'background';

export interface ContrastFix {
  target: FixTarget;
  originalHex: string;
  suggestedHex: string;
  newRatio: number;
  semanticKey: string;
}

export interface ContrastPair {
  id: string;
  label: string;
  context: string;
  foreground: string;
  background: string;
  ratio: number;
  level: WCAGLevel;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
}

// Which semantic key to adjust for each pair, and which direction
const FIX_MAP: Record<string, { target: FixTarget; semanticKey: string }> = {
  'text-bg': { target: 'foreground', semanticKey: 'text' },
  'text-surface': { target: 'foreground', semanticKey: 'text' },
  'muted-bg': { target: 'foreground', semanticKey: 'textMuted' },
  'muted-surface': { target: 'foreground', semanticKey: 'textMuted' },
  'primary-bg': { target: 'foreground', semanticKey: 'primary' },
  'primary-surface': { target: 'foreground', semanticKey: 'primary' },
  'white-primary': { target: 'background', semanticKey: 'primary' },
  'white-error': { target: 'background', semanticKey: 'error' },
  'dark-success': { target: 'background', semanticKey: 'success' },
  'dark-warning': { target: 'background', semanticKey: 'warning' },
  'text-accent': { target: 'background', semanticKey: 'accent' },
  'border-bg': { target: 'foreground', semanticKey: 'border' },
  'border-surface': { target: 'foreground', semanticKey: 'border' },
};

export function suggestFix(
  pair: ContrastPair,
  targetRatio = 4.5,
): ContrastFix | null {
  const fix = FIX_MAP[pair.id];
  if (!fix) return null;

  const colorToAdjust =
    fix.target === 'foreground' ? pair.foreground : pair.background;
  const otherColor =
    fix.target === 'foreground' ? pair.background : pair.foreground;

  const { h, s, l } = hexToHSL(colorToAdjust);

  // Determine which direction to push lightness
  const { l: otherL } = hexToHSL(otherColor);
  const shouldDarken =
    fix.target === 'foreground'
      ? otherL > 50 // dark text on light bg
      : otherL > 50; // dark bg so white has contrast

  const step = shouldDarken ? -1 : 1;
  let currentL = l;
  let suggested = colorToAdjust;
  let newRatio = pair.ratio;

  // Walk lightness until we hit target ratio or run out of range
  for (let i = 0; i < 100; i++) {
    currentL = Math.max(0, Math.min(100, currentL + step));
    const candidate = hslToHex(h, s, currentL);
    newRatio = getContrastRatio(
      fix.target === 'foreground' ? candidate : pair.foreground,
      fix.target === 'background' ? candidate : pair.background,
    );
    if (newRatio >= targetRatio) {
      suggested = candidate;
      break;
    }
  }

  if (suggested === colorToAdjust) return null;

  return {
    target: fix.target,
    originalHex: colorToAdjust,
    suggestedHex: suggested,
    newRatio,
    semanticKey: fix.semanticKey,
  };
}

function getLevel(ratio: number): WCAGLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'fail';
}

export function checkThemeContrast(
  theme: ChromaticTheme,
  semantic: SemanticColors,
): ContrastPair[] {
  const accent = theme.colors.accent['500'];
  const accentTextColor = getContrastColor(accent);
  console.log('accent:', accent, 'accentTextColor:', accentTextColor);

  const pairs: Array<{
    id: string;
    label: string;
    context: string;
    fg: string;
    bg: string;
  }> = [
    {
      id: 'text-bg',
      label: 'Text',
      context: 'on Background',
      fg: semantic.text,
      bg: semantic.background,
    },
    {
      id: 'text-surface',
      label: 'Text',
      context: 'on Surface',
      fg: semantic.text,
      bg: semantic.surface,
    },
    {
      id: 'muted-bg',
      label: 'Muted Text',
      context: 'on Background',
      fg: semantic.textMuted,
      bg: semantic.background,
    },
    {
      id: 'muted-surface',
      label: 'Muted Text',
      context: 'on Surface',
      fg: semantic.textMuted,
      bg: semantic.surface,
    },
    {
      id: 'primary-bg',
      label: 'Primary',
      context: 'on Background',
      fg: semantic.primary,
      bg: semantic.background,
    },
    {
      id: 'primary-surface',
      label: 'Primary',
      context: 'on Surface',
      fg: semantic.primary,
      bg: semantic.surface,
    },
    {
      id: 'white-primary',
      label: 'White',
      context: 'on Primary btn',
      fg: '#ffffff',
      bg: semantic.primary,
    },
    {
      id: 'white-error',
      label: 'White',
      context: 'on Error',
      fg: '#ffffff',
      bg: semantic.error,
    },
    {
      id: 'dark-success',
      label: 'Dark Text',
      context: 'on Success',
      fg: '#18181b',
      bg: semantic.success,
    },
    {
      id: 'dark-warning',
      label: 'Dark Text',
      context: 'on Warning',
      fg: '#18181b',
      bg: semantic.warning,
    },
    {
      id: 'text-accent',
      label: accentTextColor === '#ffffff' ? 'White' : 'Dark Text',
      context: 'on Accent btn',
      fg: accentTextColor,
      bg: accent,
    },
    {
      id: 'border-bg',
      label: 'Border',
      context: 'on Background',
      fg: semantic.border,
      bg: semantic.background,
    },
    {
      id: 'border-surface',
      label: 'Border',
      context: 'on Surface',
      fg: semantic.border,
      bg: semantic.surface,
    },
  ];

  return pairs.map(({ id, label, context, fg, bg }) => {
    const ratio = getContrastRatio(fg, bg);
    return {
      id,
      label,
      context,
      foreground: fg,
      background: bg,
      ratio,
      level: getLevel(ratio),
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
      passesAALarge: ratio >= 3,
    };
  });
}

export function getContrastSummary(pairs: ContrastPair[]) {
  const passAA = pairs.filter((p) => p.passesAA).length;
  const passAAA = pairs.filter((p) => p.passesAAA).length;
  const failCount = pairs.filter((p) => !p.passesAALarge).length;
  return { passAA, passAAA, failCount, total: pairs.length };
}
