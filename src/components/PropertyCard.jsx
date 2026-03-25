import { motion } from 'framer-motion';
import { BedDouble, Bath, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';

const currency = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function PropertyCard({ property }) {
  const image = property.imagenes?.[0] || 'https://via.placeholder.com/800x600?text=Propiedad';

  return (
    <motion.article whileHover={{ y: -6 }} className="overflow-hidden rounded-2xl bg-white shadow-premium dark:bg-slate-900">
      <img src={image} alt={property.titulo} className="h-56 w-full object-cover" loading="lazy" />
      <div className="space-y-4 p-5">
        <div>
          <p className="text-2xl font-bold text-brand-500">{currency.format(property.precio || 0)}</p>
          <h3 className="mt-1 text-lg font-semibold">{property.titulo}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><MapPin size={14} />{property.ubicacion}</p>
        </div>
        <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1"><BedDouble size={14} /> {property.habitaciones ?? 0}</span>
          <span className="flex items-center gap-1"><Bath size={14} /> {property.banos ?? 0}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 capitalize dark:bg-slate-800">{property.tipo}</span>
        </div>
        <Link to={`/propiedad/${property.id}`}><Button className="w-full">Ver más</Button></Link>
      </div>
    </motion.article>
  );
}

export default PropertyCard;
