import type { ChromaticTheme } from '../types';
import {
  generateScale,
  generateNeutral,
  generateHarmony,
  deriveSemanticColors,
} from './colorUtils';

const brandHex = '#6366f1';
const brandScale = generateScale(brandHex);
const neutralScale = generateNeutral(brandHex);
const { accent: accentHex } = generateHarmony(brandHex, 'complementary');
const accentScale = generateScale(accentHex);

export const defaultTheme: ChromaticTheme = {
  name: 'Default',
  brandColor: brandHex,
  harmonyType: 'complementary',
  colors: {
    brand: brandScale,
    accent: accentScale,
    neutral: neutralScale,
    semanticLight: deriveSemanticColors(brandScale, neutralScale, false),
    semanticDark: deriveSemanticColors(brandScale, neutralScale, true),
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    monoFamily: 'JetBrains Mono, monospace',
    baseSize: 16,
    scaleRatio: 1.25,
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeights: { tight: 1.25, normal: 1.5, loose: 1.75 },
  },
  spacing: { baseUnit: 4 },
  shadows: {
    sm: { offsetY: '1px', blur: '2px', spread: '0px', opacity: 0.05 },
    md: { offsetY: '4px', blur: '6px', spread: '-1px', opacity: 0.1 },
    lg: { offsetY: '10px', blur: '15px', spread: '-3px', opacity: 0.1 },
    xl: { offsetY: '20px', blur: '25px', spread: '-5px', opacity: 0.15 },
  },
  borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  darkMode: false,
};
