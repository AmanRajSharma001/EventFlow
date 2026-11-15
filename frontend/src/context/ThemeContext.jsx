import { useEffect, useState } from 'react';
import { ThemeContext } from './themeContextDef';

const STORAGE_KEY = 'eventflow_theme';

// Read the initial theme from localStorage, falling back to the OS preference.
function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {}

  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch (_) {}

  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply the .dark class to <html> and persist the choice whenever theme changes.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
