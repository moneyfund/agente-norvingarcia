import { Link, Navigate, useLocation } from 'react-router-dom';
import BrandMark, { Monogram } from '../../components/BrandMark';
import FormLogin from '../../components/FormLogin';
import Seo from '../../components/Seo';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

function AdminLoginPage({ theme, toggleTheme }) {
  const { isAuthenticated, isAdmin, loading, loginWithGoogle, logout, user } = useAuth();
  const { state } = useLocation();
  const from = state?.from;
  const adminPage = /^\/admin(?:\/|$)/.test(from?.pathname || '') && from.pathname !== '/admin/login';

  if (!loading && isAuthenticated && isAdmin) return <Navigate to={adminPage ? from : '/admin'} replace />;

  return (
    <main className="ng-access">
      <Seo title="Acceso | Norvin García" description="Accede con Google a las herramientas inmobiliarias." />
      <header className="ng-wrap ng-access-header">
        <BrandMark />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>
      <div className="ng-access-grid">
        <div className="ng-access-mark"><Monogram /></div>
        <section className="ng-access-content">
          {loading ? <p role="status">Verificando sesión…</p> : (
            <>
              <p className="ng-label ng-section-label">Administración</p>
              <h1 className="ng-display">{isAuthenticated ? 'Acceso restringido' : 'Iniciar sesión'}</h1>
              {isAuthenticated ? (
                <>
                  <p>La cuenta {user?.email} no tiene acceso al panel.</p>
                  <FormLogin onLogin={loginWithGoogle}>Puedes entrar con otra cuenta de Google.</FormLogin>
                  <button type="button" className="ng-button ng-button--line" onClick={logout}>Cerrar sesión</button>
                </>
              ) : (
                <FormLogin onLogin={loginWithGoogle}>
                  Usa la cuenta de Google autorizada para entrar al panel.
                </FormLogin>
              )}
              <Link to="/" className="ng-text-link">Volver al inicio</Link>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminLoginPage;
