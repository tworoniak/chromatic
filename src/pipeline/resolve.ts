import type { TokenSet, SingleToken, TokenGroup } from '../types';

const ALIAS_REGEX = /^\{(.+)\}$/;

export function isToken(value: unknown): value is SingleToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$value' in value &&
    '$type' in value
  );
}

export function getTokenByPath(
  tokens: TokenSet,
  path: string,
): SingleToken | null {
  const parts = path.split('.');
  let current: TokenSet | TokenGroup | SingleToken = tokens;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return null;
    current = (current as Record<string, unknown>)[part] as
      | TokenSet
      | TokenGroup
      | SingleToken;
  }

  return isToken(current) ? current : null;
}

export function resolveAlias(
  value: string,
  tokens: TokenSet,
  visited = new Set<string>(),
): { resolved: string; aliasCount: number } {
  const match = ALIAS_REGEX.exec(value);
  if (!match) return { resolved: value, aliasCount: 0 };

  const path = match[1];
  if (visited.has(path)) {
    throw new Error(`Circular alias detected: ${path}`);
  }

  const target = getTokenByPath(tokens, path);
  if (!target) {
    throw new Error(`Alias "{${path}}" could not be resolved`);
  }

  visited.add(path);
  const targetValue = String(target.$value);
  const nestedMatch = ALIAS_REGEX.exec(targetValue);

  if (nestedMatch) {
    const nested = resolveAlias(targetValue, tokens, visited);
    return { resolved: nested.resolved, aliasCount: nested.aliasCount + 1 };
  }

  return { resolved: targetValue, aliasCount: 1 };
}

export function flattenTokens(
  group: TokenSet | TokenGroup,
  prefix = '',
  tokens: TokenSet,
): Array<{
  path: string;
  token: SingleToken;
  resolvedValue: string;
  isAlias: boolean;
}> {
  const result: Array<{
    path: string;
    token: SingleToken;
    resolvedValue: string;
    isAlias: boolean;
  }> = [];

  for (const [key, value] of Object.entries(group)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isToken(value)) {
      const rawValue = String(value.$value);
      const isAlias = ALIAS_REGEX.test(rawValue);
      try {
        const { resolved } = isAlias
          ? resolveAlias(rawValue, tokens)
          : { resolved: rawValue };
        result.push({ path, token: value, resolvedValue: resolved, isAlias });
      } catch {
        result.push({ path, token: value, resolvedValue: rawValue, isAlias });
      }
    } else if (typeof value === 'object' && value !== null) {
      result.push(...flattenTokens(value as TokenGroup, path, tokens));
    }
  }

  return result;
}
