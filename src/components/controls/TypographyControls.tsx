import type { ChromaticTheme } from '../../types';
import { useGoogleFonts } from '../../hooks/useGoogleFonts';

interface Props {
  theme: ChromaticTheme;
  onFontFamily: (family: string) => void;
  onMonoFamily: (family: string) => void;
  onBaseSize: (size: number) => void;
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
  const { fonts, query, search, load } = useGoogleFonts();
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

export function TypographyControls({
  theme,
  onFontFamily,
  onMonoFamily,
  onBaseSize,
}: Props) {
  return (
    <div className='flex flex-col gap-5'>
      <FontPicker
        label='Sans Font'
        value={theme.typography.fontFamily}
        onChange={onFontFamily}
        category='sans-serif'
      />
      <FontPicker
        label='Mono Font'
        value={theme.typography.monoFamily}
        onChange={onMonoFamily}
        category='monospace'
      />
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
            Base Size
          </label>
          <span className='text-xs font-mono text-zinc-400'>
            {theme.typography.baseSize}px
          </span>
        </div>
        <input
          type='range'
          min={12}
          max={20}
          step={1}
          value={theme.typography.baseSize}
          onChange={(e) => onBaseSize(Number(e.target.value))}
          className='w-full accent-violet-500'
        />
        <div className='flex justify-between text-[10px] font-mono text-zinc-600'>
          <span>12px</span>
          <span>16px</span>
          <span>20px</span>
        </div>
      </div>
    </div>
  );
}
