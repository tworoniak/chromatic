import { useMemo, useState } from 'react';
import type { ChromaticTheme } from '../../types';
import {
  checkThemeContrast,
  getContrastSummary,
  suggestFix,
} from '../../lib/contrastUtils';
import type { ContrastPair } from '../../lib/contrastUtils';

interface Props {
  theme: ChromaticTheme;
  onFix: (semanticKey: string, hex: string, mode: 'light' | 'dark') => void;
}

const levelStyles: Record<string, { badge: string; label: string }> = {
  AAA: {
    badge: 'bg-emerald-950 border-emerald-700 text-emerald-400',
    label: 'AAA',
  },
  AA: { badge: 'bg-blue-950 border-blue-700 text-blue-400', label: 'AA' },
  'AA-large': {
    badge: 'bg-yellow-950 border-yellow-700 text-yellow-400',
    label: 'AA+',
  },
  fail: { badge: 'bg-red-950 border-red-700 text-red-400', label: 'Fail' },
};

function ContrastPairRow({
  pair,
  onFix,
  mode,
}: {
  pair: ContrastPair;
  onFix: (semanticKey: string, hex: string, mode: 'light' | 'dark') => void;
  mode: 'light' | 'dark';
}) {
  const [showFix, setShowFix] = useState(false);
  const fix = useMemo(() => suggestFix(pair), [pair]);
  const style = levelStyles[pair.level];

  return (
    <div className='flex flex-col border-b border-zinc-800/60 last:border-0 py-2 gap-2'>
      <div className='flex items-center gap-3'>
        {/* Swatch */}
        <div
          className='w-10 h-10 rounded-lg border border-zinc-700 shrink-0 flex items-center justify-center text-xs font-bold'
          style={{ backgroundColor: pair.background, color: pair.foreground }}
        >
          Aa
        </div>

        {/* Label */}
        <div className='flex-1 min-w-0 flex flex-col gap-0.5'>
          <div className='flex items-center gap-1.5'>
            <span className='text-xs font-semibold text-zinc-300'>
              {pair.label}
            </span>
            <span className='text-[10px] text-zinc-500'>{pair.context}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-[9px] font-mono text-zinc-600'>
              {pair.foreground}
            </span>
            <span className='text-zinc-700'>→</span>
            <span className='text-[9px] font-mono text-zinc-600'>
              {pair.background}
            </span>
          </div>
        </div>

        {/* Ratio + badge */}
        <div className='flex items-center gap-2 shrink-0'>
          <span className='text-xs font-mono text-zinc-400 tabular-nums'>
            {pair.ratio.toFixed(1)}:1
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.badge}`}
          >
            {style.label}
          </span>
          {!pair.passesAA && fix && (
            <button
              onClick={() => setShowFix((v) => !v)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-all cursor-pointer
                ${
                  showFix
                    ? 'bg-amber-950 border-amber-600 text-amber-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
            >
              Fix
            </button>
          )}
        </div>
      </div>

      {/* Fix suggestion */}
      {showFix && fix && (
        <div className='ml-13 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-900 border border-amber-800/50'>
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <div className='flex flex-col items-center gap-1 shrink-0'>
              <div
                className='w-6 h-6 rounded border border-zinc-700'
                style={{ backgroundColor: fix.originalHex }}
              />
              <span className='text-[8px] font-mono text-zinc-600'>before</span>
            </div>
            <span className='text-zinc-600 text-xs'>→</span>
            <div className='flex flex-col items-center gap-1 shrink-0'>
              <div
                className='w-6 h-6 rounded border border-zinc-700'
                style={{ backgroundColor: fix.suggestedHex }}
              />
              <span className='text-[8px] font-mono text-zinc-600'>after</span>
            </div>
            <div className='flex flex-col gap-0.5 min-w-0 ml-1'>
              <span className='text-[10px] font-mono text-amber-400'>
                {fix.suggestedHex}
              </span>
              <span className='text-[9px] text-zinc-500'>
                {fix.semanticKey} · new ratio {fix.newRatio.toFixed(1)}:1
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              onFix(fix.semanticKey, fix.suggestedHex, mode);
              setShowFix(false);
            }}
            className='px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-semibold rounded-lg transition-all cursor-pointer shrink-0'
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export function ContrastChecker({ theme, onFix }: Props) {
  const [checkMode, setCheckMode] = useState<'light' | 'dark'>('light');
  const semanticToCheck =
    checkMode === 'light'
      ? theme.colors.semanticLight
      : theme.colors.semanticDark;

  const pairs = useMemo(
    () => checkThemeContrast(theme, semanticToCheck),
    [theme, semanticToCheck],
  );
  const summary = useMemo(() => getContrastSummary(pairs), [pairs]);

  const failing = pairs.filter((p) => !p.passesAALarge);
  const passing = pairs.filter((p) => p.passesAALarge);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800'>
        {(['light', 'dark'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setCheckMode(mode)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer
        ${
          checkMode === mode
            ? 'bg-zinc-700 text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
          >
            {mode === 'light' ? '☀ Light' : '☾ Dark'}
          </button>
        ))}
      </div>
      {/* Summary */}
      <div className='grid grid-cols-3 gap-2'>
        <div className='flex flex-col items-center gap-1 p-3 rounded-lg bg-zinc-900 border border-zinc-800'>
          <span
            className={`text-lg font-bold tabular-nums ${summary.failCount === 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {summary.failCount}
          </span>
          <span className='text-[10px] text-zinc-500 text-center'>Failing</span>
        </div>
        <div className='flex flex-col items-center gap-1 p-3 rounded-lg bg-zinc-900 border border-zinc-800'>
          <span className='text-lg font-bold tabular-nums text-blue-400'>
            {summary.passAA}
          </span>
          <span className='text-[10px] text-zinc-500 text-center'>Pass AA</span>
        </div>
        <div className='flex flex-col items-center gap-1 p-3 rounded-lg bg-zinc-900 border border-zinc-800'>
          <span className='text-lg font-bold tabular-nums text-emerald-400'>
            {summary.passAAA}
          </span>
          <span className='text-[10px] text-zinc-500 text-center'>
            Pass AAA
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className='flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800'>
        {Object.entries(levelStyles).map(([key, val]) => (
          <div key={key} className='flex items-center gap-1.5'>
            <span
              className={`text-[9px] font-bold px-1 py-0.5 rounded border ${val.badge}`}
            >
              {val.label}
            </span>
            <span className='text-[9px] text-zinc-600'>
              {key === 'AAA'
                ? '≥7:1'
                : key === 'AA'
                  ? '≥4.5:1'
                  : key === 'AA-large'
                    ? '≥3:1'
                    : '<3:1'}
            </span>
          </div>
        ))}
      </div>

      {/* Failing */}
      {failing.length > 0 && (
        <div className='flex flex-col gap-1'>
          <span className='text-[10px] font-semibold text-red-400 uppercase tracking-wider px-1'>
            ✕ Failing ({failing.length})
          </span>
          <div className='rounded-xl bg-zinc-900/60 border border-red-900/40 px-3'>
            {failing.map((pair) => (
              <ContrastPairRow
                key={pair.id}
                pair={pair}
                onFix={onFix}
                mode={checkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Passing */}
      {passing.length > 0 && (
        <div className='flex flex-col gap-1'>
          <span className='text-[10px] font-semibold text-emerald-400 uppercase tracking-wider px-1'>
            ✓ Passing ({passing.length})
          </span>
          <div className='rounded-xl bg-zinc-900/60 border border-zinc-800 px-3'>
            {passing.map((pair) => (
              <ContrastPairRow
                key={pair.id}
                pair={pair}
                onFix={onFix}
                mode={checkMode}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
