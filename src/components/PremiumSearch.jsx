import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, MapPin } from 'lucide-react';

const types = ['casa', 'apartamento', 'terreno', 'finca', 'quinta', 'lote', 'bodega', 'hotel', 'propiedad comercial', 'edificio'];
const keys = ['ubicacion','tipo','operacion','precio'];

export default function PremiumSearch({ values = {}, onSearch, home = false }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const trigger = useRef(null);
  const count = keys.filter(key => Boolean(values[key])).length;
  const close = () => { setOpen(false); trigger.current?.focus({preventScroll:true}); };
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = Object.fromEntries(keys.map(key => [key, String(data.get(key) || '').trim()]));
    onSearch(next);
    close();
  }
  return (
    <div className="ng-premium-search" onKeyDown={event => { if(event.key === 'Escape' && open){event.stopPropagation();close();} }}>
      <button ref={trigger} type="button" className="ng-premium-search-trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
        <span className="ng-premium-search-icon"><Search size={25} aria-hidden="true" /></span>
        <span className="ng-premium-search-copy"><strong>Busca tu propiedad ideal</strong><small>{count ? `${count} ${count===1?'filtro activo':'filtros activos'} · Ajustar búsqueda` : 'Búsqueda avanzada'}</small></span>
        <span className="ng-premium-search-toggle"><SlidersHorizontal size={18} aria-hidden="true" /><ChevronDown size={17} aria-hidden="true" /></span>
      </button>
      <div id={id}>
        <AnimatePresence initial={false}>
          {open && <motion.div className="ng-premium-search-motion" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.28,ease:[.22,1,.36,1]}}>
            <form key={JSON.stringify(keys.map(key => values[key] || ''))} className="ng-premium-search-form" role="search" aria-label="Búsqueda avanzada de propiedades" onSubmit={submit}>
              <label><span>Tipo de operación</span><div className="ng-select"><select name="operacion" defaultValue={values.operacion || ''}><option value="">Venta y alquiler</option><option value="venta">Venta</option><option value="alquiler">Alquiler</option></select><ChevronDown size={15} aria-hidden="true" /></div></label>
              <label><span>Tipo de propiedad</span><div className="ng-select"><select name="tipo" defaultValue={values.tipo || ''}><option value="">Todos los tipos</option>{types.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase()+type.slice(1)}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></div></label>
              <label><span>Ubicación</span><div className="ng-premium-location"><MapPin size={17} aria-hidden="true"/><input name="ubicacion" type="search" defaultValue={values.ubicacion || ''} placeholder="Municipio o departamento" /></div></label>
              <label><span>Precio máximo (USD)</span><input name="precio" type="number" min="0" step="any" defaultValue={values.precio || ''} placeholder="Sin límite" /></label>
              <div className="ng-premium-search-actions">{home && <Link to="/mapa" className="ng-premium-map">Ver en el mapa</Link>}<button className="ng-button ng-button--wine" type="submit"><Search size={17} aria-hidden="true"/> Buscar propiedades</button></div>
            </form>
          </motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
