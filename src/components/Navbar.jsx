import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/propiedades', label: 'Propiedades' },
  { to: '/sobre-mi', label: 'Sobre mí' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/quieres-vender', label: '¿Quieres vender?' },
  { to: '/contacto', label: 'Contacto' },
];

function Navbar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/60 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-2xl font-bold">Norvin García</Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm font-medium transition hover:text-brand-500 ${isActive ? 'text-brand-500' : ''}`}>
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button onClick={() => setOpen((prev) => !prev)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="space-y-2 border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
          {navItems.map((item) => (
            <NavLink key={item.to} onClick={() => setOpen(false)} to={item.to} className="block rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

export default Navbar;
