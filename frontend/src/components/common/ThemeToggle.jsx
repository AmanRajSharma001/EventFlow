import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

// Small icon button that toggles between light and dark mode.
// Styled like the other icon-only buttons already present in the navbar.
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    >
      {isDark ? (
        <Sun aria-hidden="true" className="h-4.5 w-4.5" />
      ) : (
        <Moon aria-hidden="true" className="h-4.5 w-4.5" />
      )}
    </button>
  );
}
