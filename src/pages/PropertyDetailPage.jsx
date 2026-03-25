import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Seo from '../components/Seo';
import { properties } from '../data/properties';

const money = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function PropertyDetailPage() {
  const { id } = useParams();
  const property = properties.find((item) => item.id === id) || properties[0];
  const [activeImage, setActiveImage] = useState(property.images[0]);
  const [open, setOpen] = useState(false);

  return (
    <section className="section-container">
      <Seo title={`${property.title} | Norvin García`} description={property.description} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <img src={`${activeImage}?auto=format&fit=crop&w=1200&q=80`} alt={property.title} className="h-96 w-full rounded-2xl object-cover shadow-premium" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {property.images.map((image) => (
              <button key={image} onClick={() => setActiveImage(image)}>
                <img src={`${image}?auto=format&fit=crop&w=500&q=70`} alt={property.title} className="h-24 w-full rounded-xl object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <p className="text-4xl font-bold text-brand-500">{money.format(property.price)}</p>
          <h1 className="font-display text-4xl font-semibold">{property.title}</h1>
          <p className="flex items-center gap-2 text-slate-500"><MapPin size={16} /> {property.location}</p>
          <p className="text-slate-600 dark:text-slate-300">{property.description}</p>
          <ul className="grid grid-cols-2 gap-3 text-sm">
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Habitaciones: {property.bedrooms}</li>
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Baños: {property.bathrooms}</li>
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Área: {property.area}m²</li>
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Tipo: {property.type}</li>
          </ul>
          <div className="flex gap-3">
            <a href="https://wa.me/18095551234" target="_blank" rel="noreferrer"><Button>Contactar por WhatsApp</Button></a>
            <Button variant="outline" onClick={() => setOpen(true)}>Solicitar visita</Button>
          </div>
        </div>
      </div>
      <div className="mt-10 overflow-hidden rounded-2xl shadow-premium">
        <MapContainer center={[property.lat, property.lng]} zoom={13} style={{ height: '360px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[property.lat, property.lng]}>
            <Popup>{property.title}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-2xl font-semibold">Agenda una visita</h2>
        <p className="mt-2 text-slate-500">Escríbenos por WhatsApp para coordinar fecha y hora.</p>
        <a href="https://wa.me/18095551234" target="_blank" rel="noreferrer" className="mt-4 inline-block"><Button>Ir a WhatsApp</Button></a>
      </Modal>
    </section>
  );
}

export default PropertyDetailPage;
