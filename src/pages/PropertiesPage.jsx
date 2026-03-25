import { useMemo, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import Seo from '../components/Seo';
import { properties, propertyTypes } from '../data/properties';

function PropertiesPage() {
  const [filters, setFilters] = useState({ type: '', location: '', maxPrice: '' });

  const filtered = useMemo(
    () => properties.filter((property) => {
      const typeMatch = !filters.type || property.type === filters.type;
      const locationMatch = !filters.location || property.location.toLowerCase().includes(filters.location.toLowerCase());
      const priceMatch = !filters.maxPrice || property.price <= Number(filters.maxPrice);
      return typeMatch && locationMatch && priceMatch;
    }),
    [filters],
  );

  return (
    <section className="section-container">
      <Seo title="Propiedades | Norvin García" description="Explora casas, apartamentos, terrenos y bodegas en el catálogo premium de Norvin García." />
      <h1 className="font-display text-4xl font-semibold">Propiedades</h1>
      <div className="glass mt-8 grid gap-4 rounded-2xl p-4 md:grid-cols-3">
        <select onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <option value="">Tipo</option>
          {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <input placeholder="Ubicación" className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))} />
        <input type="number" placeholder="Precio máximo" className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))} />
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}

export default PropertiesPage;
