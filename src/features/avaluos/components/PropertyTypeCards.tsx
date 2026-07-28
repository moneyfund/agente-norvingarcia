import { Check, Home, Map } from 'lucide-react';

const propertyTypes = [
  { key: 'terreno', label: 'Terreno', icon: Map, description: 'Ubicación, extensión, topografía, acceso, servicios, uso potencial y mercado.' },
  { key: 'casa', label: 'Casa', icon: Home, description: 'Terreno, construcción, estado, distribución, acabados y amenidades.' },
];

export function PropertyTypeCards({ value, onChange }) {
  return <section aria-labelledby="property-type-title" className="avaluo-type-section">
    <div className="avaluo-section-heading"><span>01</span><div><h2 id="property-type-title">Tipo de propiedad</h2><p>Selecciona la matriz técnica que corresponde al inmueble.</p></div></div>
    <div className="avaluo-property-types">{propertyTypes.map(({ key, label, icon: Icon, description }) => {
      const selected = value === key;
      return <button type="button" key={key} aria-pressed={selected} onClick={() => onChange(key)} className={`avaluo-property-card ${selected ? 'is-selected' : ''}`}>
        <span className="avaluo-property-icon"><Icon aria-hidden="true" /></span>
        <span><strong>{label}</strong><small>{description}</small></span>
        <span className="avaluo-property-check" aria-label={selected ? 'Seleccionado' : 'No seleccionado'}><Check /></span>
      </button>;
    })}</div>
  </section>;
}
