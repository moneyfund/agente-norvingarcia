import { Facebook, Instagram, Mail, MessageCircle, Music2, Phone } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../components/Button';
import Input from '../components/Input';
import Seo from '../components/Seo';

function ContactPage() {
  return (
    <section className="section-container">
      <Seo title="Contacto | Norvin García" description="Contacta con Norvin García por WhatsApp, email o redes sociales." />
      <h1 className="font-display text-4xl font-semibold">Contacto</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form className="space-y-4 rounded-2xl bg-white p-6 shadow-premium dark:bg-slate-900">
          <Input label="Nombre" placeholder="Tu nombre" />
          <Input label="Email" placeholder="norvingarcia220@gmail.com" type="email" />
          <Input label="Teléfono" placeholder="Tu teléfono" />
          <label>
            <span className="mb-2 block text-sm font-medium">Mensaje</span>
            <textarea rows="5" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <Button type="button">Enviar mensaje</Button>
        </form>
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-premium dark:bg-slate-900">
          <p className="flex items-center gap-2"><Phone size={16}/> +505 8744-6657</p>
          <p className="flex items-center gap-2"><Mail size={16}/> norvingarcia220@gmail.com</p>
          <div className="flex gap-3">
            {[MessageCircle, Facebook, Instagram, Music2].map((Icon, index) => <button key={index} className="rounded-full bg-slate-100 p-3 dark:bg-slate-800"><Icon size={16} /></button>)}
          </div>
          <div className="overflow-hidden rounded-2xl">
            <MapContainer center={[12.8654, -85.2072]} zoom={12} style={{ height: '260px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[18.4719, -69.9396]}>
                <Popup>Zona de cobertura de Norvin García</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
