import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import Seo from '../components/Seo';
import { usePropiedades } from '../hooks/usePropiedades';
import { isLandOrFarmProperty } from '../utils/propertyTypeFilters';

const propertyTypes = ['casa', 'apartamento', 'terreno', 'finca', 'quinta', 'lote', 'bodega', 'hotel', 'propiedad comercial', 'edificio'];

function PropertiesPage() {
  const { propiedades, loading, error } = usePropiedades();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('categoria');
  const [filters, setFilters] = useState({ type: '', location: '', maxPrice: '' });

  const filtered = useMemo(
    () => propiedades.filter((property) => {
      const typeMatch = !filters.type || property.tipo === filters.type;
      const locationMatch = !filters.location || String(property.ubicacion || "").toLowerCase().includes(filters.location.toLowerCase());
      const priceMatch = !filters.maxPrice || Number(property.precio) <= Number(filters.maxPrice);
      const isLandOrFarmCategory = selectedCategory !== 'terrenos-fincas' || isLandOrFarmProperty(property);
      return typeMatch && locationMatch && priceMatch && isLandOrFarmCategory;
    }),
    [filters, propiedades, selectedCategory],
  );

  return (
    <section className="section-container">
      <Seo title="Propiedades | Norvin García" description="Explora casas, apartamentos, terrenos, bodegas, hoteles y propiedades comerciales en el catálogo premium de Norvin García." />
      <div className="ng-page-heading"><p className="ng-kicker"><i/> Portafolio inmobiliario / Nicaragua</p><h1 className="font-display text-4xl font-semibold">Encuentra tu próxima propiedad.</h1><p className="mt-3 text-slate-500">Explora el catálogo y filtra las oportunidades según lo que buscas.</p></div>
      <div className="glass ng-filter-bar mt-8 grid gap-4 rounded-2xl p-4 md:grid-cols-3">
        <select onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <option value="">Tipo</option>
          {propertyTypes.map((type) => <option key={type} value={type} className="capitalize">{type}</option>)}
        </select>
        <input placeholder="Ubicación" className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))} />
        <input type="number" placeholder="Precio máximo" className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))} />
      </div>
      {loading && <p className="mt-6 text-slate-500">Cargando propiedades...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}
      {!loading && !error && <p className="ng-results-count mt-6">{filtered.length} propiedades encontradas</p>}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}

export default PropertiesPage;
