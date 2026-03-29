import { useState } from 'react';
import type { SavedTheme } from '../types';

interface Props {
  onLoad: (theme: SavedTheme) => void;
  onDelete: (id: string) => void;
  onSave: (name: string) => void;
  savedThemes: SavedTheme[];
}

export function SavedThemes({ onLoad, onDelete, onSave, savedThemes }: Props) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-2'>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder='Theme name...'
          className='flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500'
        />
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className='px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed'
        >
          Save
        </button>
      </div>

      {savedThemes.length === 0 ? (
        <p className='text-xs text-zinc-600 text-center py-4'>
          No saved themes yet
        </p>
      ) : (
        <div className='flex flex-col gap-1.5'>
          {savedThemes.map((t) => (
            <div
              key={t.id}
              className='flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors'
            >
              <div className='flex items-center gap-2'>
                <div
                  className='w-3 h-3 rounded-full border border-zinc-700'
                  style={{ backgroundColor: t.theme.brandColor }}
                />
                <span className='text-xs text-zinc-300'>{t.name}</span>
                <span className='text-[10px] text-zinc-600'>
                  {new Date(t.savedAt).toLocaleDateString()}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => onLoad(t)}
                  className='text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer'
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className='text-[10px] text-zinc-600 hover:text-red-400 transition-colors cursor-pointer'
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
