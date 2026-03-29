import type { ChromaticTheme } from '../types';
import { themeToTokens } from './themeToTokens';
import { flattenTokens } from '../pipeline/resolve';
import { transformValue, pathToCSSVar } from '../pipeline/transform';

export function injectThemeCSS(theme: ChromaticTheme): void {
  const tokens = themeToTokens(theme);
  const flat = flattenTokens(tokens, '', tokens);

  const vars = flat
    .map(({ path, token, resolvedValue }) => {
      const value = transformValue(token, resolvedValue);
      return `  ${pathToCSSVar(path)}: ${value};`;
    })
    .join('\n');

  let styleEl = document.getElementById('chromatic-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'chromatic-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `.chromatic-preview {\n${vars}\n}`;
}
