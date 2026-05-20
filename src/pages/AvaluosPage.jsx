import { useEffect, useMemo, useState } from 'react';
import PropertyTypeSelector from '../components/avaluos/PropertyTypeSelector';
import DynamicAvaluoForm from '../components/avaluos/DynamicAvaluoForm';
import AvaluoResultCard from '../components/avaluos/AvaluoResultCard';
import AvaluoHistory from '../components/avaluos/AvaluoHistory';
import { calcularAvaluo } from '../lib/avaluos/calculos';
import { getZonaReferencia } from '../services/zonas.service';
import { useAuth } from '../hooks/useAuth';
import { useAvaluos } from '../hooks/useAvaluos';

function AvaluosPage() {
  const [type, setType] = useState('');
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { loading, items, loadByUser, save } = useAvaluos();

  useEffect(() => {
    if (user?.uid) loadByUser(user.uid);
  }, [user?.uid, loadByUser]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const needle = search.toLowerCase();
    return items.filter((i) => [i.tipoPropiedad, i.ciudad, i.zona].some((v) => String(v || '').toLowerCase().includes(needle)));
  }, [items, search]);

  const handleSubmit = async (formData) => {
    const zonaData = await getZonaReferencia({ ciudad: formData.ciudad, zona: formData.zona });
    const calc = calcularAvaluo({ formData, zonaData });
    setResult(calc);

    await save({
      tipoPropiedad: type,
      usuarioId: user.uid,
      ciudad: formData.ciudad || '',
      municipio: formData.municipio || '',
      zona: formData.zona || '',
      caracteristicas: formData,
      coeficientesAplicados: calc.coeficientesAplicados,
      valorTerreno: calc.valorTerreno,
      valorConstruccion: calc.valorConstruccion,
      valorFinal: calc.valorFinal,
      observaciones: formData.observaciones || '',
    });

    await loadByUser(user.uid, search);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white">Sistema de Avalúos Inteligente</h1>
        <p className="mt-2 text-slate-300">Plataforma privada para estimar propiedades en Nicaragua.</p>

        <div className="mt-8">
          <PropertyTypeSelector selected={type} onSelect={setType} />
        </div>

        {type && <DynamicAvaluoForm type={type} onSubmit={handleSubmit} loading={loading} />}
        <AvaluoResultCard result={result} />

        <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <h3 className="font-semibold text-white">Buscador de avalúos</h3>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por tipo, ciudad o zona" className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100" />
        </section>

        <AvaluoHistory items={filtered} />
      </div>
    </main>
  );
}

export default AvaluosPage;
