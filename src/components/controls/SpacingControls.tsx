import type { ChromaticTheme } from '../../types';

interface Props {
  theme: ChromaticTheme;
  onSpacingUnit: (unit: number) => void;
  onRadius: (key: 'sm' | 'md' | 'lg' | 'xl' | 'full', value: number) => void;
}

export function SpacingControls({ theme, onSpacingUnit, onRadius }: Props) {
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
  const radiusKeys = ['sm', 'md', 'lg', 'xl'] as const;

  return (
    <div className='flex flex-col gap-5'>
      {/* Spacing unit */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
            Base Unit
          </label>
          <span className='text-xs font-mono text-zinc-400'>
            {theme.spacing.baseUnit}px
          </span>
        </div>
        <input
          type='range'
          min={2}
          max={8}
          step={1}
          value={theme.spacing.baseUnit}
          onChange={(e) => onSpacingUnit(Number(e.target.value))}
          className='w-full accent-violet-500'
        />
        <div className='flex flex-col gap-1 mt-1'>
          {steps.map((step) => {
            const px = step * theme.spacing.baseUnit;
            return (
              <div key={step} className='flex items-center gap-2'>
                <span className='text-[10px] font-mono text-zinc-600 w-6'>
                  {step}
                </span>
                <div
                  className='h-2 bg-violet-500/40 rounded-sm border border-violet-500/30'
                  style={{ width: Math.min(px * 2, 200) }}
                />
                <span className='text-[10px] font-mono text-zinc-600'>
                  {px}px
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Border radius */}
      <div className='flex flex-col gap-3'>
        <label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>
          Border Radius
        </label>
        {radiusKeys.map((key) => (
          <div key={key} className='flex flex-col gap-1'>
            <div className='flex items-center justify-between'>
              <span className='text-xs text-zinc-400'>{key}</span>
              <span className='text-xs font-mono text-zinc-500'>
                {theme.borderRadius[key]}px
              </span>
            </div>
            <input
              type='range'
              min={0}
              max={24}
              step={1}
              value={theme.borderRadius[key]}
              onChange={(e) => onRadius(key, Number(e.target.value))}
              className='w-full accent-violet-500'
            />
          </div>
        ))}
      </div>
    </div>
  );
}
