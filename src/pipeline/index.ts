import type { TokenSet, PipelineResult } from '../types';
import { flattenTokens } from './resolve';
import {
  generateCSS,
  generateSCSS,
  generateTypeScript,
  generateTailwind,
} from './generators';

export function runPipeline(input: string): PipelineResult {
  const errors: Array<{ path: string; message: string }> = [];

  let tokens: TokenSet;
  try {
    tokens = JSON.parse(input) as TokenSet;
  } catch (e) {
    return {
      output: null,
      errors: [
        { path: 'root', message: `Invalid JSON: ${(e as Error).message}` },
      ],
      tokenCount: 0,
      resolvedAliases: 0,
    };
  }

  const flat = flattenTokens(tokens, '', tokens);
  const tokenCount = flat.length;
  const resolvedAliases = flat.filter((t) => t.isAlias).length;

  let css = '';
  let scss = '';
  let typescript = '';
  let tailwind = '';

  try {
    css = generateCSS(tokens);
  } catch (e) {
    errors.push({ path: 'css', message: (e as Error).message });
  }

  try {
    scss = generateSCSS(tokens);
  } catch (e) {
    errors.push({ path: 'scss', message: (e as Error).message });
  }

  try {
    typescript = generateTypeScript(tokens);
  } catch (e) {
    errors.push({ path: 'typescript', message: (e as Error).message });
  }

  try {
    tailwind = generateTailwind(tokens);
  } catch (e) {
    errors.push({ path: 'tailwind', message: (e as Error).message });
  }

  return {
    output: { css, scss, typescript, tailwind },
    errors,
    tokenCount,
    resolvedAliases,
  };
}
