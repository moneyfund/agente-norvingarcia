import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Bath, Heart, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPrimaryImageUrl } from '../utils/propertyMedia';

const currency = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const measurementLabelByUnit = {
  varas: 'vara',
  metros: 'metro',
  manzanas: 'manzana',
};

function PropertyCard({ property, ctaLabel = 'Ver más' }) {
  const reduceMotion = useReducedMotion();
  const image = getPrimaryImageUrl(property) || '/img/placeholder-property.svg';
  const operationLabel = property.tipoOperacion === 'alquiler' ? 'En Alquiler' : 'En Venta';
  const unit = property.unidadMedida || 'varas';
  const unitLabel = measurementLabelByUnit[unit] || 'unidad';
  const hasValidArea = property.area !== null && property.area !== undefined && Number(property.area) > 0;
  const precioPorArea = property.precioPorArea ?? (hasValidArea ? Number(property.precio || 0) / Number(property.area) : null);

  return (
    <motion.article whileHover={reduceMotion ? undefined : {y:-5}} transition={{duration:.28}} className={`ng-property-card ${property.premium?'is-premium':''}`}>
      <Link className="ng-card-media" to={`/propiedad/${property.id}`} aria-label={`Ver ${property.titulo || 'propiedad'}`}>
        <img src={image} alt={property.titulo || 'Propiedad'} loading="lazy" decoding="async" onError={event=>{const fallback='/img/placeholder-property.svg';if(!event.currentTarget.src.endsWith(fallback))event.currentTarget.src=fallback;}}/>
        <div className="ng-card-badges"><span>{operationLabel}</span>{property.premium && <span>Premium</span>}</div>
        <span className="ng-card-arrow"><ArrowUpRight size={19}/></span>
      </Link>
      <div className="ng-card-body">
        <div className="ng-card-meta"><span>{property.tipo}</span><span><Heart size={13}/> {property.likes?.length || 0}</span></div>
        <p className="ng-card-price">{currency.format(property.precio || 0)}</p>
        <h3><Link to={`/propiedad/${property.id}`}>{property.titulo}</Link></h3>
        <p className="ng-card-location"><MapPin size={14}/>{property.ubicacion}</p>
        <div className="ng-card-specs">
          {Number(property.habitaciones)>0 && <span><BedDouble size={15}/> {property.habitaciones} hab.</span>}
          {Number(property.banos)>0 && <span><Bath size={15}/> {property.banos} baños</span>}
          {hasValidArea && <span>{property.area} {unit}</span>}
        </div>
        {hasValidArea && precioPorArea !== null && Number.isFinite(precioPorArea) && <p className="ng-card-unit">Por {unitLabel}: {currency.format(precioPorArea)}</p>}
        <Link to={`/propiedad/${property.id}`} className="ng-card-cta">{ctaLabel}<ArrowUpRight size={17}/></Link>
      </div>
    </motion.article>
  );
}

export default PropertyCard;
