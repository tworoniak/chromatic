// ─── Pipeline types (copied from design-token-pipeline) ───────────────────
export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'lineHeight'
  | 'letterSpacing'
  | 'duration'
  | 'cubicBezier'
  | 'shadow'
  | 'typography'
  | 'border';

export interface SingleToken {
  $value: string | number | ShadowValue | TypographyValue | BorderValue;
  $type: TokenType;
  $description?: string;
}

export interface ShadowValue {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
}

export interface TypographyValue {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string | number;
  letterSpacing?: string;
}

export interface BorderValue {
  width: string;
  style: string;
  color: string;
}

export type TokenGroup = {
  [key: string]: SingleToken | TokenGroup;
};

export type TokenSet = {
  [groupName: string]: TokenGroup;
};

export type OutputFormat = 'css' | 'tailwind' | 'typescript' | 'scss';

export interface PipelineOutput {
  css: string;
  tailwind: string;
  typescript: string;
  scss: string;
}

export interface TransformError {
  path: string;
  message: string;
}

export interface PipelineResult {
  output: PipelineOutput | null;
  errors: TransformError[];
  tokenCount: number;
  resolvedAliases: number;
}

// ─── Chromatic theme types ─────────────────────────────────────────────────

export type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary';

export interface ColorScale {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
  '800': string;
  '900': string;
}
export interface SemanticColors {
  primary: string;
  primaryHover: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
}

export interface ThemeColors {
  brand: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  semanticLight: SemanticColors;
  semanticDark: SemanticColors;
}

export interface ShadowLevel {
  offsetY: string;
  blur: string;
  spread: string;
  opacity: number;
}

export interface ThemeShadows {
  sm: ShadowLevel;
  md: ShadowLevel;
  lg: ShadowLevel;
  xl: ShadowLevel;
}

export interface ThemeTypography {
  fontFamily: string;
  monoFamily: string;
  baseSize: number;
  scaleRatio: number;
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    loose: number;
  };
}

export interface ThemeSpacing {
  baseUnit: number;
}

export interface ThemeBorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ChromaticTheme {
  name: string;
  brandColor: string;
  harmonyType: HarmonyType;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
  darkMode: boolean;
}

export interface SavedTheme {
  id: string;
  name: string;
  theme: ChromaticTheme;
  savedAt: number;
}

export interface ThemeHistory {
  past: ChromaticTheme[];
  present: ChromaticTheme;
  future: ChromaticTheme[];
}
