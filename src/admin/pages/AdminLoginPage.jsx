import { Link, Navigate, useLocation } from 'react-router-dom';
import BrandMark, { Monogram } from '../../components/BrandMark';
import FormLogin from '../../components/FormLogin';
import Seo from '../../components/Seo';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { ALLOWED_ADMIN_EMAIL, isAllowedAdminEmail } from '../../config/admin';

function AdminLoginPage({ theme, toggleTheme }) {
  const { isAuthenticated, isAdmin, loading, loginWithGoogle, retryAdminAccess, adminStatus, logout, user } = useAuth();
  const { state } = useLocation();
  const from = state?.from;
  const adminPage = /^\/admin(?:\/|$)/.test(from?.pathname || '') && from.pathname !== '/admin/login';

  const authorizedEmail = isAllowedAdminEmail(user?.email);
  const accessMessage = {
    'wrong-account': 'Esta cuenta no está autorizada para administrar la plataforma.',
    'unverified-email': 'Google todavía no acredita la verificación de este correo.',
    'wrong-provider': 'El panel requiere una sesión iniciada con Google.',
    'token-error': 'No se pudo verificar la sesión con Firebase. Intenta verificarla nuevamente.',
  }[adminStatus] || 'Tu sesión aún no cumple los requisitos de acceso administrativo.';

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
                  <p role="alert">{accessMessage}</p>
                  <p>Cuenta actual: <strong>{user?.email}</strong></p>
                  <p>Cuenta autorizada: <strong>{ALLOWED_ADMIN_EMAIL}</strong></p>
                  {authorizedEmail && <button type="button" className="ng-button ng-button--wine" onClick={retryAdminAccess}>Volver a verificar acceso</button>}
                  <FormLogin onLogin={loginWithGoogle}>Puedes entrar con otra cuenta de Google.</FormLogin>
                  <button type="button" className="ng-button ng-button--line" onClick={logout}>Cerrar sesión</button>
                </>
              ) : (
                <FormLogin onLogin={loginWithGoogle}>
                  Usa la cuenta de Google autorizada: {ALLOWED_ADMIN_EMAIL}.
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
