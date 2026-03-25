import { Link, Navigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';

function AdminLoginPage() {
  const {
    isAuthenticated,
    loading,
    loginWithGoogle,
    logout,
    user,
  } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-premium">
          <h1 className="text-3xl font-bold">Acceso Admin</h1>
          <p className="text-sm text-slate-500">Inicia sesión únicamente con Google para entrar al panel.</p>
          <Button type="button" className="w-full" onClick={loginWithGoogle}>
            Iniciar sesión con Google
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-premium">
        <h1 className="text-3xl font-bold">Sesión activa</h1>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <img src={user.photoURL || 'https://via.placeholder.com/40'} alt={user.displayName || 'Usuario'} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold">{user.displayName || 'Usuario'}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Link to="/admin">
              <Button type="button" className="w-full">Ir al panel</Button>
            </Link>
            <Button type="button" variant="outline" className="w-full" onClick={logout}>Cerrar sesión</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
