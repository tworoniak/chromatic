import type { ChromaticTheme } from '../../types';

interface Props {
  theme: ChromaticTheme;
  onShadow: (
    level: 'sm' | 'md' | 'lg' | 'xl',
    field: 'offsetY' | 'blur' | 'spread' | 'opacity',
    value: string | number,
  ) => void;
}

const LEVELS = ['sm', 'md', 'lg', 'xl'] as const;

export function ShadowControls({ theme, onShadow }: Props) {
  return (
    <div className='flex flex-col gap-5'>
      {LEVELS.map((level) => {
        const shadow = theme.shadows[level];
        const cssValue = `0px ${shadow.offsetY} ${shadow.blur} ${shadow.spread} rgba(0,0,0,${shadow.opacity})`;

        return (
          <div key={level} className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
              <span className='text-xs font-semibold text-zinc-300 uppercase tracking-wider w-6'>
                {level}
              </span>
              <div className='p-2 bg-zinc-200 rounded-md'>
                <div
                  className='w-8 h-8 bg-white rounded'
                  style={{ boxShadow: cssValue }}
                />
              </div>
              <span className='text-[10px] font-mono text-zinc-600 flex-1 truncate'>
                {cssValue}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2 pl-8'>
              {[
                {
                  field: 'offsetY' as const,
                  label: 'Offset Y',
                  min: 0,
                  max: 40,
                  step: 1,
                  unit: 'px',
                },
                {
                  field: 'blur' as const,
                  label: 'Blur',
                  min: 0,
                  max: 60,
                  step: 1,
                  unit: 'px',
                },
                {
                  field: 'spread' as const,
                  label: 'Spread',
                  min: -20,
                  max: 20,
                  step: 1,
                  unit: 'px',
                },
                {
                  field: 'opacity' as const,
                  label: 'Opacity',
                  min: 0,
                  max: 0.5,
                  step: 0.01,
                  unit: '',
                },
              ].map(({ field, label, min, max, step, unit }) => (
                <div key={field} className='flex flex-col gap-1'>
                  <div className='flex justify-between'>
                    <span className='text-[10px] text-zinc-500'>{label}</span>
                    <span className='text-[10px] font-mono text-zinc-600'>
                      {shadow[field]}
                      {unit}
                    </span>
                  </div>
                  <input
                    type='range'
                    min={min}
                    max={max}
                    step={step}
                    value={parseFloat(String(shadow[field]))}
                    onChange={(e) => {
                      const val =
                        field === 'opacity'
                          ? Number(e.target.value)
                          : `${e.target.value}px`;
                      onShadow(level, field, val);
                    }}
                    className='w-full accent-violet-500'
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
