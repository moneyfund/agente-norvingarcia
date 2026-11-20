import { ChevronDown, Menu, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandMark from './BrandMark';
import Modal from './Modal';
import ThemeToggle from './ThemeToggle';

const services = [
  { to: '/quieres-vender', label: 'Vender mi propiedad' },
  { to: '/educacion', label: 'Educación inmobiliaria' },
  { to: '/edicion-propiedades', label: 'Edición con IA' },
  { to: '/avaluos', label: 'Avalúos inmobiliarios' },
  { to: '/listado', label: 'Captación profesional' },
];

const primary = [
  { to: '/propiedades', label: 'Propiedades' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/sobre-mi', label: 'Sobre mí' },
];

function NavLinks({ items }) {
  return items.map(({ to, label }) => <NavLink key={to} to={to}>{label}</NavLink>);
}

function Navbar({ theme, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const location = useLocation();
  const { user, loading, isAdmin, loginWithGoogle, logout } = useAuth();
  const navRef = useRef(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    navRef.current?.querySelectorAll('details[open]').forEach((item) => { item.open = false; });
  }, [location.key]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 940px)');
    const onResize = () => { if (desktop.matches) setMenuOpen(false); };
    const closeOutside = (event) => {
      navRef.current?.querySelectorAll('details[open]').forEach((item) => {
        if (!item.contains(event.target)) item.open = false;
      });
    };
    desktop.addEventListener('change', onResize);
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      desktop.removeEventListener('change', onResize);
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, []);

  const handleEscape = (event) => {
    if (event.key !== 'Escape') return;
    const disclosure = event.target.closest('details[open]');
    if (!disclosure) return;
    disclosure.open = false;
    disclosure.querySelector('summary').focus();
  };

  const changeSession = async () => {
    setAuthBusy(true);
    setAuthError('');
    try {
      await (user ? logout() : loginWithGoogle());
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(user ? 'No se pudo cerrar la sesión.' : 'No se pudo iniciar sesión con Google.');
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const account = (
    <>
      {user && <p className="ng-account-name">{user.displayName || user.email}</p>}
      {user && isAdmin && <Link to="/admin">Panel de administración</Link>}
      <button type="button" className="ng-button ng-button--wine" disabled={loading || authBusy} onClick={changeSession}>
        {loading ? 'Verificando sesión…' : authBusy ? 'Conectando…' : user ? 'Cerrar sesión' : 'Entrar con Google'}
      </button>
      {authError && <p className="ng-inline-error" role="alert">{authError}</p>}
    </>
  );

  return (
    <header className={`ng-navbar${location.pathname === '/' && !scrolled ? ' ng-navbar--clear' : ''}`}>
      <div className="ng-nav-shell" ref={navRef} onKeyDown={handleEscape}>
        <BrandMark />
        <nav className="ng-desktop-nav" aria-label="Navegación principal">
          <NavLinks items={primary} />
          <details className="ng-disclosure">
            <summary className={services.some(({ to }) => location.pathname === to || location.pathname.startsWith(`${to}/`)) ? 'is-active' : undefined}>
              Servicios <ChevronDown size={15} aria-hidden="true" />
            </summary>
            <div className="ng-disclosure-panel">
              <NavLinks items={services} />
            </div>
          </details>
        </nav>
        <div className="ng-nav-actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <details className="ng-disclosure ng-account">
            <summary className="ng-icon-button" aria-label="Mi cuenta"><UserRound size={20} aria-hidden="true" /></summary>
            <div className="ng-disclosure-panel ng-account-panel">{account}</div>
          </details>
          <Link to="/contacto" className="ng-nav-contact">Contacto</Link>
          <button
            type="button"
            className="ng-icon-button ng-mobile-toggle"
            aria-label="Abrir menú"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={23} aria-hidden="true" />
          </button>
        </div>
      </div>
      <Modal className="ng-mobile-menu" open={menuOpen} onClose={() => setMenuOpen(false)} title="Menú">
        <nav className="ng-mobile-links" aria-label="Navegación móvil">
          <div className="ng-mobile-primary"><NavLinks items={[{ to: '/', label: 'Inicio' }, ...primary, { to: '/contacto', label: 'Contacto' }]} /></div>
          <div className="ng-mobile-secondary">
            <p className="ng-label">Servicios</p>
            <NavLinks items={services} />
          </div>
        </nav>
        <div className="ng-mobile-account">{account}</div>
      </Modal>
    </header>
  );
}

export default Navbar;
