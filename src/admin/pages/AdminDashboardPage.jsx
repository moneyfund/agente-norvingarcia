import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPropiedades } from '../../services/propiedadesService';
import { subscribeAvaluos } from '../../services/avaluos.service';
import DownloadAvaluoPdfButton from '../../components/avaluos/DownloadAvaluoPdfButton';
import DeleteAvaluoButton from '../../components/avaluos/DeleteAvaluoButton';

function AdminDashboardPage() {
  const [propiedades, setPropiedades] = useState([]);
  const [avaluos, setAvaluos] = useState([]);
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

  useEffect(() => {
    const unsubscribe = subscribeAvaluos(setAvaluos, console.error);
    return () => unsubscribe();
  }, []);

  const handleAvaluoDeleted = (id) => {
    setAvaluos((current) => current.filter((avaluo) => avaluo.id !== id));
  };

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
          <h2 className="text-xl font-semibold">Avalúos</h2>
          <p className="text-sm text-slate-500">Total: {avaluos.length}</p>
        </div>
        <ul className="space-y-2">
          {avaluos.slice(0, 10).map((avaluo) => (
            <li key={avaluo.id} className="rounded-xl bg-slate-50 p-3">
              <Link
                to={`/admin/avaluos/${avaluo.id}`}
                className="block"
                onClick={() => {
                  console.log('AVALUO CLICK', avaluo);
                  console.log('ID ENVIADO', avaluo.id);
                }}
              >
              <p className="font-medium">{avaluo.titulo}</p>
              <p className="text-sm text-slate-500">{avaluo.tipoPropiedad} · {avaluo.zona}</p>
              <p className="text-sm text-slate-500">{avaluo.createdAt ? new Date(avaluo.createdAt).toLocaleString() : 'Sin fecha'}</p>
              <p className="text-sm font-semibold text-emerald-700">${Number(avaluo.valorFinal || 0).toFixed(2)}</p>
              </Link>
              <div className="mt-2 flex flex-wrap gap-2"><DownloadAvaluoPdfButton avaluo={avaluo} /><DeleteAvaluoButton avaluo={avaluo} onDeleted={handleAvaluoDeleted} /></div>
            </li>
          ))}
          {!avaluos.length && <li className="text-sm text-slate-500">Aún no hay avalúos guardados.</li>}
        </ul>
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
