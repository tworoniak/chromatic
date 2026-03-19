import type { ColorScale, HarmonyType } from '../types';
import type { SemanticColors } from '../types';

// ─── HSL utilities ─────────────────────────────────────────────────────────

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / delta + 2) / 6;
    else h = ((r - g) / delta + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

// ─── Scale generation ───────────────────────────────────────────────────────

export function generateScale(hex: string): ColorScale {
  const { h, s } = hexToHSL(hex);

  // Lightness stops from 95 (50) down to 10 (900)
  const lightnessStops = [95, 90, 80, 68, 55, 42, 32, 24, 16, 10];
  // Saturation modifier — desaturate slightly at extremes
  const saturationMods = [0.3, 0.5, 0.7, 0.85, 0.95, 1, 1, 0.95, 0.9, 0.85];

  const [c50, c100, c200, c300, c400, c500, c600, c700, c800, c900] =
    lightnessStops.map((l, i) => hslToHex(h, s * saturationMods[i], l));

  return {
    '50': c50,
    '100': c100,
    '200': c200,
    '300': c300,
    '400': c400,
    '500': c500,
    '600': c600,
    '700': c700,
    '800': c800,
    '900': c900,
  };
}

// ─── Harmony generation ─────────────────────────────────────────────────────

export function generateHarmony(
  hex: string,
  type: HarmonyType,
): { accent: string; second?: string } {
  const { h, s, l } = hexToHSL(hex);

  switch (type) {
    case 'complementary':
      return { accent: hslToHex(h + 180, s, l) };
    case 'analogous':
      return { accent: hslToHex(h + 30, s, l), second: hslToHex(h - 30, s, l) };
    case 'triadic':
      return {
        accent: hslToHex(h + 120, s, l),
        second: hslToHex(h + 240, s, l),
      };
    case 'split-complementary':
      return {
        accent: hslToHex(h + 150, s, l),
        second: hslToHex(h + 210, s, l),
      };
  }
}

// ─── Neutral generation ─────────────────────────────────────────────────────

export function generateNeutral(hex: string): ColorScale {
  const { h } = hexToHSL(hex);
  // Slightly tinted neutral — 4% saturation gives warmth/coolness
  return generateScale(hslToHex(h, 4, 50));
}

// ─── Contrast checker ──────────────────────────────────────────────────────

export function getContrastColor(hex: string): '#ffffff' | '#18181b' {
  const luminance = getLuminance(hex);
  return luminance > 0.179 ? '#18181b' : '#ffffff';
}

// ─── Semantic derivation ───────────────────────────────────────────────────

export function deriveSemanticColors(
  brand: ColorScale,
  neutral: ColorScale,
  darkMode: boolean,
): SemanticColors {
  if (darkMode) {
    return {
      primary: brand['400'],
      primaryHover: brand['300'],
      background: neutral['900'],
      surface: neutral['800'],
      text: neutral['50'],
      textMuted: neutral['400'],
      border: neutral['700'],
      error: '#f87171',
      warning: '#fbbf24',
      success: '#4ade80',
    };
  }
  return {
    primary: brand['500'],
    primaryHover: brand['600'],
    background: neutral['50'],
    surface: '#ffffff',
    text: neutral['900'],
    textMuted: neutral['500'],
    border: neutral['200'],
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
  };
}

export function getLuminance(hex: string): number {
  if (!hex.startsWith('#') || hex.length < 7) return 0;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const linearize = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
}
