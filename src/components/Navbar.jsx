import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
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
  const { user, loading, loginWithGoogle, logout } = useAuth();

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/60 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center">
          <img src="/LOGO DIAMANTES.png" className="h-8 w-auto object-contain" />
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm font-medium transition-colors hover:text-brand-500 ${isActive ? 'text-brand-500' : ''}`}>
              {item.label}
            </NavLink>
          ))}
          {loading ? (
            <span className="text-xs text-slate-500">Cargando sesión...</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <img src={user.photoURL || 'https://via.placeholder.com/40'} alt={user.displayName || 'Usuario'} className="h-9 w-9 rounded-full border border-brand-500/40 object-cover" />
              <span className="max-w-32 truncate text-xs font-semibold">{user.displayName || user.email}</span>
              <Button variant="outline" className="px-3 py-2 text-xs" onClick={logout}>Salir</Button>
            </div>
          ) : (
            <Button className="px-3 py-2 text-xs" onClick={handleGoogleLogin}>Entrar con Google</Button>
          )}
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
            <NavLink key={item.to} onClick={() => setOpen(false)} to={item.to} className={({ isActive }) => `block rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'bg-brand-500/10 text-brand-600 dark:text-rose-300' : ''}`}>
              {item.label}
            </NavLink>
          ))}
          {loading ? (
            <span className="text-xs text-slate-500">Cargando sesión...</span>
          ) : user ? (
            <button onClick={logout} className="w-full rounded-xl bg-brand-500 px-3 py-2 text-left font-medium text-white">Cerrar sesión ({user.displayName})</button>
          ) : (
            <button onClick={handleGoogleLogin} className="w-full rounded-xl bg-brand-500 px-3 py-2 text-left font-medium text-white">Entrar con Google</button>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
