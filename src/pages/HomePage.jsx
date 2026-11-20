import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PremiumSearch from '../components/PremiumSearch';
import Seo from '../components/Seo';
import PropertyHero from '../components/PropertyHero';
import PropertyRail from '../components/PropertyRail';
import { usePropiedades } from '../hooks/usePropiedades';
import { isLandOrFarmProperty } from '../utils/propertyTypeFilters';

function HomeSearch() {
  const navigate = useNavigate();
  function search(values) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
    navigate({ pathname: '/propiedades', search: params.toString() });
  }
  return (
    <section id="buscar-propiedad" className="ng-finder ng-finder--premium" aria-label="Buscar propiedades">
      <div className="ng-wrap"><PremiumSearch home onSearch={search} /></div>
    </section>
  );
}

function HomeShowroom() {
  const { propiedades, loading, error } = usePropiedades();
  const [category, setCategory] = useState('seleccion');
  const land = category === 'tierra';
  const premium = propiedades.filter((p) => p.premium);
  const selected = land ? propiedades.filter(isLandOrFarmProperty) : premium.length ? premium : propiedades;
  return (
    <>
      <div className="ng-showroom-tabs" role="group" aria-label="Selección de propiedades">
        <button type="button" aria-pressed={!land} onClick={() => setCategory('seleccion')}>Selección general</button>
        <button type="button" aria-pressed={land} onClick={() => setCategory('tierra')}>Terrenos y fincas</button>
      </div>
      <PropertyRail title={land ? 'Terrenos y fincas' : premium.length ? 'Propiedades destacadas' : 'Propiedades recientes'} properties={selected.slice(0, 8)} loading={loading}>
        {!loading && !selected.length && <p className="ng-feed-message" role={error ? 'alert' : 'status'}>
          {error ? 'No se pudo cargar el inventario. Puedes volver a intentarlo desde el catálogo.' : 'Por el momento no hay propiedades en esta selección.'}
        </p>}
      </PropertyRail>
      <Link to={land ? '/propiedades?categoria=terrenos-fincas' : '/propiedades'} className="ng-text-link">Ver catálogo completo</Link>
    </>
  );
}

export default function HomePage() {
  const shelf = useRef(null);
  const [showInventory, setShowInventory] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setShowInventory(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShowInventory(true); observer.disconnect(); }
    }, { rootMargin: '180px' });
    observer.observe(shelf.current);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <Seo title="Norvin García | Real Estate en Nicaragua" description="Explora casas, terrenos y fincas en Nicaragua y recibe asesoría personal de Norvin García, agente de Diamantes Realty Group." />
      <PropertyHero />
      <HomeSearch />
      <section className="ng-wrap ng-showroom" ref={shelf} aria-label="Propiedades del portafolio">
        {showInventory ? <HomeShowroom /> : <h2 className="ng-display">Explora el portafolio</h2>}
      </section>
      <section className="ng-owner">
        <div className="ng-owner-photo">
          <img src="/brand/atelier.webp" srcSet="/brand/atelier-small.webp 720w, /brand/atelier.webp 1280w" sizes="(max-width: 760px) 100vw, 55vw" width="1280" height="853" alt="" loading="lazy" decoding="async" />
        </div>
        <div className="ng-owner-copy">
          <p className="ng-label">Para propietarios</p>
          <h2 className="ng-display">Tu propiedad,<br /><em>en el mercado.</em></h2>
          <p>Cuéntame dónde está y qué la hace especial. Trabajaremos en cómo presentarla, a qué compradores llegar y cómo organizar las visitas.</p>
          <Link to="/quieres-vender" className="ng-button ng-button--metal">Vender mi propiedad</Link>
          <Link to="/sobre-mi" className="ng-owner-about">Conocer al agente</Link>
        </div>
      </section>
    </>
  );
}
