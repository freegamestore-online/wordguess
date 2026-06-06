import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('wordguess-theme') as Theme) || 'system';
  });

  useEffect(() => {
    localStorage.setItem('wordguess-theme', theme);
    const root = document.documentElement;
    const body = document.body;

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      const themeName = isDark ? 'dark' : 'light';
      
      root.dataset.theme = themeName;
      body.dataset.theme = themeName;
      root.style.colorScheme = themeName;
      
      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] touch-action-manipulation shadow-sm flex items-center justify-center w-10 h-10"
      aria-label={`Toggle theme (current: ${theme})`}
    >
      {theme === 'light' && '☀️'}
      {theme === 'dark' && '🌙'}
      {theme === 'system' && '💻'}
    </button>
  );
}