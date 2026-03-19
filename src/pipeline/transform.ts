import type { SingleToken, ShadowValue, BorderValue } from '../types';

function pxToRem(px: string): string {
  const num = parseFloat(px);
  if (isNaN(num)) return px;
  return `${(num / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
}

function transformShadow(value: ShadowValue): string {
  return `${value.offsetX} ${value.offsetY} ${value.blur} ${value.spread} ${value.color}`;
}

export function transformValue(
  token: SingleToken,
  resolvedValue: string,
): string {
  switch (token.$type) {
    case 'dimension':
    case 'fontSize':
    case 'letterSpacing':
      return pxToRem(resolvedValue);

    case 'shadow': {
      const v = token.$value as ShadowValue;
      return transformShadow(v);
    }

    case 'typography': {
      // Typography is composite — handled separately
      return resolvedValue;
    }

    case 'border': {
      const v = token.$value as BorderValue;
      return `${v.width} ${v.style} ${v.color}`;
    }

    case 'fontFamily':
      return resolvedValue;

    case 'duration':
      return resolvedValue;

    default:
      return resolvedValue;
  }
}

export function pathToCSSVar(path: string): string {
  return `--${path.replace(/\./g, '-')}`;
}

export function pathToJSKey(path: string): string {
  return path
    .split('.')
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('');
}

export function pathToSCSSVar(path: string): string {
  return `$${path.replace(/\./g, '-')}`;
}
