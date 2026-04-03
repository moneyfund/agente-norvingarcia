import { useMemo, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import Seo from '../components/Seo';
import { usePropiedades } from '../hooks/usePropiedades';

const propertyTypes = ['casa', 'apartamento', 'terreno', 'bodega', 'hotel', 'propiedad comercial', 'edificio'];

function PropertiesPage() {
  const { propiedades, loading, error } = usePropiedades();
  const [filters, setFilters] = useState({ type: '', location: '', maxPrice: '' });

  const filtered = useMemo(
    () => propiedades.filter((property) => {
      const typeMatch = !filters.type || property.tipo === filters.type;
      const locationMatch = !filters.location || property.ubicacion.toLowerCase().includes(filters.location.toLowerCase());
      const priceMatch = !filters.maxPrice || Number(property.precio) <= Number(filters.maxPrice);
      return typeMatch && locationMatch && priceMatch;
    }),
    [filters, propiedades],
  );

  return (
    <section className="section-container">
      <Seo title="Propiedades | Norvin García" description="Explora casas, apartamentos, terrenos, bodegas, hoteles y propiedades comerciales en el catálogo premium de Norvin García." />
      <h1 className="font-display text-4xl font-semibold">Propiedades</h1>
      <div className="glass mt-8 grid gap-4 rounded-2xl p-4 md:grid-cols-3">
        <select onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <option value="">Tipo</option>
          {propertyTypes.map((type) => <option key={type} value={type} className="capitalize">{type}</option>)}
        </select>
        <input placeholder="Ubicación" className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))} />
        <input type="number" placeholder="Precio máximo" className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))} />
      </div>
      {loading && <p className="mt-6 text-slate-500">Cargando propiedades...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}

export default PropertiesPage;
