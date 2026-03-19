import type { ChromaticTheme, HarmonyType, ColorScale } from '../../types';
import { getContrastColor } from '../../lib/colorUtils';

interface Props {
  theme: ChromaticTheme;
  onBrandColor: (hex: string) => void;
  onHarmony: (type: HarmonyType) => void;
}

const HARMONIES: { id: HarmonyType; label: string; description: string }[] = [
  {
    id: 'complementary',
    label: 'Complementary',
    description: 'Opposite on the wheel',
  },
  { id: 'analogous', label: 'Analogous', description: '±30° neighbours' },
  { id: 'triadic', label: 'Triadic', description: '120° apart' },
  {
    id: 'split-complementary',
    label: 'Split Complementary',
    description: '150° & 210°',
  },
];

function ScaleRow({ scale, label }: { scale: ColorScale; label: string }) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-[10px] font-medium text-zinc-500 uppercase tracking-wider'>
        {label}
      </span>
      <div className='flex gap-0.5'>
        {Object.entries(scale).map(([step, color]) => (
          <div
            key={step}
            className='flex-1 h-7 rounded-sm relative group cursor-default'
            style={{ backgroundColor: color }}
            title={`${step}: ${color}`}
          >
            <span
              className='absolute inset-0 flex items-center justify-center text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity'
              style={{ color: getContrastColor(color) }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ColorControls({ theme, onBrandColor, onHarmony }: Props) {
  const semantic = theme.darkMode
    ? theme.colors.semanticDark
    : theme.colors.semanticLight;
  return (
    <div className='flex flex-col gap-5'>
      {/* Brand color picker */}
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
          Brand Color
        </label>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <input
              type='color'
              value={theme.brandColor}
              onChange={(e) => onBrandColor(e.target.value)}
              className='w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer bg-transparent'
            />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-mono text-zinc-200'>
              {theme.brandColor}
            </span>
            <span className='text-xs text-zinc-500'>Click to change</span>
          </div>
        </div>
      </div>

      {/* Generated scales */}
      <div className='flex flex-col gap-3'>
        <ScaleRow scale={theme.colors.brand} label='Brand' />
        <ScaleRow scale={theme.colors.accent} label='Accent' />
        <ScaleRow scale={theme.colors.neutral} label='Neutral' />
      </div>

      {/* Harmony picker */}
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
          Accent Harmony
        </label>
        <div className='grid grid-cols-2 gap-1.5'>
          {HARMONIES.map((h) => (
            <button
              key={h.id}
              onClick={() => onHarmony(h.id)}
              className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg border text-left transition-all cursor-pointer
                ${
                  theme.harmonyType === h.id
                    ? 'border-violet-500 bg-violet-950/40 text-violet-300'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                }`}
            >
              <span className='text-xs font-semibold'>{h.label}</span>
              <span className='text-[10px] opacity-70'>{h.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Semantic colors */}
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
          Semantic Colors
        </label>
        <div className='grid grid-cols-2 gap-1.5'>
          {Object.entries(semantic).map(([key, value]) => (
            <div
              key={key}
              className='flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800'
            >
              <div
                className='w-4 h-4 rounded-sm border border-zinc-700 shrink-0'
                style={{ backgroundColor: value }}
              />
              <div className='flex flex-col min-w-0'>
                <span className='text-[10px] text-zinc-400 truncate'>
                  {key}
                </span>
                <span className='text-[9px] font-mono text-zinc-600 truncate'>
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
