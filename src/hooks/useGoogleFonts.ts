import { useCallback, useEffect, useRef, useState } from 'react';

export interface GoogleFont {
  family: string;
  category: string;
}

const POPULAR_FONTS: GoogleFont[] = [
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Geist', category: 'sans-serif' },
  { family: 'DM Sans', category: 'sans-serif' },
  { family: 'Outfit', category: 'sans-serif' },
  { family: 'Plus Jakarta Sans', category: 'sans-serif' },
  { family: 'Nunito', category: 'sans-serif' },
  { family: 'Rubik', category: 'sans-serif' },
  { family: 'Sora', category: 'sans-serif' },
  { family: 'Figtree', category: 'sans-serif' },
  { family: 'Manrope', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Source Serif 4', category: 'serif' },
  { family: 'Crimson Pro', category: 'serif' },
  { family: 'JetBrains Mono', category: 'monospace' },
  { family: 'Fira Code', category: 'monospace' },
  { family: 'Source Code Pro', category: 'monospace' },
  { family: 'Inconsolata', category: 'monospace' },
];

const loadedFonts = new Set<string>();

function loadGoogleFont(family: string): void {
  if (loadedFonts.has(family)) return;
  loadedFonts.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export function useGoogleFonts(initialFamily?: string) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(POPULAR_FONTS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (initialFamily) loadGoogleFont(initialFamily);
  }, [initialFamily]);

  const search = useCallback((q: string) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const lower = q.toLowerCase().trim();
      setFiltered(
        lower === ''
          ? POPULAR_FONTS
          : POPULAR_FONTS.filter((f) => f.family.toLowerCase().includes(lower)),
      );
    }, 200);
  }, []);

  const load = useCallback((family: string) => {
    loadGoogleFont(family);
  }, []);

  return { fonts: filtered, query, search, load };
}
