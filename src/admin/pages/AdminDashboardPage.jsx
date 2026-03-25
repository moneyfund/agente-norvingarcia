import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPropiedades } from '../../services/propiedadesService';

function AdminDashboardPage() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPropiedades();
        setPropiedades(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const metrics = useMemo(() => ({
    total: propiedades.length,
    premium: propiedades.filter((p) => p.premium).length,
    recientes: propiedades.slice(0, 5),
  }), [propiedades]);

  if (loading) return <p>Cargando métricas...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total propiedades</p><p className="text-3xl font-bold">{metrics.total}</p></article>
        <article className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Premium</p><p className="text-3xl font-bold">{metrics.premium}</p></article>
        <article className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Últimas agregadas</p><p className="text-3xl font-bold">{metrics.recientes.length}</p></article>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Actividad reciente</h2>
          <Link to="/admin/propiedades" className="text-sm text-brand-500">Gestionar propiedades</Link>
        </div>
        <ul className="space-y-2">
          {metrics.recientes.map((property) => (
            <li key={property.id} className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium">{property.titulo}</p>
              <p className="text-sm text-slate-500">{property.ubicacion}</p>
            </li>
          ))}
          {!metrics.recientes.length && <li className="text-sm text-slate-500">Aún no hay propiedades.</li>}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
