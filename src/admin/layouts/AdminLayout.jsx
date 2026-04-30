import { Building2, LayoutDashboard, ListChecks, LogOut, UserCircle } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/propiedades', label: 'Propiedades', icon: Building2 },
  { to: '/admin/listados', label: 'Listados', icon: ListChecks },
  { to: '/admin/perfil', label: 'Perfil', icon: UserCircle },
];

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="bg-slate-950 p-5 text-slate-100">
          <h1 className="text-xl font-bold">Norvin Admin</h1>
          <p className="mt-1 text-xs text-slate-400">Panel inmobiliario profesional</p>
          <nav className="mt-8 space-y-2">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-900'}`}
              >
                <Icon size={18} /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div>
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <p className="text-sm text-slate-500">Sesión activa</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100">
              <LogOut size={16} /> Salir
            </button>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
