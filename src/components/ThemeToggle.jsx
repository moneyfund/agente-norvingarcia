import { Moon, Sun } from 'lucide-react';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="rounded-full border border-slate-300 p-2 transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      onClick={onToggle}
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default ThemeToggle;
