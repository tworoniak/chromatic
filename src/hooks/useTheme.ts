import { useCallback, useEffect, useReducer, useState } from 'react';
import type {
  ChromaticTheme,
  ThemeHistory,
  SavedTheme,
  HarmonyType,
} from '../types';
import { defaultTheme } from '../lib/defaultTheme';
import {
  generateScale,
  generateNeutral,
  generateHarmony,
  deriveSemanticColors,
} from '../lib/colorUtils';
import { injectThemeCSS } from '../lib/themeToCSS';

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_BRAND_COLOR'; hex: string }
  | { type: 'SET_HARMONY'; harmonyType: HarmonyType }
  | { type: 'SET_DARK_MODE'; darkMode: boolean }
  | { type: 'SET_FONT_FAMILY'; fontFamily: string }
  | { type: 'SET_MONO_FAMILY'; monoFamily: string }
  | { type: 'SET_BASE_SIZE'; baseSize: number }
  | { type: 'SET_SPACING_UNIT'; baseUnit: number }
  | {
      type: 'SET_SHADOW';
      level: 'sm' | 'md' | 'lg' | 'xl';
      field: 'offsetY' | 'blur' | 'spread' | 'opacity';
      value: string | number;
    }
  | {
      type: 'SET_RADIUS';
      key: 'sm' | 'md' | 'lg' | 'xl' | 'full';
      value: number;
    }
  | { type: 'SET_SCALE_RATIO'; scaleRatio: number }
  | { type: 'SET_WEIGHT'; key: 'normal' | 'medium' | 'semibold' | 'bold'; value: number }
  | { type: 'SET_LINE_HEIGHT'; key: 'tight' | 'normal' | 'loose'; value: number }
  | { type: 'SET_THEME'; theme: ChromaticTheme }
  | {
      type: 'SET_SEMANTIC_COLOR';
      key: string;
      hex: string;
      mode: 'light' | 'dark';
    }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const MAX_HISTORY = 50;

// ─── Pure theme updater ─────────────────────────────────────────────────────

function applyAction(theme: ChromaticTheme, action: Action): ChromaticTheme {
  switch (action.type) {
    case 'SET_BRAND_COLOR': {
      const brandScale = generateScale(action.hex);
      const neutralScale = generateNeutral(action.hex);
      const { accent: accentHex } = generateHarmony(
        action.hex,
        theme.harmonyType,
      );
      const accentScale = generateScale(accentHex);
      return {
        ...theme,
        brandColor: action.hex,
        colors: {
          brand: brandScale,
          accent: accentScale,
          neutral: neutralScale,
          semanticLight: deriveSemanticColors(brandScale, neutralScale, false),
          semanticDark: deriveSemanticColors(brandScale, neutralScale, true),
        },
      };
    }

    case 'SET_HARMONY': {
      const { accent: accentHex } = generateHarmony(
        theme.brandColor,
        action.harmonyType,
      );
      const accentScale = generateScale(accentHex);
      return {
        ...theme,
        harmonyType: action.harmonyType,
        colors: { ...theme.colors, accent: accentScale },
      };
    }

    case 'SET_DARK_MODE':
      return { ...theme, darkMode: action.darkMode };

    case 'SET_FONT_FAMILY':
      return {
        ...theme,
        typography: { ...theme.typography, fontFamily: action.fontFamily },
      };

    case 'SET_MONO_FAMILY':
      return {
        ...theme,
        typography: { ...theme.typography, monoFamily: action.monoFamily },
      };

    case 'SET_BASE_SIZE':
      return {
        ...theme,
        typography: { ...theme.typography, baseSize: action.baseSize },
      };

    case 'SET_SCALE_RATIO':
      return {
        ...theme,
        typography: { ...theme.typography, scaleRatio: action.scaleRatio },
      };

    case 'SET_WEIGHT':
      return {
        ...theme,
        typography: {
          ...theme.typography,
          weights: { ...theme.typography.weights, [action.key]: action.value },
        },
      };

    case 'SET_LINE_HEIGHT':
      return {
        ...theme,
        typography: {
          ...theme.typography,
          lineHeights: {
            ...theme.typography.lineHeights,
            [action.key]: action.value,
          },
        },
      };

    case 'SET_SPACING_UNIT':
      return { ...theme, spacing: { baseUnit: action.baseUnit } };

    case 'SET_SHADOW':
      return {
        ...theme,
        shadows: {
          ...theme.shadows,
          [action.level]: {
            ...theme.shadows[action.level],
            [action.field]: action.value,
          },
        },
      };

    case 'SET_RADIUS':
      return {
        ...theme,
        borderRadius: { ...theme.borderRadius, [action.key]: action.value },
      };

    case 'SET_THEME':
      return action.theme;

    case 'SET_SEMANTIC_COLOR': {
      const setKey = action.mode === 'light' ? 'semanticLight' : 'semanticDark';
      return {
        ...theme,
        colors: {
          ...theme.colors,
          [setKey]: {
            ...theme.colors[setKey],
            [action.key]: action.hex,
          },
        },
      };
    }

    default:
      return theme;
  }
}

// ─── History reducer ────────────────────────────────────────────────────────

function historyReducer(history: ThemeHistory, action: Action): ThemeHistory {
  if (action.type === 'UNDO') {
    if (history.past.length === 0) return history;
    const previous = history.past[history.past.length - 1];
    return {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future],
    };
  }

  if (action.type === 'REDO') {
    if (history.future.length === 0) return history;
    const next = history.future[0];
    return {
      past: [...history.past, history.present],
      present: next,
      future: history.future.slice(1),
    };
  }

  const next = applyAction(history.present, action);
  if (next === history.present) return history;

  return {
    past: [...history.past.slice(-MAX_HISTORY), history.present],
    present: next,
    future: [],
  };
}

const STORAGE_KEY = 'chromatic-saved-themes';
const ACTIVE_THEME_KEY = 'chromatic-active-theme';

function loadSavedThemes(): SavedTheme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedTheme[]) : [];
  } catch {
    return [];
  }
}

function persistSavedThemes(themes: SavedTheme[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {
    // localStorage unavailable
  }
}

function loadActiveTheme(): ChromaticTheme {
  try {
    const raw = localStorage.getItem(ACTIVE_THEME_KEY);
    return raw ? (JSON.parse(raw) as ChromaticTheme) : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useTheme() {
  const [history, dispatch] = useReducer(historyReducer, undefined, () => ({
    past: [],
    present: loadActiveTheme(),
    future: [],
  }));

  const theme = history.present;

  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(loadSavedThemes);

  // Inject CSS whenever theme changes
  useEffect(() => {
    injectThemeCSS(theme);
  }, [theme]);

  // Persist active (unsaved) theme across page refreshes
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_THEME_KEY, JSON.stringify(theme));
    } catch {
      // localStorage unavailable
    }
  }, [theme]);

  // Actions
  const setBrandColor = useCallback(
    (hex: string) => dispatch({ type: 'SET_BRAND_COLOR', hex }),
    [],
  );

  const setHarmony = useCallback(
    (harmonyType: HarmonyType) =>
      dispatch({ type: 'SET_HARMONY', harmonyType }),
    [],
  );

  const setDarkMode = useCallback(
    (darkMode: boolean) => dispatch({ type: 'SET_DARK_MODE', darkMode }),
    [],
  );

  const setFontFamily = useCallback(
    (fontFamily: string) => dispatch({ type: 'SET_FONT_FAMILY', fontFamily }),
    [],
  );

  const setMonoFamily = useCallback(
    (monoFamily: string) => dispatch({ type: 'SET_MONO_FAMILY', monoFamily }),
    [],
  );

  const setBaseSize = useCallback(
    (baseSize: number) => dispatch({ type: 'SET_BASE_SIZE', baseSize }),
    [],
  );

  const setScaleRatio = useCallback(
    (scaleRatio: number) => dispatch({ type: 'SET_SCALE_RATIO', scaleRatio }),
    [],
  );

  const setWeight = useCallback(
    (key: 'normal' | 'medium' | 'semibold' | 'bold', value: number) =>
      dispatch({ type: 'SET_WEIGHT', key, value }),
    [],
  );

  const setLineHeight = useCallback(
    (key: 'tight' | 'normal' | 'loose', value: number) =>
      dispatch({ type: 'SET_LINE_HEIGHT', key, value }),
    [],
  );

  const setSpacingUnit = useCallback(
    (baseUnit: number) => dispatch({ type: 'SET_SPACING_UNIT', baseUnit }),
    [],
  );

  const setShadow = useCallback(
    (
      level: 'sm' | 'md' | 'lg' | 'xl',
      field: 'offsetY' | 'blur' | 'spread' | 'opacity',
      value: string | number,
    ) => dispatch({ type: 'SET_SHADOW', level, field, value }),
    [],
  );

  const setRadius = useCallback(
    (key: 'sm' | 'md' | 'lg' | 'xl' | 'full', value: number) =>
      dispatch({ type: 'SET_RADIUS', key, value }),
    [],
  );

  const setSemanticColor = useCallback(
    (key: string, hex: string, mode: 'light' | 'dark') =>
      dispatch({ type: 'SET_SEMANTIC_COLOR', key, hex, mode }),
    [],
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Save / load
  const saveTheme = useCallback(
    (name: string) => {
      const entry: SavedTheme = {
        id: crypto.randomUUID(),
        name,
        theme: { ...theme, name },
        savedAt: Date.now(),
      };
      setSavedThemes((prev) => {
        const next = [entry, ...prev];
        persistSavedThemes(next);
        return next;
      });
      return entry;
    },
    [theme],
  );

  const loadTheme = useCallback((saved: SavedTheme) => {
    dispatch({ type: 'SET_THEME', theme: saved.theme });
  }, []);

  const importTheme = useCallback((imported: ChromaticTheme) => {
    dispatch({ type: 'SET_THEME', theme: imported });
  }, []);

  const resetTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', theme: defaultTheme });
  }, []);

  const deleteSavedTheme = useCallback((id: string) => {
    setSavedThemes((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persistSavedThemes(next);
      return next;
    });
  }, []);

  return {
    theme,
    setBrandColor,
    setHarmony,
    setDarkMode,
    setFontFamily,
    setMonoFamily,
    setBaseSize,
    setScaleRatio,
    setWeight,
    setLineHeight,
    setSpacingUnit,
    setShadow,
    setRadius,
    setSemanticColor,
    undo,
    redo,
    canUndo,
    canRedo,
    saveTheme,
    loadTheme,
    importTheme,
    resetTheme,
    savedThemes,
    deleteSavedTheme,
  };
}
