import { useState, useMemo } from 'react';
import { useTheme } from './hooks/useTheme';
import { themeToTokens } from './lib/themeToTokens';
import { runPipeline } from './pipeline';
import { ColorControls } from './components/controls/ColorControls';
import { TypographyControls } from './components/controls/TypographyControls';
import { SpacingControls } from './components/controls/SpacingControls';
import { ShadowControls } from './components/controls/ShadowControls';
import { ContrastChecker } from './components/controls/ContrastChecker';
import { ComponentPreview } from './components/preview/ComponentPreview';
import { SavedThemes } from './components/SavedThemes';
import type { OutputFormat } from './types';

import { Undo2, Redo2 } from 'lucide-react';

type ControlTab =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'shadows'
  | 'contrast'
  | 'saved';
type LeftTab = 'controls' | 'output';

const OUTPUT_FORMATS: { id: OutputFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'scss', label: 'SCSS' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'tailwind', label: 'Tailwind' },
];

function highlight(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(\/\*.*?\*\/)/gs, '<span style="color:#71717a">$1</span>')
    .replace(/(\$?--[\w-]+)/g, '<span style="color:#fbbf24">$1</span>')
    .replace(
      /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g,
      '<span style="color:#4ade80">$1</span>',
    )
    .replace(
      /\b(export|const|type|import|default)\b/g,
      '<span style="color:#60a5fa">$1</span>',
    )
    .replace(/('[\w\s#.,/% -]+')/g, '<span style="color:#4ade80">$1</span>')
    .replace(/("[\w\s#.,/% -]+")/g, '<span style="color:#4ade80">$1</span>');
}

export default function App() {
  const {
    theme,
    setBrandColor,
    setHarmony,
    setDarkMode,
    setFontFamily,
    setMonoFamily,
    setBaseSize,
    setSpacingUnit,
    setShadow,
    setRadius,
    setSemanticColor,
    undo,
    redo,
    canUndo,
    canRedo,
    saveTheme,
    loadTheme,
    savedThemes,
    deleteSavedTheme,
  } = useTheme();

  const [leftTab, setLeftTab] = useState<LeftTab>('controls');
  const [controlTab, setControlTab] = useState<ControlTab>('color');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('css');
  const [copied, setCopied] = useState(false);

  const pipelineResult = useMemo(() => {
    const tokens = themeToTokens(theme);
    return runPipeline(JSON.stringify(tokens, null, 2));
  }, [theme]);

  const outputContent = pipelineResult.output?.[outputFormat] ?? '';

  const highlightedOutput = useMemo(() => highlight(outputContent), [outputContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const exts: Record<OutputFormat, string> = {
      css: '.css',
      scss: '.scss',
      typescript: '.ts',
      tailwind: '.config.ts',
    };
    const blob = new Blob([outputContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-tokens${exts[outputFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CONTROL_TABS: { id: ControlTab; label: string }[] = [
    { id: 'color', label: 'Color' },
    { id: 'typography', label: 'Type' },
    { id: 'spacing', label: 'Space' },
    { id: 'shadows', label: 'Shadow' },
    { id: 'contrast', label: 'Contrast' },
    { id: 'saved', label: 'Saved' },
  ];

  return (
    <div className='h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden'>
      {/* Header */}
      <header className='flex items-center justify-between px-5 py-2.5 border-b border-zinc-800 shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <div
              className='w-5 h-5 rounded-md'
              style={{
                background: `linear-gradient(135deg, ${theme.colors.brand['500']}, ${theme.colors.accent['500']})`,
              }}
            />
            <h1 className='text-sm font-bold text-zinc-100 tracking-tight'>
              Chromatic
            </h1>
          </div>
          <span className='text-xs text-zinc-600'>Visual Theme Builder</span>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={undo}
            disabled={!canUndo}
            className='px-2.5 py-1.5 text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed'
            title='Undo'
          >
            <Undo2 strokeWidth={1} /> Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className='px-2.5 py-1.5 text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed'
            title='Redo'
          >
            Redo <Redo2 strokeWidth={1} />
          </button>
          <div className='w-px h-4 bg-zinc-800' />
          <span className='text-xs font-mono text-zinc-600'>
            {pipelineResult.tokenCount} tokens
          </span>
        </div>
      </header>

      {/* Main */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left panel */}
        <div className='w-96 shrink-0 border-r border-zinc-800 flex flex-col overflow-hidden'>
          {/* Left tab switcher */}
          <div className='flex border-b border-zinc-800 shrink-0'>
            {(['controls', 'output'] as LeftTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer
                  ${
                    leftTab === tab
                      ? 'text-violet-400 border-b-2 border-violet-500 -mb-px'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {leftTab === 'controls' && (
            <>
              {/* Control tabs */}
              <div className='flex gap-0.5 p-2 border-b border-zinc-800 shrink-0'>
                {CONTROL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setControlTab(tab.id)}
                    className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer
                      ${
                        controlTab === tab.id
                          ? 'bg-violet-950 text-violet-300 border border-violet-700'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Control content */}
              <div className='flex-1 overflow-y-auto p-4'>
                {controlTab === 'color' && (
                  <ColorControls
                    theme={theme}
                    onBrandColor={setBrandColor}
                    onHarmony={setHarmony}
                  />
                )}
                {controlTab === 'typography' && (
                  <TypographyControls
                    theme={theme}
                    onFontFamily={setFontFamily}
                    onMonoFamily={setMonoFamily}
                    onBaseSize={setBaseSize}
                  />
                )}
                {controlTab === 'spacing' && (
                  <SpacingControls
                    theme={theme}
                    onSpacingUnit={setSpacingUnit}
                    onRadius={setRadius}
                  />
                )}
                {controlTab === 'shadows' && (
                  <ShadowControls theme={theme} onShadow={setShadow} />
                )}
                {controlTab === 'contrast' && (
                  <ContrastChecker
                    theme={theme}
                    onFix={(key, hex, mode) => setSemanticColor(key, hex, mode)}
                  />
                )}
                {controlTab === 'saved' && (
                  <SavedThemes
                    onLoad={loadTheme}
                    onDelete={deleteSavedTheme}
                    onSave={saveTheme}
                    savedThemes={savedThemes}
                  />
                )}
              </div>
            </>
          )}

          {leftTab === 'output' && (
            <>
              {/* Output format tabs */}
              <div className='flex border-b border-zinc-800 shrink-0'>
                {OUTPUT_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setOutputFormat(fmt.id)}
                    className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer
                      ${
                        outputFormat === fmt.id
                          ? 'text-amber-400 border-b-2 border-amber-500 -mb-px'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Output actions */}
              <div className='flex items-center gap-3 px-4 py-2 border-b border-zinc-800 shrink-0'>
                <button
                  onClick={handleCopy}
                  className='text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer'
                >
                  {copied ? 'copied!' : 'copy'}
                </button>
                <span className='text-zinc-700'>·</span>
                <button
                  onClick={handleDownload}
                  className='text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer'
                >
                  download
                </button>
                <span className='ml-auto text-[10px] font-mono text-zinc-600'>
                  {outputContent.split('\n').length} lines
                </span>
              </div>

              {/* Output code */}
              <div className='flex-1 overflow-auto p-4'>
                <pre className='text-[11px] font-mono leading-relaxed'>
                  <code
                    dangerouslySetInnerHTML={{
                      __html: highlightedOutput,
                    }}
                  />
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Right panel — preview */}
        <div className='flex-1 overflow-hidden'>
          <ComponentPreview theme={theme} onDarkMode={setDarkMode} />
        </div>
      </div>
    </div>
  );
}
