import type { TokenSet } from '../types';
import { flattenTokens } from './resolve';
import {
  transformValue,
  pathToCSSVar,
  pathToJSKey,
  pathToSCSSVar,
} from './transform';

export function generateCSS(tokens: TokenSet): string {
  const flat = flattenTokens(tokens, '', tokens);
  const lines = flat.map(({ path, token, resolvedValue }) => {
    const value = transformValue(token, resolvedValue);
    return `  ${pathToCSSVar(path)}: ${value};`;
  });

  return `:root {\n${lines.join('\n')}\n}`;
}

export function generateSCSS(tokens: TokenSet): string {
  const flat = flattenTokens(tokens, '', tokens);
  const lines = flat.map(({ path, token, resolvedValue }) => {
    const value = transformValue(token, resolvedValue);
    return `${pathToSCSSVar(path)}: ${value};`;
  });

  return lines.join('\n');
}

export function generateTypeScript(tokens: TokenSet): string {
  const flat = flattenTokens(tokens, '', tokens);

  const entries = flat.map(({ path, token, resolvedValue }) => {
    const key = pathToJSKey(path);
    const value = transformValue(token, resolvedValue);
    const comment = token.$description
      ? `  /** ${token.$description} */\n`
      : '';
    return `${comment}  ${key}: '${value}',`;
  });

  return `export const tokens = {\n${entries.join('\n')}\n} as const\n\nexport type TokenKey = keyof typeof tokens`;
}

export function generateTailwind(tokens: TokenSet): string {
  const flat = flattenTokens(tokens, '', tokens);

  const colors: Record<string, string> = {};
  const spacing: Record<string, string> = {};
  const fontSize: Record<string, string> = {};
  const fontFamily: Record<string, string> = {};
  const fontWeight: Record<string, string> = {};
  const lineHeight: Record<string, string> = {};
  const borderRadius: Record<string, string> = {};
  const boxShadow: Record<string, string> = {};
  const transitionDuration: Record<string, string> = {};

  for (const { path, token, resolvedValue } of flat) {
    const value = transformValue(token, resolvedValue);
    const parts = path.split('.');
    const key = parts.slice(1).join('.');

    switch (token.$type) {
      case 'color':
        colors[key] = value;
        break;
      case 'dimension':
        if (parts[0] === 'spacing') spacing[parts[1]] = value;
        if (parts[0] === 'borderRadius') borderRadius[parts[1]] = value;
        break;
      case 'fontSize':
        fontSize[parts[1] ?? parts[0]] = value;
        break;
      case 'fontFamily':
        fontFamily[parts[1] ?? parts[0]] = value;
        break;
      case 'fontWeight':
        fontWeight[parts[1] ?? parts[0]] = value;
        break;
      case 'lineHeight':
        lineHeight[parts[1] ?? parts[0]] = value;
        break;
      case 'shadow':
        boxShadow[parts[1] ?? parts[0]] = value;
        break;
      case 'duration':
        transitionDuration[parts[1] ?? parts[0]] = value;
        break;
    }
  }

  const config = {
    theme: {
      extend: {
        colors,
        spacing,
        fontSize,
        fontFamily,
        fontWeight,
        lineHeight,
        borderRadius,
        boxShadow,
        transitionDuration,
      },
    },
  };

  return `import type { Config } from 'tailwindcss'\n\nconst config: Config = ${JSON.stringify(config, null, 2)}\n\nexport default config`;
}
