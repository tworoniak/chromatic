import type { ChromaticTheme } from '../../types';

import { Sun, Moon } from 'lucide-react';

interface Props {
  theme: ChromaticTheme;
  onDarkMode: (dark: boolean) => void;
}

export function ComponentPreview({ theme, onDarkMode }: Props) {
  const semantic = theme.darkMode
    ? theme.colors.semanticDark
    : theme.colors.semanticLight;
  const { borderRadius, shadows } = theme;
  const u = theme.spacing.baseUnit;

  const previewStyle = {
    fontFamily: theme.typography.fontFamily,
    backgroundColor: semantic.background,
    color: semantic.text,
  };

  const cardStyle = {
    backgroundColor: semantic.surface,
    borderColor: semantic.border,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: borderRadius.lg,
    boxShadow: `0px ${shadows.md.offsetY} ${shadows.md.blur} ${shadows.md.spread} rgba(0,0,0,${shadows.md.opacity})`,
    padding: u * 5,
    gap: u * 3,
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const btnPrimary = {
    backgroundColor: semantic.primary,
    color: '#ffffff',
    borderRadius: borderRadius.md,
  };

  const btnSecondary = {
    backgroundColor: 'transparent',
    color: semantic.primary,
    border: `1px solid ${semantic.primary}`,
    borderRadius: borderRadius.md,
  };

  const btnGhost = {
    backgroundColor: 'transparent',
    color: semantic.textMuted,
    borderRadius: borderRadius.md,
  };

  const btnAccent = {
    backgroundColor: theme.colors.accent['500'],
    color: '#ffffff',
    borderRadius: borderRadius.md,
  };

  const inputStyle = {
    backgroundColor: semantic.surface,
    borderColor: semantic.border,
    color: semantic.text,
    borderRadius: borderRadius.md,
  };

  const badgeStyle = (color: string) => ({
    backgroundColor: `${color}20`,
    color,
    borderRadius: borderRadius.full,
  });

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      {/* Preview toolbar */}
      <div className='flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 shrink-0'>
        <span className='text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
          Component Preview
        </span>
        <button
          onClick={() => onDarkMode(!theme.darkMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer
            ${
              theme.darkMode
                ? 'bg-zinc-800 border-zinc-600 text-zinc-300'
                : 'bg-white border-zinc-300 text-zinc-700'
            }`}
        >
          {theme.darkMode ? (
            <>
              <Sun size={20} strokeWidth={1} /> Light
            </>
          ) : (
            <>
              <Moon size={20} strokeWidth={1} /> Dark
            </>
          )}
        </button>
      </div>

      {/* Preview canvas */}
      <div
        className='chromatic-preview flex-1 overflow-y-auto p-6 flex flex-col gap-6 transition-colors duration-300'
        data-dark={theme.darkMode}
        style={previewStyle}
      >
        {/* Typography */}
        <div style={cardStyle}>
          <p
            className='text-[10px] font-mono uppercase tracking-wider'
            style={{ color: semantic.textMuted }}
          >
            Typography
          </p>
          <h1
            className='font-bold'
            style={{
              fontSize: 44,
              color: semantic.text,
              lineHeight: theme.typography.lineHeights.tight,
            }}
          >
            The quick brown <span style={{ color: semantic.primary }}>fox</span>
          </h1>
          <h2
            className='font-semibold'
            style={{ fontSize: 24, color: semantic.text }}
          >
            Jumps over the{' '}
            <span style={{ color: theme.colors.accent[500] }}>lazy dog</span>
          </h2>
          <p
            style={{
              fontSize: theme.typography.baseSize,
              color: semantic.text,
              lineHeight: theme.typography.lineHeights.normal,
            }}
          >
            Body text at {theme.typography.baseSize}px. Design tokens bridge the
            gap between design and engineering by providing a shared language
            for visual decisions.
          </p>
          <p style={{ fontSize: 14, color: semantic.textMuted }}>
            Muted text — captions, helper text, secondary information.
          </p>
          <code
            style={{
              fontFamily: theme.typography.monoFamily,
              fontSize: 13,
              color: theme.colors.accent['600'],
              backgroundColor: `${theme.colors.accent['500']}15`,
              padding: '2px 6px',
              borderRadius: borderRadius.sm,
            }}
          >
            const token = 'value'
          </code>
          <p style={{ fontSize: 14, color: semantic.text }}>
            Visit the{' '}
            <a
              style={{
                color: theme.colors.accent['500'],
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              documentation
            </a>{' '}
            to learn more about design tokens.
          </p>
        </div>

        {/* Buttons */}
        <div style={cardStyle}>
          <p
            className='text-[10px] font-mono uppercase tracking-wider'
            style={{ color: semantic.textMuted }}
          >
            Buttons
          </p>
          <div className='flex flex-wrap gap-2'>
            <button
              className='px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer'
              style={btnPrimary}
            >
              Primary
            </button>
            <button
              className='px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 cursor-pointer'
              style={btnSecondary}
            >
              Secondary
            </button>
            <button
              className='px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer'
              style={btnAccent}
            >
              Accent
            </button>
            <button
              className='px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70 cursor-pointer'
              style={btnGhost}
            >
              Ghost
            </button>
            <button
              className='px-4 py-2 text-sm font-semibold cursor-pointer'
              style={{
                ...btnPrimary,
                backgroundColor: semantic.error,
                borderRadius: borderRadius.md,
              }}
            >
              Destructive
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              className='px-3 py-1.5 text-xs font-semibold cursor-pointer'
              style={btnPrimary}
            >
              Small
            </button>
            <button
              className='px-5 py-2.5 text-base font-semibold cursor-pointer'
              style={btnPrimary}
            >
              Large
            </button>
            <button
              className='px-4 py-2 text-sm font-semibold opacity-40 cursor-not-allowed'
              style={btnPrimary}
              disabled
            >
              Disabled
            </button>
          </div>
        </div>

        {/* Form inputs */}
        <div style={cardStyle}>
          <p
            className='text-[10px] font-mono uppercase tracking-wider'
            style={{ color: semantic.textMuted }}
          >
            Form Inputs
          </p>
          <div className='flex flex-col gap-1'>
            <label
              className='text-sm font-medium'
              style={{ color: semantic.text }}
            >
              Email address
            </label>
            <input
              type='email'
              placeholder='you@example.com'
              readOnly
              className='px-3 py-2 text-sm border outline-none'
              style={inputStyle}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <label
              className='text-sm font-medium'
              style={{ color: semantic.text }}
            >
              Message
            </label>
            <textarea
              placeholder='Write something...'
              readOnly
              rows={3}
              className='px-3 py-2 text-sm border outline-none resize-none'
              style={inputStyle}
            />
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              readOnly
              defaultChecked
              className='cursor-pointer'
              style={{ accentColor: semantic.primary }}
            />
            <label className='text-sm' style={{ color: semantic.text }}>
              I agree to the terms
            </label>
          </div>
        </div>

        {/* Badges + alerts */}
        <div style={cardStyle}>
          <p
            className='text-[10px] font-mono uppercase tracking-wider'
            style={{ color: semantic.textMuted }}
          >
            Badges & Alerts
          </p>
          <div className='flex flex-wrap gap-2'>
            {[
              { label: 'Primary', color: semantic.primary },
              { label: 'Accent', color: theme.colors.accent['500'] },
              { label: 'Success', color: semantic.success },
              { label: 'Warning', color: semantic.warning },
              { label: 'Error', color: semantic.error },
              { label: 'Muted', color: semantic.textMuted },
            ].map(({ label, color }) => (
              <span
                key={label}
                className='px-2.5 py-1 text-xs font-semibold'
                style={badgeStyle(color)}
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className='p-3 rounded-lg border-l-4 text-sm'
            style={{
              backgroundColor: `${semantic.success}15`,
              borderColor: semantic.success,
              color: semantic.text,
            }}
          >
            ✓ Theme saved successfully
          </div>
          <div
            className='p-3 rounded-lg border-l-4 text-sm'
            style={{
              backgroundColor: `${semantic.warning}15`,
              borderColor: semantic.warning,
              color: semantic.text,
            }}
          >
            ⚠ Some tokens have unresolved aliases
          </div>
          <div
            className='p-3 rounded-lg border-l-4 text-sm'
            style={{
              backgroundColor: `${semantic.error}15`,
              borderColor: semantic.error,
              color: semantic.text,
            }}
          >
            ✕ Failed to export tokens
          </div>
        </div>

        {/* Color palette */}
        <div style={cardStyle}>
          <p
            className='text-[10px] font-mono uppercase tracking-wider'
            style={{ color: semantic.textMuted }}
          >
            Color Palette
          </p>
          {[
            { label: 'Brand', scale: theme.colors.brand },
            { label: 'Accent', scale: theme.colors.accent },
            { label: 'Neutral', scale: theme.colors.neutral },
          ].map(({ label, scale }) => (
            <div key={label} className='flex flex-col gap-1'>
              <span className='text-xs' style={{ color: semantic.textMuted }}>
                {label}
              </span>
              <div className='flex gap-0.5'>
                {Object.entries(scale).map(([step, color]) => (
                  <div
                    key={step}
                    className='flex-1 h-8 rounded-sm'
                    style={{ backgroundColor: color }}
                    title={`${step}: ${color}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Shadows */}
        <div style={cardStyle}>
          <p
            className='text-[10px] font-mono uppercase tracking-wider'
            style={{ color: semantic.textMuted }}
          >
            Shadows
          </p>
          <div className='flex gap-6 items-end'>
            {(['sm', 'md', 'lg', 'xl'] as const).map((level) => {
              const s = theme.shadows[level];
              const shadowValue = `0px ${s.offsetY} ${s.blur} ${s.spread} rgba(0,0,0,${s.opacity})`;
              return (
                <div key={level} className='flex flex-col items-center gap-2'>
                  <div
                    style={{
                      padding: u * 3,
                      backgroundColor: '#e4e4e7',
                      borderRadius: borderRadius.md,
                    }}
                  >
                    <div
                      style={{
                        width: u * 10,
                        height: u * 10,
                        backgroundColor: semantic.surface,
                        borderRadius: borderRadius.sm,
                        boxShadow: shadowValue,
                      }}
                    />
                  </div>
                  <span
                    className='text-[10px] font-mono'
                    style={{ color: semantic.textMuted }}
                  >
                    {level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
