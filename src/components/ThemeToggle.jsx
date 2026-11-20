import { Moon, Sun } from 'lucide-react';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="ng-icon-button"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
    </button>
  );
}

export default ThemeToggle;
