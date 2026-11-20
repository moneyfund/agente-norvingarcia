import { useEffect, useMemo } from 'react';
import { ArrowUpRight, Building2, KeyRound, MapPinned, Trees } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Seo from '../components/Seo';
import PropertyHero from '../components/PropertyHero';
import PropertyRail from '../components/PropertyRail';
import { usePropiedades } from '../hooks/usePropiedades';
import { isLandOrFarmProperty } from '../utils/propertyTypeFilters';
import { normalizePropertyMedia } from '../utils/propertyMedia';
import { applyImageFallback, optimizedPropertyPhoto } from '../utils/propertyPresentation';

const browse = [
  { to: '/propiedades?operacion=venta', label: 'Comprar', icon: Building2 },
  { to: '/propiedades?operacion=alquiler', label: 'Alquilar', icon: KeyRound },
  { to: '/propiedades?categoria=terrenos-fincas', label: 'Terrenos y fincas', icon: Trees },
  { to: '/mapa', label: 'Explorar el mapa', icon: MapPinned },
];

const services = [
  { to: '/quieres-vender', title: 'Vender mi propiedad', description: 'Estrategia de salida al mercado, promoción y acompañamiento en la negociación.' },
  { to: '/avaluos', title: 'Avalúos inmobiliarios', description: 'Herramientas profesionales para analizar el valor de un inmueble.' },
  { to: '/educacion', title: 'Educación inmobiliaria', description: 'Guías para revisar documentos, comparar inmuebles y preparar una compra.' },
];

function HomePage() {
  const { propiedades, loading, error } = usePropiedades();
  const onSignatureReady = useOutletContext();
  const reducedMotion = useReducedMotion();
  useEffect(() => { onSignatureReady?.(); }, [onSignatureReady]);

  const featured = useMemo(() => {
    const premium = propiedades.filter((property) => property.premium);
    return premium.length ? premium : propiedades;
  }, [propiedades]);

  const land = useMemo(() => (
    propiedades.filter(isLandOrFarmProperty)
      .sort((a, b) => Number(Boolean(b.premium)) - Number(Boolean(a.premium)))
      .slice(0, 6)
  ), [propiedades]);

  const landPhoto = land.reduce((current, property) => {
    if (current) return current;
    const images = normalizePropertyMedia(property).filter(({ type }) => type === 'image');
    const villaPhoto = images.find(({ url }) => url.split('?')[0].endsWith('/EpGVVMg.png'));
    return villaPhoto
      ? { src: '/img/villa-clara.webp', property }
      : null;
  }, null) || land.flatMap((property) => {
    const photo = normalizePropertyMedia(property).find(({ type }) => type === 'image');
    return photo ? [{ src: optimizedPropertyPhoto(photo.url), property }] : [];
  })[0];

  return (
    <>
      <Seo title="Norvin García | Bienes raíces en Nicaragua" description="Compra, vende e invierte en propiedades en Nicaragua con la asesoría de Norvin García, agente de Diamantes Realty Group." />
      <PropertyHero properties={propiedades} loading={loading} />
      <nav className="ng-browse" aria-label="Explorar propiedades por objetivo">
        <div className="ng-wrap ng-browse-inner">
          {browse.map(({ to, label, icon: Icon }) => (
            <Link to={to} key={to}>
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
              <ArrowUpRight size={16} className="ng-browse-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </nav>

      <section className="ng-wrap ng-showroom">
        <p className="ng-label ng-section-label">Portafolio inmobiliario</p>
        <PropertyRail title="Propiedades destacadas" properties={featured} loading={loading} lead>
          {!loading && !featured.length && <p className="ng-feed-message" role={error ? 'alert' : undefined}>
            {error ? 'No pudimos cargar las propiedades. Intenta abrir el catálogo.' : 'Aún no hay propiedades destacadas disponibles.'}
          </p>}
        </PropertyRail>
        <Link to="/propiedades" className="ng-button ng-button--line">Ver todo el catálogo <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </section>

      {land.length > 0 && (
        <section className="ng-land" aria-label="Terrenos y fincas">
          <div className="ng-wrap ng-land-feature">
            <div className="ng-land-copy">
              <p className="ng-label">Oportunidades de inversión</p>
              <h2 className="ng-display">Terrenos<br /><em>y fincas.</em></h2>
              <p>Explora terrenos para construir, fincas productivas y quintas en Nicaragua.</p>
              <Link to="/propiedades?categoria=terrenos-fincas" className="ng-button ng-button--metal">Ver terrenos y fincas</Link>
            </div>
            {landPhoto && (
              <motion.figure
                initial={reducedMotion ? false : { clipPath: 'inset(0 0 7% 0)', opacity: 0.65 }}
                whileInView={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="ng-land-photo"
              >
                <img src={landPhoto.src} alt="" loading="lazy" decoding="async" onError={applyImageFallback} />
                <figcaption><Link to={`/propiedad/${landPhoto.property.id}`} state={{ property: landPhoto.property }}>{landPhoto.property.titulo} <ArrowUpRight size={17} aria-hidden="true" /></Link></figcaption>
              </motion.figure>
            )}
          </div>
          <div className="ng-wrap ng-land-rail">
            <PropertyRail title="Terrenos y fincas destacadas" properties={land} />
          </div>
        </section>
      )}

      <section className="ng-wrap ng-advisory">
        <div className="ng-advisory-copy">
          <p className="ng-label ng-section-label">Asesoría inmobiliaria</p>
          <h2 className="ng-display">De la búsqueda <em>a la decisión.</em></h2>
          <p>Te acompaño a entender el mercado, evaluar tus opciones y avanzar con claridad en cada etapa.</p>
          <Link to="/sobre-mi" className="ng-text-link">Conoce a Norvin García <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="ng-advisory-links">
          {services.map(({ to, title, description }) => (
            <Link to={to} key={to}>
              <div><h3>{title}</h3><p>{description}</p></div>
              <ArrowUpRight size={23} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
