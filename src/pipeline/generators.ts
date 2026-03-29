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
  const lines: string[] = [];

  for (const { path, token, resolvedValue } of flat) {
    const value = transformValue(token, resolvedValue);
    const parts = path.split('.');
    let varName: string | null = null;

    switch (token.$type) {
      case 'color':
        // color.brand.500 → --color-brand-500
        varName = `--color-${parts.slice(1).join('-')}`;
        break;
      case 'fontFamily':
        // fontFamily.sans → --font-sans
        varName = `--font-${parts[1]}`;
        break;
      case 'fontSize':
        // fontSize.base → --text-base
        varName = `--text-${parts[1]}`;
        break;
      case 'fontWeight':
        // fontWeight.normal → --font-weight-normal
        varName = `--font-weight-${parts[1]}`;
        break;
      case 'lineHeight':
        // lineHeight.tight → --leading-tight
        varName = `--leading-${parts[1]}`;
        break;
      case 'dimension':
        if (parts[0] === 'spacing') {
          // spacing.4 → --spacing-4
          varName = `--spacing-${parts[1]}`;
        } else if (parts[0] === 'borderRadius') {
          // borderRadius.md → --radius-md
          varName = `--radius-${parts[1]}`;
        }
        break;
      case 'shadow':
        // shadow.sm → --shadow-sm
        varName = `--shadow-${parts[1]}`;
        break;
    }

    if (varName !== null) {
      lines.push(`  ${varName}: ${value};`);
    }
  }

  return `@import "tailwindcss";\n\n@theme {\n${lines.join('\n')}\n}`;
}
