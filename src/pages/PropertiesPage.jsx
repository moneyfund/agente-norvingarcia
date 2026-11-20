import { useDeferredValue, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, LayoutGrid, List, Map, Search } from 'lucide-react';
import PropertyCard, { PropertySkeleton } from '../components/PropertyCard';
import Seo from '../components/Seo';
import { usePropiedades } from '../hooks/usePropiedades';
import { isLandOrFarmProperty, normalizeText } from '../utils/propertyTypeFilters';

const propertyTypes = ['casa', 'apartamento', 'terreno', 'finca', 'quinta', 'lote', 'bodega', 'hotel', 'propiedad comercial', 'edificio'];
const filterKeys = ['tipo', 'ubicacion', 'precio', 'operacion', 'categoria'];

function PropertiesPage() {
  const { propiedades, loading, error } = usePropiedades();
  const [params, setParams] = useSearchParams();
  const category = params.get('categoria') === 'terrenos-fincas';
  const type = params.get('tipo') || '';
  const location = params.get('ubicacion') || '';
  const maxPrice = params.get('precio') || '';
  const operation = params.get('operacion') || '';
  const sort = params.get('orden') || '';
  const editorial = params.get('vista') === 'editorial';
  const deferredLocation = useDeferredValue(location);

  const filtered = useMemo(() => {
    const locationQuery = normalizeText(deferredLocation);
    const matches = propiedades.filter((property) => (
      (!type || normalizeText(property.tipo) === type)
      && (!locationQuery || normalizeText(property.ubicacion).includes(locationQuery))
      && (!maxPrice || Number(property.precio) <= Number(maxPrice))
      && (!operation || property.tipoOperacion === operation)
      && (!category || isLandOrFarmProperty(property))
    ));
    if (sort === 'precio-asc') matches.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (sort === 'precio-desc') matches.sort((a, b) => Number(b.precio) - Number(a.precio));
    return matches;
  }, [category, deferredLocation, maxPrice, operation, propiedades, sort, type]);

  const filterActive = filterKeys.some((key) => Boolean(params.get(key)));
  const setFilter = (key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  };

  const clearFilters = () => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      filterKeys.forEach((key) => next.delete(key));
      return next;
    }, { replace: true });
  };

  return (
    <>
      <Seo title={`${category ? 'Terrenos y fincas' : 'Propiedades en Nicaragua'} | Norvin García`} description="Explora casas, terrenos, fincas y propiedades comerciales con Norvin García." />
      <header className="ng-masthead">
        <div className="ng-wrap ng-masthead-inner">
          <p className="ng-label">Catálogo inmobiliario · Nicaragua</p>
          <h1 className="ng-display">{category ? 'Terrenos y fincas' : 'Propiedades'}</h1>
          <p>Encuentra propiedades en venta o alquiler por tipo, zona y presupuesto.</p>
        </div>
      </header>
      <section className="ng-wrap ng-catalog" aria-label="Explorar catálogo">
        <form className="ng-filter-bar" onSubmit={(event) => event.preventDefault()} aria-label="Filtros">
          <label className="ng-filter-field">
            <span>Ubicación</span>
            <div className="ng-search"><Search size={17} aria-hidden="true" /><input type="search" value={location} placeholder="Municipio o departamento" onChange={(event) => setFilter('ubicacion', event.target.value)} /></div>
          </label>
          <label className="ng-filter-field">
            <span>Tipo de propiedad</span>
            <div className="ng-select">
              <select value={type} onChange={(event) => setFilter('tipo', event.target.value)}>
                <option value="">Todos los tipos</option>
                {propertyTypes.map((item) => <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>)}
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </label>
          <label className="ng-filter-field">
            <span>Modalidad</span>
            <div className="ng-select">
              <select value={operation} onChange={(event) => setFilter('operacion', event.target.value)}>
                <option value="">Venta y alquiler</option>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </label>
          <label className="ng-filter-field">
            <span>Precio máximo (USD)</span>
            <input type="number" min="0" value={maxPrice} placeholder="Sin límite" onChange={(event) => setFilter('precio', event.target.value)} />
          </label>
        </form>
        <div className="ng-catalog-toolbar">
          <div className="ng-catalog-count">
            <p role="status">{loading ? 'Cargando propiedades…' : error ? 'Catálogo no disponible' : `${filtered.length} ${filtered.length === 1 ? 'propiedad' : 'propiedades'}`}</p>
            {filterActive && <button type="button" onClick={clearFilters}>Limpiar filtros</button>}
          </div>
          <div className="ng-catalog-settings">
            <label className="ng-select ng-sort">
              <span className="sr-only">Ordenar por</span>
              <select value={sort} onChange={(event) => setFilter('orden', event.target.value)}>
                <option value="">Más recientes</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </label>
            <div className="ng-catalog-layouts" role="group" aria-label="Vista del catálogo">
              <button type="button" className="ng-icon-button" aria-label="Vista de cuadrícula" aria-pressed={!editorial} onClick={() => setFilter('vista', '')}><LayoutGrid size={18} /></button>
              <button type="button" className="ng-icon-button" aria-label="Vista editorial" aria-pressed={editorial} onClick={() => setFilter('vista', 'editorial')}><List size={19} /></button>
            </div>
            <Link to="/mapa" className="ng-button ng-button--line"><Map size={17} aria-hidden="true" /> Mapa</Link>
          </div>
        </div>
        {error && <div className="ng-empty" role="alert"><h2>No se pudo cargar el catálogo</h2><p>Recarga la página para intentarlo de nuevo.</p><button type="button" className="ng-button ng-button--line" onClick={() => window.location.reload()}>Recargar</button></div>}
        {!loading && !error && !filtered.length && (
          <div className="ng-empty">
            <h2>{filterActive ? 'Sin resultados para esta búsqueda' : 'Aún no hay propiedades disponibles'}</h2>
            <p>{filterActive ? 'Amplía la zona, ajusta el presupuesto o vuelve al catálogo completo.' : 'Contáctame si buscas una propiedad en Nicaragua.'}</p>
            {filterActive ? <button type="button" className="ng-button ng-button--line" onClick={clearFilters}>Ver todas las propiedades</button> : <Link to="/contacto" className="ng-button ng-button--line">Contacto</Link>}
          </div>
        )}
        <div className={`ng-catalog-grid${editorial ? ' ng-catalog-grid--editorial' : ''}`} aria-busy={loading}>
          {loading && Array.from({ length: 6 }, (_, index) => <PropertySkeleton key={index} />)}
          {!loading && !error && filtered.map((property, index) => <PropertyCard key={property.id} property={property} index={index % 3} variant={editorial ? 'editorial' : 'standard'} />)}
        </div>
      </section>
    </>
  );
}

export default PropertiesPage;
