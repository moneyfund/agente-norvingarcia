import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard, { PropertySkeleton } from './PropertyCard';

export default function PropertyRail({ properties, title, loading = false, lead = false, children }) {
  const rail = useRef(null);

  const scroll = (direction) => {
    if (!rail.current) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.current.scrollBy({ left: rail.current.clientWidth * 0.75 * direction, behavior: reduceMotion ? 'instant' : 'smooth' });
  };

  return (
    <>
      <div className="ng-section-heading">
        <h2 className="ng-display">{title}</h2>
        {properties.length > 1 && <div className="ng-rail-buttons">
          <button type="button" aria-label={`Anterior · ${title}`} className="ng-icon-button" onClick={() => scroll(-1)}><ChevronLeft size={20} /></button>
          <button type="button" aria-label={`Siguiente · ${title}`} className="ng-icon-button" onClick={() => scroll(1)}><ChevronRight size={20} /></button>
        </div>}
      </div>
      {children}
      <div
        ref={rail}
        className={`ng-property-rail${lead ? ' ng-property-rail--lead' : ''}`}
        role="region"
        aria-label={title}
        aria-busy={loading}
        tabIndex={properties.length > 1 ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          scroll(event.key === 'ArrowRight' ? 1 : -1);
        }}
      >
        {loading && Array.from({ length: 3 }, (_, index) => <PropertySkeleton key={index} />)}
        {!loading && properties.map((property, index) => (
          <PropertyCard key={property.id} property={property} index={index} variant={lead && index === 0 ? 'lead' : 'standard'} />
        ))}
      </div>
    </>
  );
}
