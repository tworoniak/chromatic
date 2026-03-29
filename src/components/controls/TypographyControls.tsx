import type { ChromaticTheme } from '../../types';
import { useGoogleFonts } from '../../hooks/useGoogleFonts';

interface Props {
  theme: ChromaticTheme;
  onFontFamily: (family: string) => void;
  onMonoFamily: (family: string) => void;
  onBaseSize: (size: number) => void;
  onScaleRatio: (ratio: number) => void;
  onWeight: (key: 'normal' | 'medium' | 'semibold' | 'bold', value: number) => void;
  onLineHeight: (key: 'tight' | 'normal' | 'loose', value: number) => void;
}

function FontPicker({
  label,
  value,
  onChange,
  category,
}: {
  label: string;
  value: string;
  onChange: (family: string) => void;
  category: 'sans-serif' | 'serif' | 'monospace';
}) {
  const initialFamily = value.split(',')[0].trim();
  const { fonts, query, search, load } = useGoogleFonts(initialFamily);
  const filtered = fonts.filter((f) => f.category === category);

  return (
    <div className='flex flex-col gap-2'>
      <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
        {label}
      </label>
      <input
        type='text'
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder='Search fonts...'
        className='w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500'
      />
      <div className='flex flex-col gap-1 max-h-36 overflow-y-auto'>
        {filtered.map((font) => (
          <button
            key={font.family}
            onClick={() => {
              load(font.family);
              onChange(`${font.family}, ${font.category}`);
            }}
            className={`px-3 py-1.5 rounded-lg text-left text-sm transition-all cursor-pointer
              ${
                value.startsWith(font.family)
                  ? 'bg-violet-950/40 border border-violet-600 text-violet-300'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-600'
              }`}
            style={{ fontFamily: font.family }}
          >
            {font.family}
          </button>
        ))}
      </div>
    </div>
  );
}

const SCALE_RATIO_LABELS: Record<string, string> = {
  '1.125': 'Major 2nd',
  '1.2': 'Minor 3rd',
  '1.25': 'Major 3rd',
  '1.333': 'Perfect 4th',
  '1.5': 'Perfect 5th',
};

export function TypographyControls({
  theme,
  onFontFamily,
  onMonoFamily,
  onBaseSize,
  onScaleRatio,
  onWeight,
  onLineHeight,
}: Props) {
  const { typography } = theme;
  const ratioLabel =
    SCALE_RATIO_LABELS[String(typography.scaleRatio)] ?? typography.scaleRatio;

  return (
    <div className='flex flex-col gap-5'>
      <FontPicker
        label='Sans Font'
        value={typography.fontFamily}
        onChange={onFontFamily}
        category='sans-serif'
      />
      <FontPicker
        label='Mono Font'
        value={typography.monoFamily}
        onChange={onMonoFamily}
        category='monospace'
      />

      {/* Base size */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
            Base Size
          </label>
          <span className='text-xs font-mono text-zinc-400'>
            {typography.baseSize}px
          </span>
        </div>
        <input
          type='range'
          min={12}
          max={20}
          step={1}
          value={typography.baseSize}
          onChange={(e) => onBaseSize(Number(e.target.value))}
          className='w-full accent-violet-500'
        />
        <div className='flex justify-between text-[10px] font-mono text-zinc-600'>
          <span>12px</span>
          <span>16px</span>
          <span>20px</span>
        </div>
      </div>

      {/* Scale ratio */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
            Scale Ratio
          </label>
          <span className='text-xs font-mono text-zinc-400'>
            {typography.scaleRatio}{' '}
            <span className='text-zinc-600'>({ratioLabel})</span>
          </span>
        </div>
        <input
          type='range'
          min={1.125}
          max={1.5}
          step={0.025}
          value={typography.scaleRatio}
          onChange={(e) => onScaleRatio(Number(e.target.value))}
          className='w-full accent-violet-500'
        />
        <div className='flex justify-between text-[10px] font-mono text-zinc-600'>
          <span>1.125</span>
          <span>1.25</span>
          <span>1.5</span>
        </div>
      </div>

      {/* Font weights */}
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
          Weights
        </label>
        {(
          [
            { key: 'normal', label: 'Normal' },
            { key: 'medium', label: 'Medium' },
            { key: 'semibold', label: 'Semibold' },
            { key: 'bold', label: 'Bold' },
          ] as const
        ).map(({ key, label }) => (
          <div key={key} className='flex flex-col gap-1'>
            <div className='flex items-center justify-between'>
              <span className='text-xs text-zinc-400'>{label}</span>
              <span className='text-xs font-mono text-zinc-500'>
                {typography.weights[key]}
              </span>
            </div>
            <input
              type='range'
              min={100}
              max={900}
              step={100}
              value={typography.weights[key]}
              onChange={(e) => onWeight(key, Number(e.target.value))}
              className='w-full accent-violet-500'
            />
          </div>
        ))}
      </div>

      {/* Line heights */}
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
          Line Heights
        </label>
        {(
          [
            { key: 'tight', label: 'Tight' },
            { key: 'normal', label: 'Normal' },
            { key: 'loose', label: 'Loose' },
          ] as const
        ).map(({ key, label }) => (
          <div key={key} className='flex flex-col gap-1'>
            <div className='flex items-center justify-between'>
              <span className='text-xs text-zinc-400'>{label}</span>
              <span className='text-xs font-mono text-zinc-500'>
                {typography.lineHeights[key]}
              </span>
            </div>
            <input
              type='range'
              min={1}
              max={2}
              step={0.05}
              value={typography.lineHeights[key]}
              onChange={(e) => onLineHeight(key, Number(e.target.value))}
              className='w-full accent-violet-500'
            />
          </div>
        ))}
      </div>
    </div>
  );
}
