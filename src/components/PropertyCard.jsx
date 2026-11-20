import { Bath, BedDouble, Heart, MapPin, Ruler } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { applyImageFallback, formatUSD, isPositiveNumber, operationLabel, pricePerArea, propertyCover, propertyUnit } from '../utils/propertyPresentation';

function moveLight(event) {
  if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  card.style.setProperty('--card-x', `${x * 100}%`);
  card.style.setProperty('--card-y', `${y * 100}%`);
  card.style.setProperty('--card-rx', `${(0.5 - y) * 6}deg`);
  card.style.setProperty('--card-ry', `${(x - 0.5) * 6}deg`);
  card.style.setProperty('--card-pan-x', `${(0.5 - x) * 10}px`);
  card.style.setProperty('--card-pan-y', `${(0.5 - y) * 10}px`);
}

function resetLight(event) {
  for (const name of ['x', 'y', 'rx', 'ry', 'pan-x', 'pan-y']) {
    event.currentTarget.style.removeProperty(`--card-${name}`);
  }
}

export function PropertySkeleton() {
  return (
    <div className="ng-card-skeleton" aria-hidden="true">
      <div />
      <span />
      <span />
    </div>
  );
}

function PropertyCard({ property, index = 0, variant = 'standard' }) {
  const reducedMotion = useReducedMotion();
  const title = property.titulo || property.title || 'Propiedad';
  const unit = propertyUnit(property.unidadMedida);
  const perArea = pricePerArea(property);
  const area = isPositiveNumber(property.area) ? property.area : property.areaConstruida;

  return (
    <motion.article
      className={`ng-property-card ng-property-card--${variant}`}
      initial={reducedMotion ? false : { opacity: 0.55, clipPath: 'inset(0 0 6% 0)' }}
      whileInView={{ opacity: 1, clipPath: 'inset(-5px -5px -5px -5px)' }}
      viewport={{ once: true, amount: 0.13 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : Math.min(index, 3) * 0.055, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={moveLight}
      onPointerLeave={resetLight}
    >
      <Link to={`/propiedad/${property.id}`} state={{ property }} className="ng-card-link">
        <div className="ng-card-media">
          <img
            src={propertyCover(property)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={applyImageFallback}
          />
          <div className="ng-card-badges">
            <span>{operationLabel(property)}</span>
            {property.premium && <span>Destacada</span>}
          </div>
        </div>
        <div className="ng-card-body">
          {property.tipo && <p className="ng-card-type">{property.tipo}</p>}
          <h3>{title}</h3>
          <div className="ng-card-summary">
            <p className="ng-card-price">{formatUSD(property.precio)}</p>
            {property.ubicacion && <p className="ng-card-location"><MapPin size={14} aria-hidden="true" />{property.ubicacion}</p>}
          </div>
          <div className="ng-card-specs">
            {isPositiveNumber(area) && <span><Ruler size={15} aria-hidden="true" />{area} {unit.short}</span>}
            {isPositiveNumber(property.habitaciones) && <span><BedDouble size={16} aria-hidden="true" />{property.habitaciones} hab.</span>}
            {isPositiveNumber(property.banos) && <span><Bath size={15} aria-hidden="true" />{property.banos} baños</span>}
            {Boolean(property.likes?.length) && <span className="ng-card-likes" aria-label={`${property.likes.length} me gusta`}><Heart size={14} aria-hidden="true" />{property.likes.length}</span>}
          </div>
          <div className="ng-card-action-row">
            {perArea !== null && <p className="ng-card-unit">{formatUSD(perArea)} / {unit.long}</p>}
            <span className="ng-card-view" aria-hidden="true">VER</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default PropertyCard;
