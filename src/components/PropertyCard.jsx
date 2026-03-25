import { motion } from 'framer-motion';
import { BedDouble, Bath, Square, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';

const currency = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function PropertyCard({ property }) {
  return (
    <motion.article whileHover={{ y: -6 }} className="overflow-hidden rounded-2xl bg-white shadow-premium dark:bg-slate-900">
      <img src={`${property.images[0]}?auto=format&fit=crop&w=900&q=80`} alt={property.title} className="h-56 w-full object-cover" loading="lazy" />
      <div className="space-y-4 p-5">
        <div>
          <p className="text-2xl font-bold text-brand-500">{currency.format(property.price)}</p>
          <h3 className="mt-1 text-lg font-semibold">{property.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><MapPin size={14} />{property.location}</p>
        </div>
        <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1"><BedDouble size={14} /> {property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
          <span className="flex items-center gap-1"><Square size={14} /> {property.area}m²</span>
        </div>
        <Link to={`/propiedad/${property.id}`}><Button className="w-full">Ver más</Button></Link>
      </div>
    </motion.article>
  );
}

export default PropertyCard;
